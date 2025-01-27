const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const path = require("path");

// Initialize express app
const app = express();
const port = 5000;

// Middleware setup
app.use(express.static(path.join(__dirname, "public")));
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

// Database configuration
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "custom_hive",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// Route to fetch user details from tbl_users table
app.get("/users", (req, res) => {
  const sql = "SELECT * FROM tbl_users";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
    return res.json(result);
  });
});

app.get("/user/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM tbl_users WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json(result[0]);
  });
});

// Add new user
app.post("/add_user", (req, res) => {
  const { name, email, password, phone, role_id } = req.body;

  // Validate input
  if (!name || !email || !password || !phone) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  const sql =
    "INSERT INTO tbl_users (name, email, password, phone, role_id) VALUES (?, ?, ?, ?, ?)";
  const values = [name, email, password, phone, role_id];

  db.query(sql, values, (err, result) => {
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
  });
});

// Login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM tbl_users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }

    if (result.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = result[0];
    const role_id = user.role_id;

    // Redirect based on role
    if (role_id == 1) {
      return res.json({
        success: true,
        message: "Login successful",
        redirectUrl: "/admin",
      });
    } else if (role_id == 2) {
      return res.json({
        success: true,
        message: "Login successful",
        redirectUrl: "/business_dashboard",
      });
    } else {
      return res.json({
        success: true,
        message: "Login successful",
        redirectUrl: "/userDashboard",
      });
    }
  });
});

//Delete User

app.delete("/delete/:email", (req, res) => {
  const email = req.params.email;
  const sql = "DELETE FROM tbl_users WHERE email= ?";

  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        message: "Error deleting user",
      });
    }
    return res.json({
      success: true,
      message: "User deleted successfully",
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
