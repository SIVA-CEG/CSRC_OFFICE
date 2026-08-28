const express = require("express");
const router = express.Router();
const pool = require("../db/db");

// ── Salary structure (per designation) ─────────────────────────
router.get("/structure", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM revenue_salary_structure ORDER BY designation ASC`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch salary structure" });
  }
});

router.get("/structure/:designation", async (req, res) => {
  try {
    const { designation } = req.params;
    const result = await pool.query(
      `SELECT * FROM revenue_salary_structure WHERE designation = $1`,
      [designation],
    );
    if (result.rows.length === 0) {
      // return defaults so the frontend always has something to render
      return res.json({
        designation,
        consolidated_amount: 15000,
        daily_wage_per_day: 500,
        daily_wage_incentive_per_day: 500,
        rate_factor_wage_per_day: 500,
        rate_factor: 1.15,
        rate_factor_incentive: 1.15,
      });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch structure" });
  }
});

// upsert — assistant only
router.put("/structure/:designation", async (req, res) => {
  try {
    const { designation } = req.params;
    const {
      consolidatedAmount,
      dailyWagePerDay,
      dailyWageIncentivePerDay,
      rateFactorWagePerDay,
      rateFactor,
      rateFactorIncentive,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO revenue_salary_structure
         (designation, consolidated_amount, daily_wage_per_day, daily_wage_incentive_per_day,
          rate_factor_wage_per_day, rate_factor, rate_factor_incentive, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7, now())
       ON CONFLICT (designation) DO UPDATE SET
         consolidated_amount = EXCLUDED.consolidated_amount,
         daily_wage_per_day = EXCLUDED.daily_wage_per_day,
         daily_wage_incentive_per_day = EXCLUDED.daily_wage_incentive_per_day,
         rate_factor_wage_per_day = EXCLUDED.rate_factor_wage_per_day,
         rate_factor = EXCLUDED.rate_factor,
         rate_factor_incentive = EXCLUDED.rate_factor_incentive,
         updated_at = now()
       RETURNING *`,
      [
        designation,
        consolidatedAmount,
        dailyWagePerDay,
        dailyWageIncentivePerDay,
        rateFactorWagePerDay,
        rateFactor,
        rateFactorIncentive,
      ],
    );

    res.json({ message: "Structure saved", structure: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save structure" });
  }
});

// ── Sanctions — created (and applied) directly by assistant ────
// body: { month, year, salaryType, procNo, entries: [ computeSalary(...) results ], createdBy }
router.post("/sanction", async (req, res) => {
  const client = await pool.connect();
  try {
    const { month, year, salaryType, procNo, entries, createdBy } = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: "At least one entry is required" });
    }

    const totalAmount = entries.reduce(
      (sum, e) => sum + (parseFloat(e.netSalary) || 0),
      0,
    );

    await client.query("BEGIN");

    const sanctionRes = await client.query(
      `INSERT INTO revenue_salary_sanctions (month, year, salary_type, proc_no, total_amount, created_by)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [month, year, salaryType, procNo || null, totalAmount, createdBy || "Assistant"],
    );
    const sanctionId = sanctionRes.rows[0].id;

    for (const e of entries) {
      await client.query(
        `INSERT INTO revenue_salary_sanction_entries
           (sanction_id, staff_id, staff_name, designation, bank_account_number,
            days_worked, wage_per_day, rate_factor, incentive_days, incentive_rate,
            lump_sum, gross_salary, incentive_amount, net_salary)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [
          sanctionId,
          e.staffId,
          e.staffName,
          e.designation,
          e.bankAccountNumber || null,
          e.daysWorked || 0,
          e.wagePerDay || 0,
          e.rateFactor || 1,
          e.incentiveDays || 0,
          e.incentiveRate || 0,
          e.lumpSum || 0,
          e.grossSalary || 0,
          e.incentiveAmount || 0,
          e.netSalary || 0,
        ],
      );
    }

    await client.query(
      `INSERT INTO revenue_salary_sanction_history (sanction_id, role, name, action, comment)
       VALUES ($1,'assistant',$2,'submitted','Sanctioned directly by Assistant')`,
      [sanctionId, createdBy || "Assistant"],
    );

    await client.query("COMMIT");
    res.status(201).json({ message: "Salary sanctioned", sanctionId, totalAmount });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Failed to submit salary sanction" });
  } finally {
    client.release();
  }
});

// ── Reports — everyone can view ─────────────────────────────────
router.get("/reports", async (req, res) => {
  try {
    const { month, year, salaryType, status } = req.query;

    let query = `SELECT * FROM revenue_salary_sanctions WHERE 1=1`;
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
    if (salaryType) {
      query += ` AND salary_type = $${idx++}`;
      values.push(salaryType);
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
    res.status(500).json({ error: "Failed to fetch salary reports" });
  }
});

// ── Single sanction with entries + history ──────────────────────
router.get("/sanction/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [sanctionRes, entriesRes, historyRes] = await Promise.all([
      pool.query(`SELECT * FROM revenue_salary_sanctions WHERE id = $1`, [id]),
      pool.query(
        `SELECT * FROM revenue_salary_sanction_entries WHERE sanction_id = $1`,
        [id],
      ),
      pool.query(
        `SELECT * FROM revenue_salary_sanction_history WHERE sanction_id = $1 ORDER BY created_at ASC`,
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
    res.status(500).json({ error: "Failed to fetch sanction detail" });
  }
});

module.exports = router;