const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Secret key for JWT (in production use .env file)
const JWT_SECRET = "supersecretkey";

// Fake in-memory users store (replace with DB)
let users = [];

// ------------------ REGISTER ------------------
router.post("/register", async (req, res) => {
  const { name, email, password, faculty, role } = req.body;

  // check if email already exists
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const newUser = {
    id: Date.now(),
    name,
    email,
    password: hashed,
    faculty,
    role
  };

  users.push(newUser);

  res.json({ message: "User registered successfully" });
});

// ------------------ LOGIN ------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);

  if (!user) return res.status(401).json({ message: "Invalid email or password" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

  // Create JWT
  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    message: "Login successful",
    user: { id: user.id, name: user.name, role: user.role },
    token
  });
});

module.exports = router;
