const express = require("express");
const router = express.Router();
const pool = require("../db/db");

// ── OT structure (rate per hour, per designation) ───────────────
router.get("/structure", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM revenue_ot_structure ORDER BY designation ASC`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch OT structure" });
  }
});

router.get("/structure/:designation", async (req, res) => {
  try {
    const { designation } = req.params;
    const result = await pool.query(
      `SELECT * FROM revenue_ot_structure WHERE designation = $1`,
      [designation],
    );
    if (result.rows.length === 0) {
      return res.json({ designation, rate_per_hour: 125 });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch OT structure" });
  }
});

router.put("/structure/:designation", async (req, res) => {
  try {
    const { designation } = req.params;
    const { ratePerHour } = req.body;

    const result = await pool.query(
      `INSERT INTO revenue_ot_structure (designation, rate_per_hour, updated_at)
       VALUES ($1,$2, now())
       ON CONFLICT (designation) DO UPDATE SET
         rate_per_hour = EXCLUDED.rate_per_hour, updated_at = now()
       RETURNING *`,
      [designation, ratePerHour],
    );

    res.json({ message: "OT rate saved", structure: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save OT rate" });
  }
});

// ── Daily OT entries — manual entry, bulk save for one staff+month ──
// GET entries for a staff member in a given month/year
router.get("/entries/:staffId/:month/:year", async (req, res) => {
  try {
    const { staffId, month, year } = req.params;
    const result = await pool.query(
      `SELECT * FROM revenue_ot_entries
       WHERE staff_id = $1 AND month = $2 AND year = $3
       ORDER BY entry_date ASC`,
      [staffId, month, year],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch OT entries" });
  }
});

// PUT bulk-replace all rows for one staff+month — mirrors saveOTEntriesForStaffMonth()
// body: { rows: [{ date, inTime, outTime, otBeforeOfficeHours, otAfterOfficeHours, totalHoursForDay, remarks }] }
router.put("/entries/:staffId/:month/:year", async (req, res) => {
  const client = await pool.connect();
  try {
    const { staffId, month, year } = req.params;
    const { rows } = req.body;

    if (!Array.isArray(rows)) {
      return res.status(400).json({ error: "rows must be an array" });
    }

    await client.query("BEGIN");

    // Clear existing rows for this staff+month, then reinsert — simplest way
    // to handle deleted rows from the frontend's editable table.
    await client.query(
      `DELETE FROM revenue_ot_entries WHERE staff_id = $1 AND month = $2 AND year = $3`,
      [staffId, month, year],
    );

    for (const r of rows) {
      if (!r.date) continue;
      await client.query(
        `INSERT INTO revenue_ot_entries
           (staff_id, month, year, entry_date, in_time, out_time,
            ot_before_office_hours, ot_after_office_hours, total_hours_for_day, remarks)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          staffId,
          month,
          year,
          r.date,
          r.inTime || null,
          r.outTime || null,
          r.otBeforeOfficeHours || "0:00",
          r.otAfterOfficeHours || "0:00",
          r.totalHoursForDay || 0,
          r.remarks || null,
        ],
      );
    }

    await client.query("COMMIT");
    res.json({ message: "OT entries saved" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Failed to save OT entries" });
  } finally {
    client.release();
  }
});

// ── Month summary — for the Sanction OT page's staff table ─────
// Joins entries with staff + rate structure to build totalHours/totalAmount per staff.
router.get("/summary/:month/:year", async (req, res) => {
  try {
    const { month, year } = req.params;
    const result = await pool.query(
      `SELECT
         e.staff_id,
         s.first_name, s.last_name, s.designation, s.employee_code, s.bank_account_number,
         COALESCE(st.rate_per_hour, 125) AS rate_per_hour,
         SUM(e.total_hours_for_day) AS total_hours
       FROM revenue_ot_entries e
       JOIN revenue_staff s ON s.id = e.staff_id
       LEFT JOIN revenue_ot_structure st ON st.designation = s.designation
       WHERE e.month = $1 AND e.year = $2
       GROUP BY e.staff_id, s.first_name, s.last_name, s.designation,
                s.employee_code, s.bank_account_number, st.rate_per_hour
       ORDER BY s.first_name ASC`,
      [month, year],
    );

    const summary = result.rows.map((r) => ({
      staffId: r.staff_id,
      staffName: [r.first_name, r.last_name].filter(Boolean).join(" "),
      designation: r.designation,
      employeeCode: r.employee_code,
      bankAccountNumber: r.bank_account_number,
      ratePerHour: parseFloat(r.rate_per_hour),
      totalHours: parseFloat(r.total_hours),
      totalAmount:
        Math.round(parseFloat(r.rate_per_hour) * parseFloat(r.total_hours) * 100) / 100,
    }));

    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to build OT summary" });
  }
});

// Whether a staff member already has a non-rejected OT sanction for this month
router.get("/already-sanctioned/:month/:year/:staffId", async (req, res) => {
  try {
    const { month, year, staffId } = req.params;
    const result = await pool.query(
      `SELECT 1 FROM revenue_ot_sanctions os
       JOIN revenue_ot_sanction_entries oe ON oe.sanction_id = os.id
       WHERE os.month = $1 AND os.year = $2 AND oe.staff_id = $3 AND os.status != 'rejected'
       LIMIT 1`,
      [month, year, staffId],
    );
    res.json({ alreadySanctioned: result.rows.length > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to check sanction status" });
  }
});

// ── Sanctions — created (and applied) directly by assistant ────
router.post("/sanction", async (req, res) => {
  const client = await pool.connect();
  try {
    const { month, year, procNo, entries, createdBy } = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: "At least one entry is required" });
    }

    const totalAmount = entries.reduce(
      (sum, e) => sum + (parseFloat(e.totalAmount) || 0),
      0,
    );

    await client.query("BEGIN");

    const sanctionRes = await client.query(
      `INSERT INTO revenue_ot_sanctions (month, year, proc_no, total_amount, created_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [month, year, procNo || null, totalAmount, createdBy || "Assistant"],
    );
    const sanctionId = sanctionRes.rows[0].id;

    for (const e of entries) {
      await client.query(
        `INSERT INTO revenue_ot_sanction_entries
           (sanction_id, staff_id, staff_name, designation, bank_account_number,
            rate_per_hour, total_hours, total_amount)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          sanctionId,
          e.staffId,
          e.staffName,
          e.designation,
          e.bankAccountNumber || null,
          e.ratePerHour || 0,
          e.totalHours || 0,
          e.totalAmount || 0,
        ],
      );
    }

    await client.query(
      `INSERT INTO revenue_ot_sanction_history (sanction_id, role, name, action, comment)
       VALUES ($1,'assistant',$2,'submitted','Sanctioned directly by Assistant')`,
      [sanctionId, createdBy || "Assistant"],
    );

    await client.query("COMMIT");
    res.status(201).json({ message: "OT sanctioned", sanctionId, totalAmount });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Failed to submit OT sanction" });
  } finally {
    client.release();
  }
});

// ── Reports — everyone can view ─────────────────────────────────
router.get("/reports", async (req, res) => {
  try {
    const { month, year, status } = req.query;

    let query = `SELECT * FROM revenue_ot_sanctions WHERE 1=1`;
    const values = [];
    let idx = 1;

    if (month) {
      query += ` AND month = $${idx++}`;
      values.push(month);
    }
    if (year) {
      query += ` AND year = $${idx++}`;
      values.push(year);
    }
    if (status) {
      query += ` AND status = $${idx++}`;
      values.push(status);
    }
    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch OT reports" });
  }
});

router.get("/sanction/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [sanctionRes, entriesRes, historyRes] = await Promise.all([
      pool.query(`SELECT * FROM revenue_ot_sanctions WHERE id = $1`, [id]),
      pool.query(
        `SELECT * FROM revenue_ot_sanction_entries WHERE sanction_id = $1`,
        [id],
      ),
      pool.query(
        `SELECT * FROM revenue_ot_sanction_history WHERE sanction_id = $1 ORDER BY created_at ASC`,
        [id],
      ),
    ]);

    if (sanctionRes.rows.length === 0) {
      return res.status(404).json({ error: "Sanction not found" });
    }

    res.json({
      ...sanctionRes.rows[0],
      entries: entriesRes.rows,
      history: historyRes.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch OT sanction detail" });
  }
});

module.exports = router;