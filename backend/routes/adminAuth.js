const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db/db");

const ALLOWED_ROLES = [
  "assistant",
  "superintendent",
  "director",
  "dd",
  "tapal",
];

router.post("/login", async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ message: "User ID and password required" });
    }

    const result = await pool.query(
      `SELECT * FROM admin_users WHERE username = $1`,
      [userId],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid User ID or Password" });
    }

    const user = result.rows[0];

    if (!ALLOWED_ROLES.includes(user.role)) {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid User ID or Password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      token,
      user: {
        userId: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
