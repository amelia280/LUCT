const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/auth");

// Example protected route
router.get("/", authMiddleware, (req, res) => {
  const users = [
    { id: 1, name: "John Doe", role: "student" },
    { id: 2, name: "Jane Smith", role: "lecturer" }
  ];
  res.json(users);
});

router.get("/:id", authMiddleware, (req, res) => {
  const { id } = req.params;
  res.json({ id, name: "Sample User", role: "student" });
});

module.exports = router;
