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

// 1. Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
    },
    name: "sessionId",
  })
);

// 2. Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// 3. CORS Configuration
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// 4. Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Passport Configuration
passport.serializeUser((user, done) => {
  done(null, user.email);
});

passport.deserializeUser((email, done) => {
  db.query(
    "SELECT * FROM tbl_users WHERE email = ?",
    [email],
    (err, results) => {
      if (err) return done(err);
      done(null, results[0]);
    }
  );
});

// Google Strategy Configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        if (!profile.emails || !profile.emails[0].value) {
          return done(new Error("No email found in Google profile"));
        }

        const userEmail = profile.emails[0].value;

        db.query(
          "SELECT * FROM tbl_users WHERE email = ?",
          [userEmail],
          async (err, results) => {
            if (err) {
              console.error("Database error:", err);
              return done(err);
            }

            try {
              if (results.length > 0) {
                const user = results[0];
                await new Promise((resolve, reject) => {
                  db.query(
                    "UPDATE tbl_users SET last_login = NOW() WHERE email = ?",
                    [user.id],
                    (err) => {
                      if (err) reject(err);
                      else resolve();
                    }
                  );
                });
                return done(null, user);
              } else {
                const newUser = {
                  name: profile.displayName,
                  email: userEmail,
                  role_id: 3,
                  status: 1,
                  created_at: new Date(),
                  google_id: profile.id,
                };

                db.query(
                  "INSERT INTO tbl_users SET ?",
                  newUser,
                  (err, result) => {
                    if (err) return done(err);
                    newUser.id = result.insertId;
                    return done(null, newUser);
                  }
                );
              }
            } catch (error) {
              return done(error);
            }
          }
        );
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Auth Status Endpoint
app.get("/auth/status", (req, res) => {
  if (req.isAuthenticated()) {
    const redirectUrl = getRedirectUrl(req.user.role_id);
    res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role_id: req.user.role_id,
      },
      redirectUrl,
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Google Auth Routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  (req, res, next) => {
    passport.authenticate("google", {
      failureRedirect: "http://localhost:5173/login",
      failureFlash: true,
    })(req, res, next);
  },
  (req, res) => {
    try {
      const redirectUrl = getRedirectUrl(req.user.role_id);
      res.redirect(`http://localhost:5173${redirectUrl}`);
    } catch (error) {
      console.error("Redirect error:", error);
      res.redirect("http://localhost:5173/login");
    }
  }
);

// Helper function to get redirect URL based on role
function getRedirectUrl(roleId) {
  switch (parseInt(roleId)) {
    case 1:
      return "/admin";
    case 2:
      return "/business_profile";
    case 3:
      return "/userDashboard";
    default:
      return "/dashboard";
  }
}

// Get all users except admins
app.get("/users", (req, res) => {
  const sql = "SELECT * FROM tbl_users WHERE role_id != 1";
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
  const { name, email, password, phone, role_id = 3 } = req.body;
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

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide both email and password",
    });
  }

  try {
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

      const token = jwt.sign(
        {
          email: user.email,
          role_id: user.role_id,
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );

      const redirectUrl = getRedirectUrl(parseInt(user.role_id));

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

        const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        const tokenExpiry = new Date(Date.now() + 3600000);

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

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

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

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
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("sessionId"); // Adjust the cookie name if needed
      res.json({ message: "Logged out successfully" });
    });
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).redirect("http://localhost:5173/login");
});
app.post("/add-business-type", (req, res) => {
  const { type_name } = req.body;

  if (!type_name) {
    return res.status(400).json({ error: "Business type name is required" });
  }

  const sql = "INSERT INTO business_type (type_name) VALUES (?)";
  db.query(sql, [type_name], (err, result) => {
    if (err) {
      console.error("Error inserting business type:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({
      message: "Business type added successfully!",
      id: result.insertId,
    });
  });
});
//Get business type

app.get("/api/business-types", (req, res) => {
  const sql = "SELECT * FROM business_type";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching business types:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
