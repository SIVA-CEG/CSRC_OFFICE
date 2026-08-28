const express = require("express");
const router = express.Router();
const pool = require("../db/db");

router.get("/campuses", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT campus
      FROM faculty_profile
      ORDER BY campus
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch campuses" });
  }
});

router.get("/departments/:campus", async (req, res) => {
  try {
    const { campus } = req.params;

    const result = await pool.query(
      `
      SELECT DISTINCT department
      FROM faculty_profile
      WHERE campus = $1
      ORDER BY department
      `,
      [campus],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
});

router.get("/list/:campus/:department", async (req, res) => {
  try {
    const { campus, department } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        user_id,
        salutation,
        initial,
        staff_name,
        designation,
        department,
        campus,
        intercom,
        mobile,
        dob,
        dos,
        superannuation_date
      FROM faculty_profile
      WHERE campus = $1
      AND department = $2
      ORDER BY staff_name
      `,
      [campus, department],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch faculty list",
    });
  }
});

module.exports = router;
