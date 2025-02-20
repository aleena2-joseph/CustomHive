const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "custom_hive",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to MySQL database");
});
// Get all users except role_id = 1 (admin)
app.get("/users", (req, res) => {
  const sql = "SELECT * FROM tbl_users WHERE role_id != 1"; // Exclude admin users
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(result);
  });
});

// Add new user
app.post("/add_user", (req, res) => {
  const { name, email, password, phone, role_id = 3 } = req.body; // Default role_id to 3 (regular user)
  if (!name || !email || !password || !phone) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }
  const sql =
    "INSERT INTO tbl_users (name, email, password, phone, role_id) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [name, email, password, phone, role_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database error: " + err.message });
    }
    return res.json({
      success: true,
      message: "User added successfully",
      id: result.insertId,
    });
  });
});

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide both email and password",
    });
  }

  try {
    // First, check if user exists and is active
    const sql = "SELECT * FROM tbl_users WHERE email = ? AND status = '1'";

    db.query(sql, [email], async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          message: "An error occurred during login",
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const user = results[0];

      // Compare passwords
      // const isMatch = await bcrypt.compare(password, user.password);
      // if (!isMatch) {
      //   return res.status(401).json({
      //     success: false,
      //     message: "Invalid email or password",
      //   });
      // }

      // Generate JWT token
      const token = jwt.sign(
        {
          email: user.email,
          role_id: user.role_id,
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );

      // Determine redirect URL based on user role
      let redirectUrl = "/dashboard";
      switch (parseInt(user.role_id)) {
        case 1:
          redirectUrl = "/admin";
          break;
        case 2:
          redirectUrl = "/business_profile";
          break;
        case 3:
          redirectUrl = "/userDashboard";
          break;
        default:
          redirectUrl = "/dashboard";
      }

      // Send success response
      return res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          name: user.name,
          email: user.email,
          role_id: parseInt(user.role_id),
        },
        redirectUrl,
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during login",
    });
  }
});

// Forgot password route
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  try {
    // Check if user exists
    db.query(
      "SELECT * FROM tbl_users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            message: "Server error",
          });
        }

        if (results.length === 0) {
          return res.status(404).json({
            success: false,
            message: "No account found with this email",
          });
        }

        // Generate reset token
        const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        // Save token in database
        const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        db.query(
          "UPDATE tbl_users SET reset_token = ?, token_expiry = ? WHERE email = ?",
          [resetToken, tokenExpiry, email],
          async (updateErr) => {
            if (updateErr) {
              console.error("Token update error:", updateErr);
              return res.status(500).json({
                success: false,
                message: "Error saving reset token",
              });
            }

            // Send email
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
            });

            const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

            const mailOptions = {
              from: process.env.EMAIL_USER,
              to: email,
              subject: "Password Reset Request",
              html: `
              <h2>Password Reset Request</h2>
              <p>Click the link below to reset your password:</p>
              <a href="${resetLink}">${resetLink}</a>
              <p>This link will expire in 1 hour.</p>
              <p>If you didn't request this, please ignore this email.</p>
            `,
            };

            transporter.sendMail(mailOptions, (emailErr) => {
              if (emailErr) {
                console.log(process.env.EMAIL_USER);
                console.log(process.env.EMAIL_PASS);
                console.error("Email sending error:", emailErr);
                return res.status(500).json({
                  success: false,
                  message: "Error sending reset email",
                });
              }

              res.json({
                success: true,
                message: "Password reset link sent to your email",
              });
            });
          }
        );
      }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Reset password route
app.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "New password is required",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check token in database
    db.query(
      "SELECT * FROM tbl_users WHERE email = ? AND reset_token = ? AND token_expiry > NOW()",
      [decoded.email, token],
      async (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            message: "Server error",
          });
        }

        if (results.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid or expired reset token",
          });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update password and clear reset token
        db.query(
          "UPDATE tbl_users SET password = ?, reset_token = NULL, token_expiry = NULL WHERE email = ?",
          [hashedPassword, decoded.email],
          (updateErr) => {
            if (updateErr) {
              console.error("Password update error:", updateErr);
              return res.status(500).json({
                success: false,
                message: "Error updating password",
              });
            }

            res.json({
              success: true,
              message: "Password reset successful",
            });
          }
        );
      }
    );
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(400).json({
      success: false,
      message: "Invalid or expired reset token",
    });
  }
});

//user google sign in
app.use(
  session({ secret: "123456789", resave: false, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      const userEmail = profile.emails[0].value;
      //
      db.query(
        "SELECT * FROM tbl_users WHERE email = ?",
        [userEmail],
        (err, results) => {
          if (err) {
            return done(err);
          }
          if (results.length > 0) {
            // User exists, return user
            return done(null, results[0]);
          } else {
            // Create a new user record. You can add additional fields if needed.
            const newUser = {
              name: profile.displayName,
              email: userEmail,
              // Optionally, you can store the googleId or other info:
              // googleId: profile.id,
            };
            db.query("INSERT INTO tbl_users SET ?", newUser, (err, result) => {
              if (err) {
                return done(err);
              }
              newUser.id = result.insertId;
              return done(null, newUser);
            });
          }
        }
      );
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Google Auth Routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("http://localhost:5173/login"); // Change port if needed for your Vite server
  }
);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
