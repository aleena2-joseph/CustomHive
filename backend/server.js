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
const validator = require("validator");

const app = express();
const port = process.env.PORT || 5000;

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
    },
    name: "sessionId",
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

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
app.post("/add_user", async (req, res) => {
  const { name, email, password, phone, role_id = 3 } = req.body;

  // Validation: Check if all fields are provided
  if (!name || !email || !password || !phone) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  if (name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Name cannot be empty or just spaces",
    });
  }

  const nameRegex = /^[A-Za-z\s]+$/;
  if (!nameRegex.test(name.trim())) {
    return res.status(400).json({
      success: false,
      message: "Name can only contain letters and spaces",
    });
  }

  // Email validation
  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  // Password validation: Must contain at least one number, one special character, and no spaces
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message:
        "Password must be at least 6 characters long, include at least one number, one special character, and have no spaces",
    });
  }

  // Phone number validation
  const phoneRegex = /^[6789]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      success: false,
      message: "Phone number must be 10 digits and start with 6, 7, 8, or 9",
    });
  }

  try {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql =
      "INSERT INTO tbl_users (name, email, password, phone, role_id) VALUES (?, ?, ?, ?, ?)";

    db.query(
      sql,
      [name, email, hashedPassword, phone, role_id],
      (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            message: "Database error: " + err.message,
          });
        }

        return res.json({
          success: true,
          message: "User added successfully",
          id: result.insertId,
        });
      }
    );
  } catch (error) {
    console.error("Error hashing password:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});
// Update User Status API
app.put("/update_status/:email", (req, res) => {
  const { email } = req.params;
  const { status } = req.body;

  const sql = "UPDATE tbl_users SET status = ? WHERE email = ?";
  db.query(sql, [status, email], (err, result) => {
    if (err) {
      console.error("Error updating status:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "Status updated successfully" });
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

      // Compare hashed password with user input
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Generate JWT token
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

  // Password validation regex
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "New password is required",
    });
  }

  if (password.includes(" ")) {
    return res.status(400).json({
      success: false,
      message: "Password must not contain spaces",
    });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message:
        "Password must be at least 6 characters long, contain at least one number, one special character, and one letter",
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
      res.clearCookie("sessionId");
      res.json({ message: "Logged out successfully" });
    });
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).redirect("http://localhost:5173/login");
});

// Add a new business type
app.post("/add-business-type", (req, res) => {
  const { type_name } = req.body;

  if (!type_name) {
    return res.status(400).json({ error: "Business type name is required" });
  }

  const sql = "INSERT INTO business_types (type_name) VALUES (?)";
  db.query(sql, [type_name], (err, result) => {
    if (err) {
      console.error("Error inserting business type:", err);
      return res
        .status(500)
        .json({ error: "Duplicate entry not allowed or database error" });
    }

    // Fetch all business types in ascending order
    db.query(
      "SELECT * FROM business_types ORDER BY business_id ASC",
      (err, businessTypes) => {
        if (err) {
          console.error("Error fetching business types:", err);
          return res
            .status(500)
            .json({ error: "Error retrieving business types" });
        }
        res.status(201).json({
          message: "Business type added successfully!",
          business_id: result.insertId,
          businessTypes,
        });
      }
    );
  });
});

// Get all business types in ascending order
app.get("/api/business-types", (req, res) => {
  const sql = "SELECT * FROM business_types ORDER BY business_id ASC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching business types:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Update Business Type
app.put("/update-business-type/:business_id", (req, res) => {
  const { business_id } = req.params;
  const { type_name } = req.body;

  if (!type_name) {
    return res.status(400).json({ error: "Business type name is required" });
  }

  const sql = "UPDATE business_types SET type_name = ? WHERE business_id = ?";
  db.query(sql, [type_name, business_id], (err, result) => {
    if (err) {
      console.error("Error updating business type:", err);
      return res.status(500).json({ error: "Error updating business type" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Business type not found" });
    }
    res.json({ message: "Business type updated successfully!" });
  });
});
// Endpoint to add a category
app.post("/api/add-category", (req, res) => {
  const { business_id, category_name, description } = req.body;

  if (!business_id || !category_name) {
    return res
      .status(400)
      .json({ error: "Business type and category name are required" });
  }

  const sql =
    "INSERT INTO categories (business_id, category_name, description) VALUES (?, ?, ?)";
  db.query(
    sql,
    [business_id, category_name, description || ""],
    (err, result) => {
      if (err) {
        console.error("Error inserting category:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res
        .status(201)
        .json({ message: "Category added successfully!", id: result.insertId });
    }
  );
});

// Fetch all categories
app.get("/api/categories", (req, res) => {
  const sql = `
    SELECT c.category_id, c.category_name, c.description, b.business_id, b.type_name 
    FROM categories c
    JOIN business_types b ON c.business_id = b.business_id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    res.json({ data: results });
  });
});

// Add subcategory
app.post("/api/add-subcategory", (req, res) => {
  const { category_id, subcategory_name, description } = req.body;

  if (!category_id || !subcategory_name) {
    return res
      .status(400)
      .json({ error: "Category and subcategory name are required" });
  }

  const sql =
    "INSERT INTO subcategories (category_id, subcategory_name, description) VALUES (?, ?, ?)";
  db.query(
    sql,
    [category_id, subcategory_name, description || ""],
    (err, result) => {
      if (err) {
        console.error("Error inserting subcategory:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.status(201).json({
        message: "Subcategory added successfully!",
        id: result.insertId,
      });
    }
  );
});

// Fetch all subcategories
app.get("/api/subcategories", (req, res) => {
  const sql = `
    SELECT s.subcategory_id, s.subcategory_name, s.description, c.category_id, c.category_name 
    FROM subcategories s
    JOIN categories c ON s.category_id = c.category_id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    res.json({ data: results });
  });
});
// Fetch products
app.get("/api/products", (req, res) => {
  db.query("SELECT * FROM Products", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Fetch subcategories
app.get("/api/subcategories", (req, res) => {
  db.query("SELECT * FROM subcategories", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Add a new product
app.post("/api/products", (req, res) => {
  const { name, description, price, subcategory_id } = req.body;
  const product_id = uuidv4();

  db.query(
    "INSERT INTO Products (Product_id, Product_name, Description, Price, Subcategory_id) VALUES (?, ?, ?, ?, ?)",
    [product_id, name, description, price, subcategory_id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.json({
        Product_id: product_id,
        name,
        description,
        price,
        subcategory_id,
        Status: 1,
      });
    }
  );
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
