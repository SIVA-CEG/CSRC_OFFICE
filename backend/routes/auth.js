const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../db/db");

router.post("/tapal-login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      `SELECT * FROM admin_users WHERE username = $1`,
      [username],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    if (user.role !== "tapal") {
      return res
        .status(403)
        .json({ error: "Access denied. Not a tapal user." });
    }

    res.json({
      message: "Login successful",
      user: { id: user.id, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error("Login error", err);
    res.status(500).json({ error: "Login failed" });
  }
});
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const signatureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/signatures";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `signature_${req.params.id}_${Date.now()}${path.extname(file.originalname)}`,
    );
  },
});
const uploadSignature = multer({ storage: signatureStorage });

router.get("/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, name, username, role, phone, email, employee_no, signature_path, created_at FROM admin_users WHERE id = $1`,
      [id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.put(
  "/profile/:id",
  uploadSignature.single("signature"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { phone, email, employee_no } = req.body;
      const signaturePath = req.file ? req.file.path : null;

      let query, params;
      if (signaturePath) {
        query = `UPDATE admin_users SET phone = $1, email = $2, employee_no = $3, signature_path = $4 WHERE id = $5 RETURNING id, name, username, role, phone, email, employee_no, signature_path`;
        params = [phone, email, employee_no, signaturePath, id];
      } else {
        query = `UPDATE admin_users SET phone = $1, email = $2, employee_no = $3 WHERE id = $4 RETURNING id, name, username, role, phone, email, employee_no, signature_path`;
        params = [phone, email, employee_no, id];
      }

      const result = await pool.query(query, params);
      res.json({ message: "Profile updated", user: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update profile" });
    }
  },
);

router.post("/proceedings-login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query(
      `SELECT * FROM admin_users WHERE username = $1`,
      [username],
    );
    if (result.rows.length === 0)
      return res.status(401).json({ error: "Invalid User ID or Password." });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res.status(401).json({ error: "Invalid User ID or Password." });

    if (
      !["assistant", "superintendent", "director", "dd"].includes(user.role)
    ) {
      return res.status(403).json({ error: "Access denied." });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        username: user.username,
      },
    });
  } catch (err) {
    console.error("Proceedings login error", err);
    res.status(500).json({ error: "Login failed" });
  }
});
module.exports = router;
