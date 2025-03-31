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
const Razorpay = require("razorpay");
const app = express();
const port = process.env.PORT || 5000;
const crypto = require("crypto");

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
const razorpay = new Razorpay({
  key_id: "rzp_test_9QpKV5f6tjujcT",
  key_secret: "j0Jo1qUWWZs1wsv6iLiJAbXC",
});

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
app.post("/api/products", upload.single("image"), (req, res) => {
  const {
    name,
    description,
    price,
    subcategory_id,
    stock,
    email,
    isImageNeeded,
    isTextNeeded,
    max_characters, // Added max_characters from request body
  } = req.body;

  // Get image path if uploaded
  const imagePath = req.file ? req.file.path.replace(/\\/g, "/") : null;

  const sql = `
    INSERT INTO products 
    (Product_name, Description, Price, Subcategory_id, Stock, Email, Product_image, isImageNeeded, isTextNeeded, max_characters, Status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      name,
      description,
      price,
      subcategory_id,
      stock,
      email,
      imagePath,
      isImageNeeded === "true" || isImageNeeded === true ? 1 : 0,
      isTextNeeded === "true" || isTextNeeded === true ? 1 : 0,
      max_characters, // Added to query values
      1, // Default status (assuming 1 means active)
    ],
    (err, result) => {
      if (err) {
        console.error("Error adding product:", err);
        return res.status(500).json({ error: "Database error" });
      }

      res.status(201).json({
        message: "Product added successfully",
        productId: result.insertId,
      });
    }
  );
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

// Update product status
// This endpoint updates a product by ID
app.put("/api/update-product/:id", (req, res) => {
  const { id } = req.params;
  const {
    Product_name,
    Price,
    Description,
    Stock,
    isImageNeeded,
    isTextNeeded,
  } = req.body;

  const sql =
    "UPDATE products SET Product_name = ?, Price = ?, Description = ?, Stock = ?, isImageNeeded = ?, isTextNeeded = ? WHERE Product_id = ?";

  db.query(
    sql,
    [Product_name, Price, Description, Stock, isImageNeeded, isTextNeeded, id],
    (err, result) => {
      if (err) {
        console.error("Error updating product:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json({ message: "Product updated successfully" });
    }
  );
});
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

app.get("/api/ord_prod/:id", (req, res) => {
  const productId = req.params.id;
  console.log("Received request for product ID:", productId);

  if (!productId) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  // First, get the basic product information, including max_characters
  const productSql = `
    SELECT 
      p.*, 
      p.max_characters, 
      u.name AS seller_name, 
      c.category_name, 
      s.subcategory_name
    FROM products p
    LEFT JOIN tbl_users u ON p.email = u.email
    LEFT JOIN subcategories s ON p.Subcategory_id = s.subcategory_id
    LEFT JOIN categories c ON s.category_id = c.category_id
    WHERE p.Product_id = ?
  `;

  db.query(productSql, [productId], (err, productResults) => {
    if (err) {
      console.error("Database error:", err);
      return res
        .status(500)
        .json({ error: "Database error", details: err.message });
    }

    if (productResults.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = productResults[0];

    // Get business type in a separate query
    const businessSql = `
      SELECT bt.type_name AS business_type
      FROM business_profile bp
      JOIN business_types bt ON bp.business_id = bt.business_id
      WHERE bp.email = ?
      LIMIT 1
    `;

    db.query(businessSql, [product.email], (bizErr, bizResults) => {
      if (!bizErr && bizResults.length > 0) {
        product.business_type = bizResults[0].business_type;
      }

      // Get product image in a separate query
      const imageSql = `
        SELECT image_url 
        FROM product_images
        WHERE product_id = ? 
        ORDER BY is_primary DESC
        LIMIT 1
      `;

      db.query(imageSql, [productId], (imgErr, imgResults) => {
        if (!imgErr && imgResults.length > 0) {
          product.product_image = imgResults[0].image_url;
        } else {
          // Use the default Product_image field if available
          if (product.Product_image) {
            product.product_image = product.Product_image;
          }
        }

        console.log("Sending product response:", product);
        res.json(product);
      });
    });
  });
});

app.get("/api/all-products", (req, res) => {
  const sql = `
    SELECT p.*, p.status, u.name AS seller_name, 
           MAX(bt.type_name) AS business_type, 
           c.category_name, 
           s.subcategory_name
    FROM products p
    LEFT JOIN tbl_users u ON p.email = u.email
    LEFT JOIN subcategories s ON p.Subcategory_id = s.subcategory_id
    LEFT JOIN categories c ON s.category_id = c.category_id
    LEFT JOIN business_profile bp ON p.email = bp.email
    LEFT JOIN business_types bt ON bp.business_id = bt.business_id
    GROUP BY p.Product_id, p.status, u.name, c.category_name, s.subcategory_name
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
  const { Product_name, Price, Description, Stock } = req.body;

  // Validate required fields
  if (!Product_name || !Price) {
    return res
      .status(400)
      .json({ error: "Product name and price are required" });
  }

  if (Stock < 0 || Stock > 100) {
    return res.status(400).json({ error: "Stock must be between 0 and 100" });
  }

  const sql = `UPDATE products SET Product_name = ?, Price = ?, Description = ?, Stock = ? WHERE Product_id = ?`;

  db.query(
    sql,
    [Product_name, Price, Description, Stock, id],
    (err, result) => {
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
        Stock,
      });
    }
  );
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
         p.Subcategory_id, p.Stock AS stock, u.name AS seller_name,
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

app.put("/api/products/status/:productId", (req, res) => {
  console.log("Received body:", req.body); // Debugging line

  const { productId } = req.params;
  let { status } = req.body;

  // Convert string "0"/"1" to integer if needed
  status = status === true || status === "1" || status === 1 ? 1 : 0;

  const sql = "UPDATE products SET Status = ? WHERE Product_id = ?";
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

app.post("/request-business-category", (req, res) => {
  const {
    profile_id,
    requested_business_type,
    requested_category,
    requested_subcategory,
  } = req.body;

  if (!profile_id) {
    return res.status(400).json({ message: "Profile ID is required" });
  }

  const query = `
    INSERT INTO business_category_requests 
    (profile_id, requested_business_type, requested_category, requested_subcategory) 
    VALUES (?, ?, ?, ?)`;

  db.query(
    query,
    [
      profile_id,
      requested_business_type,
      requested_category,
      requested_subcategory,
    ],
    (err, result) => {
      if (err) {
        console.error("Error inserting request:", err);
        return res.status(500).json({ message: "Error submitting request" });
      }
      res.status(201).json({
        message: "Request submitted successfully",
        requestId: result.insertId,
      });
    }
  );
});
app.get("/business-category-requests", (req, res) => {
  const query = `
    SELECT r.request_id, u.email, b.type_name AS business_type, 
           r.requested_business_type, r.requested_category, r.requested_subcategory, 
           r.status, r.created_at
    FROM business_category_requests r
    JOIN business_profile bp ON r.profile_id = bp.profile_id
    JOIN tbl_users u ON bp.email = u.email
    JOIN business_types b ON bp.business_id = b.business_id
    WHERE r.status = 'pending'`;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching requests:", err);
      return res.status(500).json({ message: "Error fetching requests" });
    }
    res.json(results);
  });
});
app.put("/business-category-requests/approve/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(
      "UPDATE business_category_requests SET status = 'approved' WHERE request_id = ?",
      [id]
    );
    res.json({ message: "Request approved successfully!" });
  } catch (error) {
    console.error("Error approving request:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// app.post("/api/create-order", async (req, res) => {
//   try {
//     const { email, cartItems, total_amount } = req.body;

//     if (!email || !cartItems || cartItems.length === 0 || !total_amount) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     console.log("Creating Razorpay order for:", email, total_amount);

//     // Create Razorpay Order
//     const options = {
//       amount: Math.round(total_amount * 100), // Convert to paise
//       currency: "INR",
//       receipt: `order_${Date.now()}`,
//     };

//     const razorpayOrder = await razorpay.orders.create(options);
//     console.log("Razorpay order created:", razorpayOrder);

//     // Insert Order in MySQL
//     const orderSql = `INSERT INTO orders (razorpay_order_id, email, total_amount, status) VALUES (?, ?, ?, ?)`;

//     db.query(
//       orderSql,
//       [razorpayOrder.id, email, total_amount, "pending"],
//       (err, result) => {
//         if (err) {
//           console.error("Database insert error:", err);
//           return res.status(500).json({ error: "Database error" });
//         }

//         const mysqlOrderId = result.insertId;
//         console.log("Order saved in database with ID:", mysqlOrderId);

//         // Insert Products into `order_items` Table
//         const orderItemsSql = `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?`;
//         const orderItemsValues = cartItems.map((item) => [
//           mysqlOrderId,
//           item.product_id,
//           item.quantity,
//           (total_amount / cartItems.reduce((acc, i) => acc + i.quantity, 0)) *
//             item.quantity,
//         ]);

//         db.query(orderItemsSql, [orderItemsValues], (orderErr) => {
//           if (orderErr) {
//             console.error("Error saving order items:", orderErr);
//             return res.status(500).json({ error: "Database error" });
//           }

//           console.log("Order items saved successfully");

//           // Prepare customization details for insertion
//           const customizationSql = `
//             INSERT INTO customization_details
//             (order_id, product_id, max_characters, text, image, customization_description)
//             VALUES ?
//           `;

//           // Filter out items with customization details
//           const customizationItems = cartItems.filter(
//             (item) => item.text || item.customization_description || item.image
//           );

//           if (customizationItems.length > 0) {
//             // Prepare customization values
//             const customizationValues = customizationItems.map((item) => [
//               mysqlOrderId,
//               item.product_id,
//               item.max_characters || null,
//               item.text || "",
//               item.image ? item.image.name : null, // Store image name or path
//               item.customization_description || "",
//             ]);

//             // Upload image if exists
//             const uploadPromises = customizationItems
//               .filter((item) => item.image)
//               .map(async (item) => {
//                 try {
//                   // Implement file upload logic here
//                   // For example, using multer or another file upload method
//                   const uploadPath = `/uploads/customizations/${mysqlOrderId}_${item.product_id}_${item.image.name}`;
//                   // Save file to uploadPath
//                   return uploadPath;
//                 } catch (uploadError) {
//                   console.error("Image upload error:", uploadError);
//                   return null;
//                 }
//               });

//             // Wait for image uploads (if any)
//             Promise.all(uploadPromises)
//               .then((uploadedPaths) => {
//                 // Update customization values with uploaded image paths
//                 customizationValues.forEach((value, index) => {
//                   if (uploadedPaths[index]) {
//                     value[4] = uploadedPaths[index];
//                   }
//                 });

//                 // Insert customization details
//                 db.query(
//                   customizationSql,
//                   [customizationValues],
//                   (customErr) => {
//                     if (customErr) {
//                       console.error(
//                         "Error saving customization details:",
//                         customErr
//                       );
//                       return res.status(500).json({ error: "Database error" });
//                     }
//                     console.log("Customizations saved successfully");
//                     res.json(razorpayOrder);
//                   }
//                 );
//               })
//               .catch((uploadError) => {
//                 console.error("Image upload error:", uploadError);
//                 res.status(500).json({ error: "Image upload failed" });
//               });
//           } else {
//             // No customizations to save
//             res.json(razorpayOrder);
//           }
//         });
//       }
//     );
//   } catch (error) {
//     console.error("Error creating order:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

app.post("/api/create-order", async (req, res) => {
  try {
    const { email, cartItems, total_amount } = req.body;

    if (!email || !cartItems || cartItems.length === 0 || !total_amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("Creating Razorpay order for:", email, total_amount);

    // Create Razorpay Order
    const options = {
      amount: Math.round(total_amount * 100), // Convert to paise
      currency: "INR",
      receipt: `order_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);
    console.log("Razorpay order created:", razorpayOrder);

    // Insert Order in MySQL
    const orderSql = `INSERT INTO orders (razorpay_order_id, email, total_amount, status) VALUES (?, ?, ?, ?)`;

    db.query(
      orderSql,
      [razorpayOrder.id, email, total_amount, "pending"],
      (err, result) => {
        if (err) {
          console.error("Database insert error:", err);
          return res.status(500).json({ error: "Database error" });
        }

        const mysqlOrderId = result.insertId;
        console.log("Order saved in database with ID:", mysqlOrderId);

        // Insert Products into `order_items` Table
        const orderItemsSql = `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?`;
        const orderItemsValues = cartItems.map((item) => [
          mysqlOrderId,
          item.product_id,
          item.quantity,
          (total_amount / cartItems.reduce((acc, i) => acc + i.quantity, 0)) *
            item.quantity,
        ]);

        db.query(orderItemsSql, [orderItemsValues], (orderErr) => {
          if (orderErr) {
            console.error("Error saving order items:", orderErr);
            return res.status(500).json({ error: "Database error" });
          }

          console.log("Order items saved successfully");

          // Filter out items with customization details
          const customizationItems = cartItems.filter(
            (item) => item.text || item.customization_description || item.image
          );

          if (customizationItems.length > 0) {
            // Prepare customization details for insertion
            const customizationSql = `
            INSERT INTO customization_details 
            (order_id, max_characters, text, image, customization_description) 
            VALUES ?
          `;

            const customizationValues = customizationItems.map((item) => [
              mysqlOrderId,
              item.max_characters || null,
              item.text || "",
              item.image
                ? `/uploads/customizations/${mysqlOrderId}_${item.image.name}`
                : null,
              item.customization_description || "",
            ]);

            db.query(customizationSql, [customizationValues], (customErr) => {
              if (customErr) {
                console.error("Error saving customization details:", customErr);
                return res.status(500).json({ error: "Database error" });
              }
              console.log("Customizations saved successfully");
              res.json(razorpayOrder);
            });
          } else {
            // No customizations to save
            res.json(razorpayOrder);
          }
        });
      }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    console.log("Verifying payment with:", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    console.log("Expected signature:", expectedSignature);
    console.log("Received signature:", razorpay_signature);

    if (expectedSignature === razorpay_signature) {
      const updateOrderSql = `UPDATE orders SET status = 'success' WHERE razorpay_order_id = ?`;

      db.query(updateOrderSql, [razorpay_order_id], (err, result) => {
        if (err) {
          console.error("Error updating order status:", err);
          return res.status(500).json({ error: "Database error" });
        }

        res.json({ success: true, message: "Payment verified successfully" });
      });
    } else {
      db.query(
        `UPDATE orders SET status = 'failed' WHERE razorpay_order_id = ?`,
        [razorpay_order_id],
        () => {
          res.status(400).json({ error: "Invalid signature" });
        }
      );
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

app.get("/api/orders/:orderId", (req, res) => {
  const { orderId } = req.params;
  console.log("Fetching order:", orderId); // Debugging log

  const query = "SELECT * FROM orders WHERE order_id = ?";
  db.query(query, [orderId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(result[0]);
  });
});
app.post(
  "/api/upload-customization-image",
  upload.single("image"),
  async (req, res) => {
    try {
      const { order_id } = req.body;
      const image = req.file ? req.file.filename : null;

      if (!order_id || !image) {
        return res
          .status(400)
          .json({ error: "Order ID and image are required" });
      }

      const updateImageSql = `UPDATE customization_details SET image = ? WHERE order_id = ?`;

      db.query(updateImageSql, [image, order_id], (err, result) => {
        if (err) {
          console.error("Error updating image:", err);
          return res
            .status(500)
            .json({ error: "Database error while updating image" });
        }

        res.json({ success: true, message: "Image uploaded successfully" });
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Image upload failed" });
    }
  }
);
app.get("/api/vieworders/:email", (req, res) => {
  const userEmail = req.params.email;

  const sql = `
    SELECT
    o.order_id,
    o.razorpay_order_id,
    o.total_amount,
    o.status,
    o.order_date,
    oi.order_item_id,
    oi.product_id,
    oi.quantity,
    oi.price,
    p.product_name,
    p.product_image  -- This line is already present, so it should work
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id
WHERE o.email = ?
ORDER BY o.order_date DESC;
  `;

  db.query(sql, [userEmail], (err, results) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return res.status(500).json({ error: "Failed to fetch orders" });
    }
    res.json(results);
  });
});
app.delete("/api/cart/:email", async (req, res) => {
  try {
    const { email } = req.params;
    console.log("Received delete request for email:", email);

    // Execute DELETE query
    const [result] = await db.execute("DELETE FROM cart WHERE email = ?", [
      email,
    ]);
    console.log("Delete result:", result);

    if (result.affectedRows > 0) {
      console.log("Cart cleared for:", email);
      res.json({ success: true, message: "Cart cleared successfully" });
    } else {
      console.log("No items found in the cart for:", email);
      res
        .status(404)
        .json({ success: false, message: "No items found in the cart" });
    }
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ success: false, message: "Failed to clear cart" });
  }
});
app.get("/getProfile", (req, res) => {
  if (!req.session.email) {
    return res.status(401).json({ error: "User not logged in" });
  }

  const email = req.session.email;
  db.query(
    "SELECT name, email, phone, profile_pic FROM tbl_users WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(results[0]);
    }
  );
});

// Update profile
app.post("/updateProfile", upload.single("profile_pic"), (req, res) => {
  if (!req.session.email) {
    return res.status(401).json({ error: "User not logged in" });
  }

  const email = req.session.email;
  const { name, phone } = req.body;
  const profilePicPath = req.file ? req.file.filename : null;

  const sql = profilePicPath
    ? "UPDATE tbl_users SET name = ?, phone = ?, profile_pic = ? WHERE email = ?"
    : "UPDATE tbl_users SET name = ?, phone = ? WHERE email = ?";

  const values = profilePicPath
    ? [name, phone, profilePicPath, email]
    : [name, phone, email];

  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Profile updated successfully" });
  });
});
app.get("/seller/orders_received", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Seller email is required" });
  }

  const query = `
      SELECT o.order_id, u.name AS customer_name, oi.quantity, 
             p.product_name, p.price AS product_price, 
             c.text AS customization_text, c.image AS customization_image, c.customization_description
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN products p ON oi.product_id = p.product_id
      JOIN users u ON o.email = u.email
      LEFT JOIN customization_details c ON o.order_id = c.order_id AND oi.product_id = c.product_id
      WHERE p.email = ?
      ORDER BY o.order_date DESC;
  `;

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
