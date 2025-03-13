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
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const path = require("path");

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
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); //image

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

app.get("/api/session", (req, res) => {
  if (req.isAuthenticated() && req.user) {
    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role_id: req.user.role_id,
      },
    });
  } else if (req.session && req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.json({ user: null });
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
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({
//       success: false,
//       message: "Please provide both email and password",
//     });
//   }

//   try {
//     const sql = "SELECT * FROM tbl_users WHERE email = ? AND status = '1'";

//     db.query(sql, [email], async (err, results) => {
//       if (err) {
//         console.error("Database error:", err);
//         return res.status(500).json({
//           success: false,
//           message: "An error occurred during login",
//         });
//       }

//       if (results.length === 0) {
//         return res.status(401).json({
//           success: false,
//           message: "Invalid email or password",
//         });
//       }

//       const user = results[0];

//       // Compare hashed password with user input
//       const passwordMatch = await bcrypt.compare(password, user.password);
//       if (!passwordMatch) {
//         return res.status(401).json({
//           success: false,
//           message: "Invalid email or password",
//         });
//       }

//       // Generate JWT token
//       const token = jwt.sign(
//         {
//           email: user.email,
//           role_id: user.role_id,
//         },
//         process.env.JWT_SECRET || "your-secret-key",
//         { expiresIn: "24h" }
//       );

//       const redirectUrl = getRedirectUrl(parseInt(user.role_id));

//       return res.json({
//         success: true,
//         message: "Login successful",
//         token,
//         user: {
//           name: user.name,
//           email: user.email,
//           role_id: parseInt(user.role_id),
//         },
//         redirectUrl,
//       });
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "An error occurred during login",
//     });
//   }
// });
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

      // Set user in session - FIXED
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: parseInt(user.role_id),
      };

      // Save the session
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
        }

        const redirectUrl = getRedirectUrl(parseInt(user.role_id));

        return res.json({
          success: true,
          message: "Login successful",
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role_id: parseInt(user.role_id),
          },
          redirectUrl,
        });
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
  const { business_id } = req.query; // Get business_id from query parameters

  let sql = `
    SELECT 
      c.category_id, 
      c.category_name, 
      c.description, 
      c.min_price, 
      c.max_price, 
      b.business_id, 
      b.type_name
    FROM categories c
    JOIN business_types b ON c.business_id = b.business_id
  `;

  // If business_id is provided, filter by it
  if (business_id) {
    sql += ` WHERE c.business_id = ?`;
  }

  db.query(sql, business_id ? [business_id] : [], (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    res.json({ data: results });
  });
});

// app.get("/api/categories", (req, res) => {
//   const { business_id, category_ids } = req.query; // Get business_id and selected categories

//   let sql = `
//     SELECT c.category_id, c.category_name, c.description, b.business_id, b.type_name
//     FROM categories c
//     JOIN business_types b ON c.business_id = b.business_id
//   `;

//   let params = [];
//   let conditions = [];

//   if (business_id) {
//     conditions.push("c.business_id = ?");
//     params.push(business_id);
//   }

//   if (category_ids) {
//     const categoryArray = category_ids.split(",").map(Number); // Convert to array of numbers
//     const placeholders = categoryArray.map(() => "?").join(",");
//     conditions.push(`c.category_id IN (${placeholders})`);
//     params.push(...categoryArray);
//   }

//   // Add WHERE clause only if conditions exist
//   if (conditions.length) {
//     sql += " WHERE " + conditions.join(" AND ");
//   }

//   db.query(sql, params, (err, results) => {
//     if (err) {
//       console.error("Database Error:", err);
//       return res.status(500).json({ message: "Internal Server Error" });
//     }
//     res.json({ data: results });
//   });
// });

app.put("/api/update-category/:id", (req, res) => {
  const { id } = req.params;
  const { business_id, category_name, description, min_price, max_price } =
    req.body;

  // Validate required fields
  if (
    !business_id ||
    !category_name ||
    min_price === undefined ||
    max_price === undefined
  ) {
    return res.status(400).json({
      error:
        "Business type, category name, min_price, and max_price are required",
    });
  }

  if (parseFloat(min_price) < 0 || parseFloat(max_price) < 0) {
    return res.status(400).json({ error: "Price range cannot be negative." });
  }

  if (parseFloat(min_price) > parseFloat(max_price)) {
    return res
      .status(400)
      .json({ error: "min_price cannot be greater than max_price." });
  }

  // First check if the category exists
  const checkSql = "SELECT * FROM categories WHERE category_id = ?";
  db.query(checkSql, [id], (checkErr, checkResults) => {
    if (checkErr) {
      console.error("Database Error:", checkErr);
      return res.status(500).json({ error: "Database error" });
    }

    if (checkResults.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Update the category including min_price and max_price
    const updateSql = `
      UPDATE categories 
      SET business_id = ?, category_name = ?, description = ?, min_price = ?, max_price = ? 
      WHERE category_id = ?
    `;

    db.query(
      updateSql,
      [business_id, category_name, description || "", min_price, max_price, id],
      (updateErr, updateResult) => {
        if (updateErr) {
          console.error("Error updating category:", updateErr);
          return res.status(500).json({ error: "Database error" });
        }

        res.json({
          message: "Category updated successfully!",
          category: {
            category_id: id,
            business_id,
            category_name,
            description,
            min_price,
            max_price,
          },
        });
      }
    );
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

// Fetch subcategories with category_id filtering
app.get("/api/subcategories", (req, res) => {
  const { category_id } = req.query; // Get category_id from query parameters

  let sql = `
    SELECT s.subcategory_id, s.subcategory_name, s.description, c.category_id, c.category_name 
    FROM subcategories s
    JOIN categories c ON s.category_id = c.category_id
  `;

  // If category_id is provided, filter by it
  if (category_id) {
    sql += ` WHERE s.category_id = ?`;
  }

  db.query(sql, category_id ? [category_id] : [], (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    res.json({ data: results });
  });
});
// Set up Multer storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Files will be saved in the "uploads" folder
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Generate a unique file name
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + uuidv4() + ext);
  },
});
app.put("/api/update-subcategory/:id", (req, res) => {
  const { id } = req.params;
  const { subcategory_name, description } = req.body;

  if (!subcategory_name) {
    return res.status(400).json({ error: "Subcategory name is required" });
  }

  const sql =
    "UPDATE subcategories SET subcategory_name = ?, description = ? WHERE subcategory_id = ?";

  db.query(sql, [subcategory_name, description || "", id], (err, result) => {
    if (err) {
      console.error("Error updating subcategory:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Subcategory not found" });
    }

    res.json({
      message: "Subcategory updated successfully!",
      id: id,
    });
  });
});

// Initialize Multer with the storage configuration
const upload = multer({ storage: storage });

// Add a new product

app.post("/api/products", upload.single("image"), (req, res) => {
  console.log("Request body:", req.body);

  const { name, description, price, subcategory_id, business_id, email } =
    req.body;
  const userEmail =
    email || (req.session && req.session.user ? req.session.user.email : null);

  if (!name || !price || !subcategory_id || !userEmail || !business_id) {
    console.error("Missing fields:", {
      name,
      price,
      subcategory_id,
      userEmail,
      business_id,
    });
    return res.status(400).json({
      error: "Enter all fileds correctly",
    });
  }

  // Check price range from the `categories` table
  const categoryQuery = `
    SELECT min_price, max_price FROM categories 
    WHERE business_id = ? AND category_id = (SELECT category_id FROM subcategories WHERE subcategory_id = ?)
  `;

  db.query(categoryQuery, [business_id, subcategory_id], (err, results) => {
    if (err) {
      console.error("Error fetching category price range:", err);
      return res
        .status(500)
        .json({ error: "Database error while checking category price range" });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: "Invalid category or subcategory" });
    }

    const { min_price, max_price } = results[0];

    // Validate price within the category range
    if (
      parseFloat(price) < parseFloat(min_price) ||
      parseFloat(price) > parseFloat(max_price)
    ) {
      return res.status(400).json({
        error: `Price should be between ${min_price} and ${max_price} for the selected category.`,
      });
    }

    // Insert product if price is valid
    const imagePath = req.file ? req.file.path : null;
    const status = 1;

    const sql = `
      INSERT INTO products (Product_name, Description, Price, Subcategory_id, Status, Product_image, email)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        name,
        description || "",
        price,
        subcategory_id,
        status,
        imagePath,
        userEmail,
      ],
      (err, result) => {
        if (err) {
          console.error("Error inserting product:", err);
          return res
            .status(500)
            .json({ error: "Database error: " + err.message });
        }

        // Update or insert into `business_profile`
        const sqlBusinessProfile = `
        INSERT INTO business_profile (email, business_id, status)
        VALUES (?, ?, 1)
        ON DUPLICATE KEY UPDATE business_id = VALUES(business_id)
      `;

        db.query(
          sqlBusinessProfile,
          [userEmail, business_id],
          (err2, result2) => {
            if (err2) {
              console.error("Error updating business profile:", err2);
              return res.status(500).json({
                error:
                  "Database error when updating business profile: " +
                  err2.message,
              });
            }
            res.status(201).json({
              Product_id: result.insertId,
              Product_name: name,
              Description: description || "",
              Price: price,
              Subcategory_id: subcategory_id,
              Status: status,
              Product_image: imagePath,
              email: userEmail,
              message: "Product added successfully!",
            });
          }
        );
      }
    );
  });
});
// Add this endpoint to your server.js or routes file
app.get("/api/price-range", (req, res) => {
  const { business_id, subcategory_id } = req.query;

  if (!business_id || !subcategory_id) {
    return res
      .status(400)
      .json({ error: "Missing business_id or subcategory_id" });
  }

  const query = `
    SELECT c.min_price, c.max_price 
    FROM categories c
    JOIN subcategories s ON c.category_id = s.category_id
    WHERE c.business_id = ? AND s.subcategory_id = ?
  `;

  db.query(query, [business_id, subcategory_id], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "No matching price range found" });
    }

    res.json(results[0]); // Return the first matching result
  });
});

// Get products - FIXED to properly handle email filtering
app.get("/api/products", (req, res) => {
  const email =
    req.query.email ||
    (req.session && req.session.user && req.session.user.email) ||
    (req.session &&
      req.session.passport &&
      req.session.passport.user &&
      req.session.passport.user.email);

  // If no email available, return all products
  if (!email) {
    db.query("SELECT * FROM products", (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
    });
    return;
  }

  // Filter by email if available
  const sql = `SELECT * FROM products WHERE email = ?`;
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});
// Get a specific product by ID
app.get("/api/prod/:id", (req, res) => {
  const productId = req.params.id;
  console.log("Received request for product ID:", productId);

  const sql = `
    SELECT p.*, 
           u.name AS seller_name, 
           MAX(bt.type_name) AS business_type, 
           c.category_name, 
           s.subcategory_name
    FROM products p
    LEFT JOIN tbl_users u ON p.email = u.email
    LEFT JOIN subcategories s ON p.Subcategory_id = s.subcategory_id
    LEFT JOIN categories c ON s.category_id = c.category_id
    LEFT JOIN business_profile bp ON p.email = bp.email
    LEFT JOIN business_types bt ON bp.business_id = bt.business_id
    WHERE p.Product_id = ?
    GROUP BY p.Product_id, u.name, c.category_name, s.subcategory_name
  `;

  db.query(sql, [productId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(results[0]); // Return single product details
  });
});

// Update product status
app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = "UPDATE products SET Status = ? WHERE Product_id = ?";
  db.query(sql, [status, id], (err, result) => {
    if (err) {
      console.error("Error updating product status:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product status updated successfully" });
  });
});
// Get all products from all users

app.get("/api/all-products", (req, res) => {
  const sql = `
    SELECT p.*, u.name AS seller_name, 
           MAX(bt.type_name) AS business_type, 
           c.category_name, 
           s.subcategory_name
    FROM products p
    LEFT JOIN tbl_users u ON p.email = u.email
    LEFT JOIN subcategories s ON p.Subcategory_id = s.subcategory_id
    LEFT JOIN categories c ON s.category_id = c.category_id
    LEFT JOIN business_profile bp ON p.email = bp.email
    LEFT JOIN business_types bt ON bp.business_id = bt.business_id
      WHERE p.status = 1
    GROUP BY p.Product_id, u.name, c.category_name, s.subcategory_name
    ORDER BY p.Product_id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});
app.get("/api/all-pro", (req, res) => {
  const sql = `
      SELECT 
        p.Product_id, 
        p.Product_name, 
        p.Price, 
        u.email AS seller_email
      FROM products p
      JOIN tbl_users u ON p.email = u.email
    `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

app.get("/api/products/count", (req, res) => {
  const sql = "SELECT COUNT(*) AS totalProducts FROM products";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ totalProducts: results[0].totalProducts });
  });
});
app.put("/api/update-product/:id", (req, res) => {
  const { id } = req.params;
  const { Product_name, Price, Description } = req.body;

  // Validate required fields
  if (!Product_name || !Price) {
    return res
      .status(400)
      .json({ error: "Product name and price are required" });
  }

  const sql = `UPDATE products SET Product_name = ?, Price = ?, Description = ? WHERE Product_id = ?`;

  db.query(sql, [Product_name, Price, Description, id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      message: "Product updated successfully!",
      Product_id: id,
      Product_name,
      Price,
      Description,
    });
  });
});

app.get("/api/business-profile/owners-count", (req, res) => {
  const query =
    "SELECT COUNT(DISTINCT email) AS ownerCount FROM business_profile WHERE status = 1";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching unique owner count:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ ownerCount: results[0].ownerCount });
  });
});
app.post("/api/add-to-cart", async (req, res) => {
  const { email, product_id } = req.body;

  console.log("Received Data:", req.body); // Log request body
  console.log("Email:", email);
  console.log("Product ID:", product_id);

  if (!email || !product_id) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const sql =
      "INSERT INTO cart (email, product_id, added_at) VALUES (?, ?, NOW())";
    await db.query(sql, [email, product_id]);

    res.json({ message: "Item added to cart" });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/cart/:email", async (req, res) => {
  const { email } = req.params;

  try {
    // Query to join cart table with products table to get product details
    const sql = `
      SELECT c.cart_id, c.email, c.product_id, c.added_at, 
             p.Product_name, p.Price, p.Description, p.Product_image, 
             p.Subcategory_id, u.name AS seller_name,
             s.subcategory_name, cat.category_name
      FROM cart c
      JOIN products p ON c.product_id = p.Product_id
      LEFT JOIN tbl_users u ON p.email = u.email
      LEFT JOIN subcategories s ON p.Subcategory_id = s.subcategory_id
      LEFT JOIN categories cat ON s.category_id = cat.category_id
      WHERE c.email = ?
      ORDER BY c.added_at DESC
    `;

    db.query(sql, [email], (err, rows) => {
      if (err) {
        console.error("Error fetching cart items:", err);
        return res.status(500).json({ message: "Server error" });
      }
      res.json(rows);
    });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ message: "Server error" });
  }
});
app.delete("/api/cart/:cartId", async (req, res) => {
  const { cartId } = req.params;

  try {
    const sql = "DELETE FROM cart WHERE cart_id = ?";
    await db.query(sql, [cartId]);

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all sellers
app.get("/api/sellers", (req, res) => {
  const sql = "SELECT * FROM business_profile";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Update seller status
app.put("/api/sellers/status/:profileId", (req, res) => {
  const { profileId } = req.params;
  const { status } = req.body;

  if (status !== 0 && status !== 1) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  const sql = "UPDATE business_profile SET status = ? WHERE profile_id = ?";

  db.query(sql, [status, profileId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Seller not found" });
    }

    res.json({ message: "Seller status updated successfully" });
  });
});

// Update product status
app.put("/api/products/status/:productId", (req, res) => {
  const { productId } = req.params;
  const { status } = req.body;

  if (status !== 0 && status !== 1) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  const sql = "UPDATE products SET status = ? WHERE id = ?";

  db.query(sql, [status, productId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product status updated successfully" });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
