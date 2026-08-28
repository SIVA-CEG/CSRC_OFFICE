const express = require("express");
const router = express.Router();
const pool = require("../db/db");

// ─────────────────────────────────────────────────────────
// FIX: pg's default DATE (oid 1082) parser builds a JS Date at LOCAL
// midnight, and JSON.stringify()/res.json() then serializes it via
// toISOString() (UTC). If the server's local timezone is ahead of UTC
// (e.g. IST, +5:30), local midnight converts to the PREVIOUS day in UTC,
// so every plain date column (contract dates, order dates, extension
// dates, etc.) arrives at the frontend exactly one day short of the DB
// value. Returning the raw 'YYYY-MM-DD' string instead sidesteps any
// timezone math entirely.
// ─────────────────────────────────────────────────────────
const { types: pgTypes } = require("pg");
pgTypes.setTypeParser(1082, (val) => val); // 1082 = date

router.get("/pending", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.id, i.installment, i.created_at, i.status,
       i.assigned_to, i.assign_remarks,
       p.id AS project_id, p.project_title, p.funding_agency,
       f.staff_name AS pi_name,
       COALESCE(nr.nr_total, 0) + COALESCE(mp.mp_total, 0) + COALESCE(oh.oh_total, 0) AS total_amount
FROM installments i
LEFT JOIN projects p ON i.project_id = p.id
LEFT JOIN endorsements e ON p.endorsement_id = e.id
LEFT JOIN faculty_profile f ON e.user_id = f.user_id
LEFT JOIN (
  SELECT installment_id, SUM(amount) AS nr_total
  FROM non_recurring_heads
  GROUP BY installment_id
) nr ON nr.installment_id = i.id
LEFT JOIN (
  SELECT installment_id, SUM(amount) AS mp_total
  FROM manpower
  GROUP BY installment_id
) mp ON mp.installment_id = i.id
LEFT JOIN (
  SELECT installment_id, SUM(total_overhead) AS oh_total
  FROM overheads
  GROUP BY installment_id
) oh ON oh.installment_id = i.id
WHERE LOWER(TRIM(i.status)) = 'pending'
ORDER BY i.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch pending sanctions" });
  }
});

router.get("/assigned", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.id, i.installment, i.created_at, i.status,
       i.assigned_to, i.assign_remarks,
       p.id AS project_id, p.project_title, p.funding_agency,
       f.staff_name AS pi_name,
       COALESCE(nr.nr_total, 0) + COALESCE(mp.mp_total, 0) + COALESCE(oh.oh_total, 0) AS total_amount
FROM installments i
LEFT JOIN projects p ON i.project_id = p.id
LEFT JOIN endorsements e ON p.endorsement_id = e.id
LEFT JOIN faculty_profile f ON e.user_id = f.user_id
LEFT JOIN (
  SELECT installment_id, SUM(amount) AS nr_total
  FROM non_recurring_heads
  GROUP BY installment_id
) nr ON nr.installment_id = i.id
LEFT JOIN (
  SELECT installment_id, SUM(amount) AS mp_total
  FROM manpower
  GROUP BY installment_id
) mp ON mp.installment_id = i.id
LEFT JOIN (
  SELECT installment_id, SUM(total_overhead) AS oh_total
  FROM overheads
  GROUP BY installment_id
) oh ON oh.installment_id = i.id
WHERE LOWER(TRIM(i.status)) = 'assigned'
ORDER BY i.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch assigned sanctions" });
  }
});

router.get("/completed", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.id, i.installment, i.created_at, i.status,
             i.assigned_to, i.assign_remarks,
             p.id AS project_id, p.project_title, p.funding_agency,
             f.staff_name AS pi_name
      FROM installments i
      LEFT JOIN projects p ON i.project_id = p.id
      LEFT JOIN endorsements e ON p.endorsement_id = e.id
      LEFT JOIN faculty_profile f ON e.user_id = f.user_id
      WHERE LOWER(TRIM(i.status)) = 'completed'
      ORDER BY i.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch completed sanctions" });
  }
});

router.get("/staff/assistants", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, username, role FROM admin_users WHERE role = 'assistant' ORDER BY name`,
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch assistants" });
  }
});

router.get("/staff/supervisors", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, username, role FROM admin_users WHERE role = 'superintendent' ORDER BY name`,
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch supervisors" });
  }
});

router.get("/staff/directors", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, username, role FROM admin_users WHERE role = 'director' ORDER BY name`,
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch directors" });
  }
});
router.put("/:id/assign", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, assign_remarks } = req.body;
    const result = await pool.query(
      `UPDATE installments SET status = 'ASSIGNED', assigned_to = $1, assign_remarks = $2 WHERE id = $3 RETURNING *`,
      [assigned_to, assign_remarks, id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Sanction not found" });
    res.json({ message: "Assigned successfully", sanction: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to assign sanction" });
  }
});

router.get("/extensions/pending", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ex.id, ex.original_end_date, ex.revised_end_date,
             ex.extension_period, ex.reason, ex.status,
             ex.created_at, ex.assigned_to, ex.assign_remarks,
             p.project_title, p.funding_agency,
             f.staff_name AS pi_name
      FROM project_extensions ex
      LEFT JOIN projects p ON ex.project_id = p.id
      LEFT JOIN endorsements e ON p.endorsement_id = e.id
      LEFT JOIN faculty_profile f ON e.user_id = f.user_id
      WHERE LOWER(TRIM(ex.status)) = 'pending'
      ORDER BY ex.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch pending extensions" });
  }
});

router.get("/extensions/assigned", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ex.id, ex.original_end_date, ex.revised_end_date,
             ex.extension_period, ex.reason, ex.status,
             ex.created_at, ex.assigned_to, ex.assign_remarks,
             p.project_title, p.funding_agency,
             f.staff_name AS pi_name
      FROM project_extensions ex
      LEFT JOIN projects p ON ex.project_id = p.id
      LEFT JOIN endorsements e ON p.endorsement_id = e.id
      LEFT JOIN faculty_profile f ON e.user_id = f.user_id
     WHERE LOWER(TRIM(ex.status)) IN ('assigned', 'assigned to supervisor', 'assigned to director')
      ORDER BY ex.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch assigned extensions" });
  }
});

router.get("/extensions/completed", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ex.id, ex.original_end_date, ex.revised_end_date,
             ex.extension_period, ex.reason, ex.status,
             ex.created_at, ex.assigned_to, ex.assign_remarks,
             p.project_title, p.funding_agency,
             f.staff_name AS pi_name
      FROM project_extensions ex
      LEFT JOIN projects p ON ex.project_id = p.id
      LEFT JOIN endorsements e ON p.endorsement_id = e.id
      LEFT JOIN faculty_profile f ON e.user_id = f.user_id
      WHERE LOWER(TRIM(ex.status)) = 'completed'
      ORDER BY ex.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch completed extensions" });
  }
});

router.put("/extensions/:id/assign", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, assign_remarks } = req.body;
    const result = await pool.query(
      `UPDATE project_extensions SET status = 'ASSIGNED', assigned_to = $1, assign_remarks = $2 WHERE id = $3 RETURNING *`,
      [assigned_to, assign_remarks, id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Extension not found" });
    res.json({ message: "Assigned successfully", extension: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to assign extension" });
  }
});

// Fetch installments assigned to assistant
router.get("/assigned-to-me", async (req, res) => {
  try {
    const { username } = req.query;
    const result = await pool.query(
      `
      SELECT i.id, i.installment, i.status, i.assigned_to, i.created_at,
             p.id AS project_id, p.project_title, p.funding_agency,p.scheme,
             p.sanction_reference_no, p.sanction_reference_date,
             f.staff_name AS pi_name, f.designation AS pi_designation,
             f.department AS pi_dept, f.campus AS pi_campus,
             f.dob AS pi_dob, f.dos AS pi_dos, f.superannuation_date AS pi_superannuation,
             COALESCE(nr.nr_total,0) + COALESCE(mp.mp_total,0) + COALESCE(oh.oh_total,0) AS total_amount
      FROM installments i
      LEFT JOIN projects p ON i.project_id = p.id
      LEFT JOIN endorsements e ON p.endorsement_id = e.id
      LEFT JOIN faculty_profile f ON e.user_id = f.user_id
      LEFT JOIN (SELECT installment_id, SUM(amount) AS nr_total FROM non_recurring_heads GROUP BY installment_id) nr ON nr.installment_id = i.id
      LEFT JOIN (SELECT installment_id, SUM(amount) AS mp_total FROM manpower GROUP BY installment_id) mp ON mp.installment_id = i.id
      LEFT JOIN (SELECT installment_id, SUM(total_overhead) AS oh_total FROM overheads GROUP BY installment_id) oh ON oh.installment_id = i.id
      WHERE LOWER(TRIM(i.status)) = 'assigned' AND i.assigned_to = $1 AND i.installment='I'
      ORDER BY i.created_at DESC
    `,
      [username],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
});

router.get("/assigned-to-supervisor", async (req, res) => {
  try {
    const { username } = req.query;
    const result = await pool.query(
      `
      SELECT i.id, i.installment, i.status, i.assigned_to, i.created_at,
             p.id AS project_id, p.project_title, p.funding_agency, p.scheme,
             p.sanction_reference_no,
             f.staff_name AS pi_name, f.department AS pi_dept, f.campus AS pi_campus,
             COALESCE(nr.nr_total,0) + COALESCE(mp.mp_total,0) + COALESCE(oh.oh_total,0) AS total_amount
      FROM installments i
      LEFT JOIN projects p ON i.project_id = p.id
      LEFT JOIN endorsements e ON p.endorsement_id = e.id
      LEFT JOIN faculty_profile f ON e.user_id = f.user_id
      LEFT JOIN (SELECT installment_id, SUM(amount) AS nr_total FROM non_recurring_heads GROUP BY installment_id) nr ON nr.installment_id = i.id
      LEFT JOIN (SELECT installment_id, SUM(amount) AS mp_total FROM manpower GROUP BY installment_id) mp ON mp.installment_id = i.id
      LEFT JOIN (SELECT installment_id, SUM(total_overhead) AS oh_total FROM overheads GROUP BY installment_id) oh ON oh.installment_id = i.id
      WHERE LOWER(TRIM(i.status)) = 'assigned to supervisor' AND i.assigned_to = $1 AND i.installment='I'
      ORDER BY i.created_at DESC
    `,
      [username],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
});

router.get("/assigned-to-director", async (req, res) => {
  try {
    const { username } = req.query;
    const result = await pool.query(
      `
      SELECT i.id, i.installment, i.status, i.assigned_to, i.created_at,
             p.id AS project_id, p.project_title, p.funding_agency, p.scheme,
             p.sanction_reference_no,
             f.staff_name AS pi_name, f.department AS pi_dept, f.campus AS pi_campus,
             COALESCE(nr.nr_total,0) + COALESCE(mp.mp_total,0) + COALESCE(oh.oh_total,0) AS total_amount
      FROM installments i
      LEFT JOIN projects p ON i.project_id = p.id
      LEFT JOIN endorsements e ON p.endorsement_id = e.id
      LEFT JOIN faculty_profile f ON e.user_id = f.user_id
      LEFT JOIN (SELECT installment_id, SUM(amount) AS nr_total FROM non_recurring_heads GROUP BY installment_id) nr ON nr.installment_id = i.id
      LEFT JOIN (SELECT installment_id, SUM(amount) AS mp_total FROM manpower GROUP BY installment_id) mp ON mp.installment_id = i.id
      LEFT JOIN (SELECT installment_id, SUM(total_overhead) AS oh_total FROM overheads GROUP BY installment_id) oh ON oh.installment_id = i.id
      WHERE LOWER(TRIM(i.status)) = 'assigned to director' AND i.assigned_to = $1 AND i.installment='I'
      ORDER BY i.created_at DESC
    `,
      [username],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
});

// Fetch installments assigned to the deputy director
router.get("/assigned-to-dd", async (req, res) => {
  try {
    const { username } = req.query;
    const result = await pool.query(
      `
      SELECT i.id, i.installment, i.status, i.assigned_to, i.created_at,
             p.id AS project_id, p.project_title, p.funding_agency, p.scheme,
             p.sanction_reference_no,
             f.staff_name AS pi_name, f.department AS pi_dept, f.campus AS pi_campus,
             COALESCE(nr.nr_total,0) + COALESCE(mp.mp_total,0) + COALESCE(oh.oh_total,0) AS total_amount
      FROM installments i
      LEFT JOIN projects p ON i.project_id = p.id
      LEFT JOIN endorsements e ON p.endorsement_id = e.id
      LEFT JOIN faculty_profile f ON e.user_id = f.user_id
      LEFT JOIN (SELECT installment_id, SUM(amount) AS nr_total FROM non_recurring_heads GROUP BY installment_id) nr ON nr.installment_id = i.id
      LEFT JOIN (SELECT installment_id, SUM(amount) AS mp_total FROM manpower GROUP BY installment_id) mp ON mp.installment_id = i.id
      LEFT JOIN (SELECT installment_id, SUM(total_overhead) AS oh_total FROM overheads GROUP BY installment_id) oh ON oh.installment_id = i.id
      WHERE LOWER(TRIM(i.status)) = 'assigned to dd' AND i.assigned_to = $1 AND i.installment='I'
      ORDER BY i.created_at DESC
    `,
      [username],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
});

router.get("/transferred-by-me", async (req, res) => {
  try {
    const { username } = req.query;
    const result = await pool.query(
      `
      SELECT DISTINCT i.id, i.installment, i.status, i.assigned_to, i.created_at,
             p.project_title, p.funding_agency,p.scheme, p.sanction_reference_no,
             f.staff_name AS pi_name, f.department AS pi_dept
      FROM installments i
      LEFT JOIN projects p ON i.project_id = p.id
      LEFT JOIN endorsements e ON p.endorsement_id = e.id
      LEFT JOIN faculty_profile f ON e.user_id = f.user_id
      INNER JOIN installment_assign_history h ON h.installment_id = i.id
      WHERE h.assigned_from = $1
      AND LOWER(TRIM(i.status)) NOT IN ('completed', 'pending') AND i.installment='I'
      ORDER BY i.id DESC
    `,
      [username],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
});

router.get("/completed-by-me", async (req, res) => {
  try {
    const { username } = req.query;
    const result = await pool.query(
      `
      SELECT DISTINCT i.id, i.installment, i.status, i.assigned_to, i.created_at,
             p.project_title, p.funding_agency, p.scheme, p.sanction_reference_no,
             f.staff_name AS pi_name, f.department AS pi_dept
      FROM installments i
      LEFT JOIN projects p ON i.project_id = p.id
      LEFT JOIN endorsements e ON p.endorsement_id = e.id
      LEFT JOIN faculty_profile f ON e.user_id = f.user_id
      INNER JOIN installment_assign_history h ON h.installment_id = i.id
      WHERE h.assigned_from = $1
      AND LOWER(TRIM(i.status)) = 'completed' AND i.installment='I'
      ORDER BY i.id DESC
    `,
      [username],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
});

router.get("/detail/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [instRes, nrRes, mpRes, rhRes, ohRes, histRes] = await Promise.all([
      pool.query(
        `
        SELECT i.*, p.project_title, p.funding_agency, p.sanction_reference_no,
               p.sanction_reference_date, p.project_start_date, p.project_end_date,
               f.staff_name AS pi_name, f.designation AS pi_designation,
               f.department AS pi_dept, f.campus AS pi_campus,
               f.dob AS pi_dob, f.dos AS pi_dos, f.superannuation_date AS pi_superannuation,
               f.mobile AS pi_mobile
        FROM installments i
        LEFT JOIN projects p ON i.project_id = p.id
        LEFT JOIN endorsements e ON p.endorsement_id = e.id
        LEFT JOIN faculty_profile f ON e.user_id = f.user_id
        WHERE i.id = $1
      `,
        [id],
      ),
      pool.query(
        `SELECT * FROM non_recurring_heads WHERE installment_id = $1`,
        [id],
      ),
      pool.query(`SELECT * FROM manpower WHERE installment_id = $1`, [id]),
      pool.query(`SELECT * FROM recurring_heads WHERE installment_id = $1`, [
        id,
      ]),
      pool.query(`SELECT * FROM overheads WHERE installment_id = $1`, [id]),
      pool.query(
        `SELECT * FROM installment_assign_history WHERE installment_id = $1 ORDER BY created_at ASC`,
        [id],
      ),
    ]);
    if (instRes.rows.length === 0)
      return res.status(404).json({ error: "Not found" });
    res.json({
      installment: instRes.rows[0],
      nonRecurring: nrRes.rows,
      manpower: mpRes.rows,
      recurringHeads: rhRes.rows,
      overheads: ohRes.rows,
      history: histRes.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch detail" });
  }
});

router.get("/assign-history/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM installment_assign_history WHERE installment_id = $1 ORDER BY created_at ASC`,
      [id],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

router.get("/signatures/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const history = await pool.query(
      `SELECT * FROM installment_assign_history WHERE installment_id = $1 ORDER BY created_at ASC`,
      [id],
    );
    const rows = history.rows;
    const asstAction = rows.find((r) => r.action === "APPROVE_AND_ASSIGN");
    const supdtAction = rows.find((r) => r.action === "APPROVE_AND_ASSIGN_DD");
    const ddAction = rows.find(
      (r) => r.action === "APPROVE_AND_ASSIGN_DIRECTOR",
    );
    const dirAction = rows.find((r) => r.action === "FINAL_APPROVE");

    const getSig = async (name) => {
      if (!name) return null;
      const u = await pool.query(
        `SELECT signature_path FROM admin_users WHERE name = $1 LIMIT 1`,
        [name],
      );
      return u.rows[0]?.signature_path || null;
    };

    const [asstSig, supdtSig, ddSig, dirSig] = await Promise.all([
      getSig(asstAction?.assigned_from),
      getSig(supdtAction?.assigned_from),
      getSig(ddAction?.assigned_from),
      getSig(dirAction?.assigned_from),
    ]);

    res.json({ asstSig, supdtSig, ddSig, dirSig });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

router.put("/:id/approve-and-assign", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, assigned_from, remarks, scheme } = req.body;

    await pool.query(
      `UPDATE installments
       SET status = 'ASSIGNED TO SUPERVISOR',
           assigned_to = $1
       WHERE id = $2`,
      [assigned_to, id],
    );

    await pool.query(
      `INSERT INTO installment_assign_history
       (installment_id, assigned_from, assigned_to, action, remarks)
       VALUES ($1,$2,$3,'APPROVE_AND_ASSIGN',$4)`,
      [id, assigned_from, assigned_to, remarks || ""],
    );

    // ADD THIS BLOCK
    const projectResult = await pool.query(
      `SELECT project_id
       FROM installments
       WHERE id = $1`,
      [id],
    );

    await pool.query(
      `UPDATE projects
       SET scheme = $1
       WHERE id = $2`,
      [scheme, projectResult.rows[0].project_id],
    );

    res.json({
      message: "Approved and assigned to supervisor",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
});

router.put("/:id/approve-and-assign-director", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, assigned_from, remarks } = req.body;
    await pool.query(
      `UPDATE installments SET status = 'ASSIGNED TO DIRECTOR', assigned_to = $1 WHERE id = $2`,
      [assigned_to, id],
    );
    await pool.query(
      `INSERT INTO installment_assign_history (installment_id, assigned_from, assigned_to, action, remarks) VALUES ($1,$2,$3,'APPROVE_AND_ASSIGN_DIRECTOR',$4)`,
      [id, assigned_from, assigned_to, remarks || ""],
    );
    res.json({ message: "Approved and assigned to director" });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

router.put("/:id/approve-and-assign-dd", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, assigned_from, remarks } = req.body;
    await pool.query(
      `UPDATE installments SET status = 'ASSIGNED TO DD', assigned_to = $1 WHERE id = $2`,
      [assigned_to, id],
    );
    await pool.query(
      `INSERT INTO installment_assign_history (installment_id, assigned_from, assigned_to, action, remarks) VALUES ($1,$2,$3,'APPROVE_AND_ASSIGN_DD',$4)`,
      [id, assigned_from, assigned_to, remarks || ""],
    );
    res.json({ message: "Approved and assigned to DD" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
});

router.put("/:id/transfer-to-supervisor", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, assigned_from, remarks } = req.body;
    await pool.query(
      `UPDATE installments SET status = 'ASSIGNED TO SUPERVISOR', assigned_to = $1 WHERE id = $2`,
      [assigned_to, id],
    );
    await pool.query(
      `INSERT INTO installment_assign_history (installment_id, assigned_from, assigned_to, action, remarks) VALUES ($1,$2,$3,'TRANSFER_TO_SUPERVISOR',$4)`,
      [id, assigned_from, assigned_to, remarks || ""],
    );
    res.json({ message: "Transferred back to supervisor" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
});

router.put("/:id/transfer", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, assigned_from, remarks } = req.body;
    await pool.query(`UPDATE installments SET assigned_to = $1 WHERE id = $2`, [
      assigned_to,
      id,
    ]);
    await pool.query(
      `INSERT INTO installment_assign_history (installment_id, assigned_from, assigned_to, action, remarks) VALUES ($1,$2,$3,'TRANSFER',$4)`,
      [id, assigned_from, assigned_to, remarks || ""],
    );
    res.json({ message: "Transferred" });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

router.put("/:id/final-approve", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_from, remarks } = req.body;
    await pool.query(
      `UPDATE installments SET status = 'COMPLETED' WHERE id = $1`,
      [id],
    );
    await pool.query(
      `INSERT INTO installment_assign_history (installment_id, assigned_from, assigned_to, action, remarks) VALUES ($1,$2,$3,'FINAL_APPROVE',$4)`,
      [id, assigned_from, assigned_from, remarks || ""],
    );
    res.json({ message: "Final approved" });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { sanction_reference_no, project_start_date, project_end_date } =
      req.body;

    await pool.query(
      `UPDATE installments i
       SET project_id = i.project_id
       WHERE i.id = $1`,
      [id],
    );

    // sanction_reference_no, project_start_date, project_end_date live on
    // the projects table, joined via installments.project_id
    const instRes = await pool.query(
      `SELECT project_id FROM installments WHERE id = $1`,
      [id],
    );
    if (instRes.rows.length === 0) {
      return res.status(404).json({ error: "Installment not found" });
    }
    const projectId = instRes.rows[0].project_id;

    await pool.query(
      `UPDATE projects
       SET sanction_reference_no = $1,
           project_start_date = $2,
           project_end_date = $3
       WHERE id = $4`,
      [
        sanction_reference_no || null,
        project_start_date || null,
        project_end_date || null,
        projectId,
      ],
    );

    res.json({ message: "Updated successfully" });
  } catch (err) {
    console.error("Error updating installment/project", err);
    res.status(500).json({ error: "Failed to update" });
  }
});
router.put("/equipment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { equipment, amount } = req.body;

    await pool.query(
      `
      UPDATE non_recurring_heads
      SET equipment = $1,
          amount = $2
      WHERE id = $3
      `,
      [equipment, amount, id],
    );

    const instRes = await pool.query(
      `
      SELECT installment_id
      FROM non_recurring_heads
      WHERE id = $1
      `,
      [id],
    );

    const installmentId = instRes.rows[0].installment_id;

    await recalculateOverheads(installmentId);

    res.json({ message: "Equipment updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update equipment" });
  }
});
router.put("/manpower/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { manpower_type, amount } = req.body;

    await pool.query(
      `
      UPDATE manpower
      SET manpower_type = $1,
          amount = $2
      WHERE id = $3
      `,
      [manpower_type, amount, id],
    );
    const instRes = await pool.query(
      `
  SELECT installment_id
  FROM manpower
  WHERE id = $1
  `,
      [id],
    );

    const installmentId = instRes.rows[0].installment_id;

    await recalculateOverheads(installmentId);
    res.json({ message: "Manpower updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update manpower" });
  }
});
router.put("/recurring-heads/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { consumables, travel, contingency, ssr_budget } = req.body;

    await pool.query(
      `
      UPDATE recurring_heads
      SET consumables = $1,
          travel = $2,
          contingency = $3,
          ssr_budget = $4
      WHERE id = $5
      `,
      [consumables, travel, contingency, ssr_budget, id],
    );

    const instRes = await pool.query(
      `
      SELECT installment_id
      FROM recurring_heads
      WHERE id = $1
      `,
      [id],
    );

    await recalculateOverheads(instRes.rows[0].installment_id);

    res.json({
      message: "Recurring Heads Updated",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed",
    });
  }
});
async function recalculateOverheads(installmentId) {
  const nr = await pool.query(
    `
    SELECT COALESCE(SUM(amount),0) total
    FROM non_recurring_heads
    WHERE installment_id = $1
    `,
    [installmentId],
  );

  const mp = await pool.query(
    `
    SELECT COALESCE(SUM(amount),0) total
    FROM manpower
    WHERE installment_id = $1
    `,
    [installmentId],
  );

  const rh = await pool.query(
    `
    SELECT COALESCE(SUM(ssr_budget),0) total
    FROM recurring_heads
    WHERE installment_id = $1
    `,
    [installmentId],
  );

  const baseAmount =
    Number(nr.rows[0].total) +
    Number(mp.rows[0].total) +
    Number(rh.rows[0].total);

  const registrar = +(baseAmount * 0.05).toFixed(2);
  const dean = +(baseAmount * 0.04).toFixed(2);
  const csrc = +(baseAmount * 0.04).toFixed(2);
  const pdf = +(baseAmount * 0.02).toFixed(2);

  const totalOverhead = registrar + dean + csrc + pdf;

  await pool.query(
    `
    UPDATE overheads
    SET total_overhead = $1,
        registrar_ac = $2,
        dean_ac = $3,
        csrc_revenue_ac = $4,
        pi_pdf_ac = $5
    WHERE installment_id = $6
    `,
    [totalOverhead, registrar, dean, csrc, pdf, installmentId],
  );
}

router.put("/extensions/:id/assign", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, assign_remarks } = req.body;
    const result = await pool.query(
      `UPDATE project_extensions SET status = 'ASSIGNED', assigned_to = $1, assign_remarks = $2 WHERE id = $3 RETURNING *`,
      [assigned_to, assign_remarks, id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Extension not found" });
    res.json({ message: "Assigned successfully", extension: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to assign extension" });
  }
});

router.get("/extensions/assigned-to-me", async (req, res) => {
  try {
    const { username } = req.query;
    const result = await pool.query(
      `
      SELECT ex.id, ex.original_end_date, ex.revised_end_date,
             ex.extension_period, ex.reason, ex.status,
             ex.created_at, ex.assigned_to, ex.assign_remarks,
             p.project_title, p.funding_agency,
             f.staff_name AS pi_name
      FROM project_extensions ex
      LEFT JOIN projects p ON ex.project_id = p.id
      LEFT JOIN endorsements e ON p.endorsement_id = e.id
      LEFT JOIN faculty_profile f ON e.user_id = f.user_id
      WHERE LOWER(TRIM(ex.status)) = 'assigned'
      AND ex.assigned_to = $1
      ORDER BY ex.created_at DESC
    `,
      [username],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch" });
  }
});

router.get("/extensions/assigned-to-supervisor", async (req, res) => {
  try {
    const { username } = req.query;
    const result = await pool.query(
      `
      SELECT ex.id, ex.original_end_date, ex.revised_end_date,
             ex.extension_period, ex.reason, ex.status,
             ex.created_at, ex.assigned_to, ex.assign_remarks,
             p.project_title, p.funding_agency,
             f.staff_name AS pi_name
      FROM project_extensions ex
      LEFT JOIN projects p ON ex.project_id = p.id
      LEFT JOIN endorsements e ON p.endorsement_id = e.id
      LEFT JOIN faculty_profile f ON e.user_id = f.user_id
      WHERE LOWER(TRIM(ex.status)) = 'assigned to supervisor'
      AND ex.assigned_to = $1
      ORDER BY ex.created_at DESC
    `,
      [username],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch" });
  }
});

router.get("/extensions/assigned-to-director", async (req, res) => {
  try {
    const { username } = req.query;
    const result = await pool.query(
      `
      SELECT ex.id, ex.original_end_date, ex.revised_end_date,
             ex.extension_period, ex.reason, ex.status,
             ex.created_at, ex.assigned_to, ex.assign_remarks,
             p.project_title, p.funding_agency,
             f.staff_name AS pi_name
      FROM project_extensions ex
      LEFT JOIN projects p ON ex.project_id = p.id
      LEFT JOIN endorsements e ON p.endorsement_id = e.id
      LEFT JOIN faculty_profile f ON e.user_id = f.user_id
      WHERE LOWER(TRIM(ex.status)) = 'assigned to director'
      AND ex.assigned_to = $1
      ORDER BY ex.created_at DESC
    `,
      [username],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch" });
  }
});

router.get("/extensions/transferred-by-me", async (req, res) => {
  try {
    const { username } = req.query;
    const result = await pool.query(
      `
      SELECT DISTINCT ex.id, ex.original_end_date, ex.revised_end_date,
             ex.extension_period, ex.reason, ex.status, ex.created_at,
             ex.assigned_to,
             p.project_title, p.funding_agency,
             f.staff_name AS pi_name
      FROM project_extensions ex
      LEFT JOIN projects p ON ex.project_id = p.id
      LEFT JOIN endorsements e ON p.endorsement_id = e.id
      LEFT JOIN faculty_profile f ON e.user_id = f.user_id
      INNER JOIN extension_assign_history h ON h.extension_id = ex.id
      WHERE h.assigned_from = $1
      AND LOWER(TRIM(ex.status)) != 'completed'
      ORDER BY ex.id DESC
    `,
      [username],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch" });
  }
});

router.get("/extensions/completed-by-me", async (req, res) => {
  try {
    const { username } = req.query;
    const result = await pool.query(
      `
      SELECT DISTINCT ex.id, ex.original_end_date, ex.revised_end_date,
             ex.extension_period, ex.reason, ex.status, ex.created_at,
             ex.assigned_to,
             p.project_title, p.funding_agency,
             f.staff_name AS pi_name
      FROM project_extensions ex
      LEFT JOIN projects p ON ex.project_id = p.id
      LEFT JOIN endorsements e ON p.endorsement_id = e.id
      LEFT JOIN faculty_profile f ON e.user_id = f.user_id
      INNER JOIN extension_assign_history h ON h.extension_id = ex.id
      WHERE h.assigned_from = $1
      AND LOWER(TRIM(ex.status)) = 'completed'
      ORDER BY ex.id DESC
    `,
      [username],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch" });
  }
});

router.get("/extensions/assign-history/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM extension_assign_history WHERE extension_id = $1 ORDER BY created_at ASC`,
      [id],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

router.put("/extensions/:id/approve-and-assign", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, assigned_from, remarks } = req.body;
    await pool.query(
      `UPDATE project_extensions SET status = 'ASSIGNED TO SUPERVISOR', assigned_to = $1 WHERE id = $2`,
      [assigned_to, id],
    );
    await pool.query(
      `INSERT INTO extension_assign_history (extension_id, assigned_from, assigned_to, action, remarks) VALUES ($1,$2,$3,'APPROVE_AND_ASSIGN',$4)`,
      [id, assigned_from, assigned_to, remarks || ""],
    );
    res.json({ message: "Approved and assigned to supervisor" });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

router.put("/extensions/:id/approve-and-assign-director", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, assigned_from, remarks } = req.body;
    await pool.query(
      `UPDATE project_extensions SET status = 'ASSIGNED TO DIRECTOR', assigned_to = $1 WHERE id = $2`,
      [assigned_to, id],
    );
    await pool.query(
      `INSERT INTO extension_assign_history (extension_id, assigned_from, assigned_to, action, remarks) VALUES ($1,$2,$3,'APPROVE_AND_ASSIGN_DIRECTOR',$4)`,
      [id, assigned_from, assigned_to, remarks || ""],
    );
    res.json({ message: "Approved and assigned to director" });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

router.put("/extensions/:id/transfer", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, assigned_from, remarks } = req.body;
    await pool.query(
      `UPDATE project_extensions SET assigned_to = $1 WHERE id = $2`,
      [assigned_to, id],
    );
    await pool.query(
      `INSERT INTO extension_assign_history (extension_id, assigned_from, assigned_to, action, remarks) VALUES ($1,$2,$3,'TRANSFER',$4)`,
      [id, assigned_from, assigned_to, remarks || ""],
    );
    res.json({ message: "Transferred" });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

router.put("/extensions/:id/final-approve", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_from, remarks } = req.body;
    await pool.query(
      `UPDATE project_extensions SET status = 'COMPLETED' WHERE id = $1`,
      [id],
    );
    await pool.query(
      `INSERT INTO extension_assign_history (extension_id, assigned_from, assigned_to, action, remarks) VALUES ($1,$2,$3,'FINAL_APPROVE',$4)`,
      [id, assigned_from, assigned_from, remarks || ""],
    );
    res.json({ message: "Final approved" });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});
router.get("/extensions/dashboard-counts", async (req, res) => {
  try {
    const { username, role } = req.query;

    let query = "";

    if (role === "assistant") {
      query = `
        SELECT
          COUNT(*) FILTER (
            WHERE LOWER(TRIM(status)) = 'assigned'
              AND assigned_to = $1
          ) AS new_count,

          COUNT(*) FILTER (
            WHERE LOWER(TRIM(status)) IN (
              'assigned to supervisor',
              'assigned to director'
            )
            AND id IN (
              SELECT extension_id
              FROM extension_assign_history
              WHERE assigned_from = $1
            )
          ) AS transferred_count,

          COUNT(*) FILTER (
            WHERE LOWER(TRIM(status)) = 'completed'
            AND id IN (
              SELECT extension_id
              FROM extension_assign_history
              WHERE assigned_from = $1
            )
          ) AS completed_count

        FROM project_extensions;
      `;
    } else if (role === "superintendent") {
      query = `
        SELECT
          COUNT(*) FILTER (
            WHERE LOWER(TRIM(status)) = 'assigned to supervisor'
              AND assigned_to = $1
          ) AS new_count,

          COUNT(*) FILTER (
            WHERE LOWER(TRIM(status)) = 'assigned to director'
            AND id IN (
              SELECT extension_id
              FROM extension_assign_history
              WHERE assigned_from = $1
            )
          ) AS transferred_count,

          COUNT(*) FILTER (
            WHERE LOWER(TRIM(status)) = 'completed'
            AND id IN (
              SELECT extension_id
              FROM extension_assign_history
              WHERE assigned_from = $1
            )
          ) AS completed_count

        FROM project_extensions;
      `;
    } else if (role === "director") {
      query = `
        SELECT
          COUNT(*) FILTER (
            WHERE LOWER(TRIM(status)) = 'assigned to director'
              AND assigned_to = $1
          ) AS new_count,

          COUNT(*) FILTER (
            WHERE LOWER(TRIM(status)) = 'assigned to director'
              AND assigned_to = $1
          ) AS transferred_count,

          COUNT(*) FILTER (
            WHERE LOWER(TRIM(status)) = 'completed'
            AND id IN (
              SELECT extension_id
              FROM extension_assign_history
              WHERE assigned_from = $1
            )
          ) AS completed_count

        FROM project_extensions;
      `;
    }

    const result = await pool.query(query, [username]);

    const newCount = Number(result.rows[0].new_count || 0);
    const transferredCount = Number(result.rows[0].transferred_count || 0);
    const completedCount = Number(result.rows[0].completed_count || 0);

    res.json({
      total: newCount + transferredCount + completedCount,
      new: newCount,
      transferred: transferredCount,
      completed: completedCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch dashboard counts",
    });
  }
});
router.get("/extensions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `
  SELECT
      ex.*,

      p.project_title,
      p.funding_agency,
      p.scheme,
      p.sanction_reference_no,
      p.sanction_reference_date,
      p.project_start_date,
      p.project_end_date,

      f.staff_name AS pi_name,
      f.designation AS pi_designation,
      f.department AS pi_dept,
      f.campus AS pi_campus,

      au.name AS director_name,
      au.signature_path AS director_signature

  FROM project_extensions ex

  LEFT JOIN projects p
      ON ex.project_id = p.id

  LEFT JOIN endorsements e
      ON p.endorsement_id = e.id

  LEFT JOIN faculty_profile f
      ON e.user_id = f.user_id

  LEFT JOIN admin_users au
      ON LOWER(au.role) = 'director'

  WHERE ex.id = $1
  `,
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Extension not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch extension detail" });
  }
});
router.get("/reappropriation/pending", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
          r.*,
          p.project_title,
          p.funding_agency,
          p.scheme,
          f.staff_name AS pi_name
      FROM reappropriation_requests r
      LEFT JOIN projects p ON r.project_id = p.id
      LEFT JOIN endorsements e ON p.endorsement_id = e.id
      LEFT JOIN faculty_profile f ON e.user_id = f.user_id
      WHERE LOWER(TRIM(r.status)) = 'pending'
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch pending reappropriations" });
  }
});

router.get("/reappropriation/assigned", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
          r.*,
          p.project_title,
          p.funding_agency,
          p.scheme,
          f.staff_name AS pi_name
      FROM reappropriation_requests r
      LEFT JOIN projects p ON r.project_id = p.id
      LEFT JOIN endorsements e ON p.endorsement_id = e.id
      LEFT JOIN faculty_profile f ON e.user_id = f.user_id
      WHERE LOWER(TRIM(r.status)) IN ('assigned', 'assigned to supervisor', 'assigned to director')
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to fetch assigned reappropriations" });
  }
});

router.get("/reappropriation/completed", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
          r.*,
          p.project_title,
          p.funding_agency,
          p.scheme,
          f.staff_name AS pi_name
      FROM reappropriation_requests r
      LEFT JOIN projects p ON r.project_id = p.id
      LEFT JOIN endorsements e ON p.endorsement_id = e.id
      LEFT JOIN faculty_profile f ON e.user_id = f.user_id
      WHERE LOWER(TRIM(r.status)) = 'completed'
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to fetch completed reappropriations" });
  }
});

router.put("/reappropriation/:id/assign", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, assign_remarks } = req.body;

    const result = await pool.query(
      `UPDATE reappropriation_requests
       SET status = 'ASSIGNED', assigned_to = $1, assign_remarks = $2
       WHERE reappropriation_id = $3
       RETURNING *`,
      [assigned_to, assign_remarks || null, id],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Reappropriation request not found" });
    }

    await pool.query(
      `INSERT INTO reappropriation_assign_history
         (reappropriation_id, assigned_to, action, remarks)
       VALUES ($1, $2, 'ASSIGN', $3)`,
      [id, assigned_to, assign_remarks || ""],
    );

    res.json({ message: "Assigned successfully", sanction: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to assign reappropriation" });
  }
});
router.get("/reappropriation/assigned-to-me", async (req, res) => {
  try {
    const { username, type } = req.query;
    console.log("[Reap API] assigned-to-me", { username, type });

    const result = await pool.query(
      `
      SELECT
          r.*,
          p.project_title,
          p.funding_agency,
          p.scheme,
          f.staff_name AS pi_name

      FROM reappropriation_requests r

      LEFT JOIN projects p
        ON r.project_id=p.id

      LEFT JOIN endorsements e
        ON p.endorsement_id=e.id

      LEFT JOIN faculty_profile f
        ON e.user_id=f.user_id

      WHERE LOWER(TRIM(r.status))='assigned'
AND r.assigned_to=$1
AND LOWER(TRIM(r.reap_type))=$2

      ORDER BY r.created_at DESC
      `,
      [username, type],
    );

    console.log("[Reap API] assigned-to-me rows", result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
});
router.get("/reappropriation/assigned-to-supervisor", async (req, res) => {
  try {
    const { username, type } = req.query;
    console.log("[Reap API] assigned-to-supervisor", { username, type });

    const result = await pool.query(
      `
      SELECT
          r.*,
          p.project_title,
          p.funding_agency,
          p.scheme,
          f.staff_name AS pi_name

      FROM reappropriation_requests r

      LEFT JOIN projects p
        ON r.project_id=p.id

      LEFT JOIN endorsements e
        ON p.endorsement_id=e.id

      LEFT JOIN faculty_profile f
        ON e.user_id=f.user_id

      WHERE LOWER(TRIM(r.status))='assigned to supervisor'
AND r.assigned_to=$1
AND LOWER(TRIM(r.reap_type))=$2

      ORDER BY r.created_at DESC
      `,
      [username, type],
    );

    console.log("[Reap API] assigned-to-supervisor rows", result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
});
router.get("/reappropriation/assigned-to-dd", async (req, res) => {
  try {
    const { username, type } = req.query;
    console.log("[Reap API] assigned-to-dd", { username, type });

    const result = await pool.query(
      `
      SELECT
          r.*,
          p.project_title,
          p.funding_agency,
          p.scheme,
          f.staff_name AS pi_name

      FROM reappropriation_requests r

      LEFT JOIN projects p
        ON r.project_id=p.id

      LEFT JOIN endorsements e
        ON p.endorsement_id=e.id

      LEFT JOIN faculty_profile f
        ON e.user_id=f.user_id

      WHERE LOWER(TRIM(r.status))='assigned to dd'
AND r.assigned_to=$1
AND LOWER(TRIM(r.reap_type))=$2

      ORDER BY r.created_at DESC
      `,
      [username, type],
    );

    console.log("[Reap API] assigned-to-dd rows", result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
});
router.get("/reappropriation/assigned-to-director", async (req, res) => {
  try {
    const { username, type } = req.query;
    console.log("[Reap API] assigned-to-director", { username, type });

    const result = await pool.query(
      `
      SELECT
          r.*,
          p.project_title,
          p.funding_agency,
          p.scheme,
          f.staff_name AS pi_name

      FROM reappropriation_requests r

      LEFT JOIN projects p
        ON r.project_id=p.id

      LEFT JOIN endorsements e
        ON p.endorsement_id=e.id

      LEFT JOIN faculty_profile f
        ON e.user_id=f.user_id

      WHERE LOWER(TRIM(r.status))='assigned to director'
AND r.assigned_to=$1
AND LOWER(TRIM(r.reap_type))=$2

      ORDER BY r.created_at DESC
      `,
      [username, type],
    );

    console.log("[Reap API] assigned-to-director rows", result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
});
router.get("/reappropriation/transferred-by-me", async (req, res) => {
  try {
    const { username, type } = req.query;
    console.log("[Reap API] transferred-by-me", { username, type });

    const result = await pool.query(
      `
      SELECT DISTINCT
          r.*,
          p.project_title,
          p.funding_agency,
          p.scheme,
          f.staff_name AS pi_name

      FROM reappropriation_requests r

      LEFT JOIN projects p
        ON r.project_id=p.id

      LEFT JOIN endorsements e
        ON p.endorsement_id=e.id

      LEFT JOIN faculty_profile f
        ON e.user_id=f.user_id

      INNER JOIN reappropriation_assign_history h
        ON h.reappropriation_id=r.reappropriation_id

      WHERE h.assigned_from=$1

AND LOWER(TRIM(r.status))!='completed'

AND LOWER(TRIM(r.reap_type))=$2

      ORDER BY r.reappropriation_id DESC
      `,
      [username, type],
    );

    console.log("[Reap API] transferred-by-me rows", result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
});
router.get("/reappropriation/completed-by-me", async (req, res) => {
  try {
    const { username, type } = req.query;
    console.log("[Reap API] completed-by-me", { username, type });

    const result = await pool.query(
      `
      SELECT DISTINCT
          r.*,
          p.project_title,
          p.funding_agency,
          p.scheme,
          f.staff_name AS pi_name

      FROM reappropriation_requests r

      LEFT JOIN projects p
        ON r.project_id=p.id

      LEFT JOIN endorsements e
        ON p.endorsement_id=e.id

      LEFT JOIN faculty_profile f
        ON e.user_id=f.user_id

      INNER JOIN reappropriation_assign_history h
        ON h.reappropriation_id=r.reappropriation_id

      WHERE h.assigned_from=$1

AND LOWER(TRIM(r.status))='completed'

AND LOWER(TRIM(r.reap_type))=$2

      ORDER BY r.reappropriation_id DESC
      `,
      [username, type],
    );

    console.log("[Reap API] completed-by-me rows", result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
});
router.get("/reappropriation/dashboard-counts", async (req, res) => {
  try {
    const { username, role, type } = req.query;
    console.log("[Reap API] dashboard-counts", { username, role, type });
    let query = "";

    if (role === "assistant") {
      query = `
      SELECT

      COUNT(*) FILTER(
      WHERE LOWER(TRIM(status))='assigned'
      AND assigned_to=$1
      AND LOWER(TRIM(reap_type))=$2
      ) AS new_count,

      COUNT(*) FILTER (
WHERE LOWER(TRIM(status))
IN('assigned to supervisor','assigned to dd','assigned to director')
AND reappropriation_id IN (
    SELECT reappropriation_id
    FROM reappropriation_assign_history
    WHERE assigned_from=$1
)
AND LOWER(TRIM(reap_type))=$2
) AS transferred_count,

      COUNT(*) FILTER (
WHERE LOWER(TRIM(status))='completed'
AND reappropriation_id IN (
    SELECT reappropriation_id
    FROM reappropriation_assign_history
    WHERE assigned_from=$1
)
AND LOWER(TRIM(reap_type))=$2
) AS completed_count

      FROM reappropriation_requests;
      `;
    } else if (role === "superintendent") {
      query = `
      SELECT

      COUNT(*) FILTER(
      WHERE LOWER(TRIM(status))='assigned to supervisor'
      AND assigned_to=$1
      AND LOWER(TRIM(reap_type))=$2
      ) AS new_count,

      COUNT(*) FILTER (
WHERE LOWER(TRIM(status))
IN('assigned to dd','assigned to director')
AND reappropriation_id IN (
    SELECT reappropriation_id
    FROM reappropriation_assign_history
    WHERE assigned_from=$1
)
AND LOWER(TRIM(reap_type))=$2
) AS transferred_count,

      COUNT(*) FILTER (
WHERE LOWER(TRIM(status))='completed'
AND reappropriation_id IN (
    SELECT reappropriation_id
    FROM reappropriation_assign_history
    WHERE assigned_from=$1
)
AND LOWER(TRIM(reap_type))=$2
) AS completed_count

      FROM reappropriation_requests;
      `;
    } else if (role === "dd") {
      query = `
      SELECT

      COUNT(*) FILTER(
      WHERE LOWER(TRIM(status))='assigned to dd'
      AND assigned_to=$1
      AND LOWER(TRIM(reap_type))=$2
      ) AS new_count,

      COUNT(*) FILTER (
WHERE LOWER(TRIM(status))='assigned to director'
AND reappropriation_id IN (
    SELECT reappropriation_id
    FROM reappropriation_assign_history
    WHERE assigned_from=$1
)
AND LOWER(TRIM(reap_type))=$2
) AS transferred_count,

      COUNT(*) FILTER (
WHERE LOWER(TRIM(status))='completed'
AND reappropriation_id IN (
    SELECT reappropriation_id
    FROM reappropriation_assign_history
    WHERE assigned_from=$1
)
AND LOWER(TRIM(reap_type))=$2
) AS completed_count

      FROM reappropriation_requests;
      `;
    } else {
      query = `
      SELECT

      COUNT(*) FILTER(
      WHERE LOWER(TRIM(status))='assigned to director'
      AND assigned_to=$1
      AND LOWER(TRIM(reap_type))=$2
      ) AS new_count,

      COUNT(*) FILTER(
      WHERE LOWER(TRIM(status))='assigned to director'
      AND assigned_to=$1
      AND LOWER(TRIM(reap_type))=$2
      ) AS transferred_count,

      COUNT(*) FILTER (
WHERE LOWER(TRIM(status))='completed'
AND reappropriation_id IN (
    SELECT reappropriation_id
    FROM reappropriation_assign_history
    WHERE assigned_from=$1
)
AND LOWER(TRIM(reap_type))=$2
) AS completed_count

      FROM reappropriation_requests;
      `;
    }

    const result = await pool.query(query, [username, type]);
    const newCount = Number(result.rows[0].new_count || 0);
    const transferredCount = Number(result.rows[0].transferred_count || 0);
    const completedCount = Number(result.rows[0].completed_count || 0);

    console.log("[Reap API] dashboard-counts rows", {
      newCount,
      transferredCount,
      completedCount,
    });
    res.json({
      total: newCount + transferredCount + completedCount,
      new: newCount,
      transferred: transferredCount,
      completed: completedCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
});
router.get("/:id/director-signature", async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure the installment exists
    const inst = await pool.query(`SELECT id FROM installments WHERE id = $1`, [
      id,
    ]);

    if (inst.rows.length === 0) {
      return res.status(404).json({
        error: "Installment not found",
      });
    }

    const result = await pool.query(
      `
      SELECT
          name AS director_name,
          signature_path AS director_signature
      FROM admin_users
      WHERE LOWER(role) = 'director'
      LIMIT 1
      `,
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Director not found",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch director signature",
    });
  }
});
router.get("/reappropriation/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [reqRes, detailRes, histRes, prevInstRes] = await Promise.all([
      pool.query(
        `
        SELECT
            r.*,

            p.project_title,
            p.funding_agency,
            p.scheme,
            p.sanction_reference_no,
            p.sanction_reference_date,
            p.project_start_date,
            p.project_end_date,

            i.installment,

            f.staff_name AS pi_name,
            f.designation AS pi_designation,
            f.department AS pi_dept,
            f.campus AS pi_campus,

            au.name AS director_name,
            au.signature_path AS director_signature,

            COALESCE(rh.rh_total,0) AS recurring_total,
            COALESCE(nr.nr_total,0) AS non_recurring_total,
            COALESCE(mp.mp_total,0) AS manpower_total,
            COALESCE(oh.oh_total,0) AS overhead_total,
            COALESCE(rh.rh_total,0) + COALESCE(nr.nr_total,0)
              + COALESCE(mp.mp_total,0) + COALESCE(oh.oh_total,0) AS project_total_amount,

            (SELECT SUM(rd.amount) FROM reappropriation_details rd
             WHERE rd.reappropriation_id = r.reappropriation_id) AS reap_amount

        FROM reappropriation_requests r

        LEFT JOIN projects p
            ON r.project_id = p.id

        LEFT JOIN installments i
            ON r.installment_id = i.id

        LEFT JOIN endorsements e
            ON p.endorsement_id = e.id

        LEFT JOIN faculty_profile f
            ON e.user_id = f.user_id

        LEFT JOIN admin_users au
            ON LOWER(au.role)='director'

        LEFT JOIN (
    SELECT
        installment_id,
        SUM(
            COALESCE(consumables,0) +
            COALESCE(travel,0) +
            COALESCE(contingency,0) +
            COALESCE(ssr_budget,0)
        ) AS rh_total
    FROM recurring_heads
    GROUP BY installment_id
) rh
ON rh.installment_id = r.installment_id

       LEFT JOIN (
    SELECT
        installment_id,
        SUM(amount) AS nr_total
    FROM non_recurring_heads
    GROUP BY installment_id
) nr
ON nr.installment_id = r.installment_id

       LEFT JOIN (
    SELECT
        installment_id,
        SUM(amount) AS mp_total
    FROM manpower
    GROUP BY installment_id
) mp
ON mp.installment_id = r.installment_id

       LEFT JOIN (
    SELECT
        installment_id,
        SUM(total_overhead) AS oh_total
    FROM overheads
    GROUP BY installment_id
) oh
ON oh.installment_id = r.installment_id

        WHERE r.reappropriation_id=$1
        `,
        [id],
      ),

      pool.query(
        `SELECT * FROM reappropriation_details
         WHERE reappropriation_id=$1
         ORDER BY id`,
        [id],
      ),

      pool.query(
        `SELECT * FROM reappropriation_assign_history
         WHERE reappropriation_id=$1
         ORDER BY created_at ASC`,
        [id],
      ),

      pool.query(
        `SELECT
           i.id,
           i.installment AS no,
           i.created_at AS released_date,
           NULL::text AS proc_no,
           COALESCE((SELECT SUM(nr.amount) FROM non_recurring_heads nr WHERE nr.installment_id = i.id), 0) +
           COALESCE((SELECT SUM(mp.amount) FROM manpower mp WHERE mp.installment_id = i.id), 0) +
           COALESCE((SELECT (r.consumables + r.travel + r.contingency + COALESCE(r.ssr_budget,0))
                     FROM recurring_heads r WHERE r.installment_id = i.id), 0) +
           COALESCE((SELECT SUM(o.total_overhead) FROM overheads o WHERE o.installment_id = i.id), 0)
           AS amount
         FROM installments i
         WHERE i.project_id = (
           SELECT project_id FROM reappropriation_requests WHERE reappropriation_id = $1
         )
         ORDER BY i.id ASC`,
        [id],
      ),
    ]);

    if (reqRes.rows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    const installmentId = reqRes.rows[0]?.installment_id;

    // Budget snapshot for this installment
    const budgetRes = await pool.query(
      `SELECT
         COALESCE((SELECT SUM(nr.amount) FROM non_recurring_heads nr WHERE nr.installment_id = $1), 0) AS non_recurring_total,
         COALESCE((SELECT SUM(mp.amount) FROM manpower mp WHERE mp.installment_id = $1), 0) AS manpower_total,
         COALESCE((SELECT r.consumables FROM recurring_heads r WHERE r.installment_id = $1), 0) AS consumables,
         COALESCE((SELECT r.travel FROM recurring_heads r WHERE r.installment_id = $1), 0) AS travel,
         COALESCE((SELECT r.contingency FROM recurring_heads r WHERE r.installment_id = $1), 0) AS contingency,
         COALESCE((SELECT r.ssr_budget FROM recurring_heads r WHERE r.installment_id = $1), 0) AS ssr_budget,
         COALESCE((SELECT SUM(o.total_overhead) FROM overheads o WHERE o.installment_id = $1), 0) AS overhead_total`,
      [installmentId],
    );
    const originalHeads = [];

    // NON RECURRING
    const nrHeads = await pool.query(
      `
SELECT equipment AS head,
       amount
FROM non_recurring_heads
WHERE installment_id=$1
ORDER BY id
`,
      [installmentId],
    );

    nrHeads.rows.forEach((r) => {
      originalHeads.push({
        head: r.head,
        original: Number(r.amount),
        revised: Number(r.amount),
      });
    });

    // MANPOWER

    const mpHeads = await pool.query(
      `
SELECT manpower_type AS head,
       amount
FROM manpower
WHERE installment_id=$1
ORDER BY id
`,
      [installmentId],
    );

    mpHeads.rows.forEach((r) => {
      originalHeads.push({
        head: r.head,
        original: Number(r.amount),
        revised: Number(r.amount),
      });
    });

    // RECURRING

    const rh = await pool.query(
      `
SELECT consumables,
travel,
contingency,
ssr_budget
FROM recurring_heads
WHERE installment_id=$1
`,
      [installmentId],
    );

    if (rh.rows.length) {
      const r = rh.rows[0];

      originalHeads.push({
        head: "Consumables",
        original: Number(r.consumables),
        revised: Number(r.consumables),
      });

      originalHeads.push({
        head: "Travel",
        original: Number(r.travel),
        revised: Number(r.travel),
      });

      originalHeads.push({
        head: "Contingency",
        original: Number(r.contingency),
        revised: Number(r.contingency),
      });

      originalHeads.push({
        head: "SSR Budget",
        original: Number(r.ssr_budget),
        revised: Number(r.ssr_budget),
      });
    }
    detailRes.rows.forEach((item) => {
      const from = originalHeads.find(
        (x) => x.head.toLowerCase() == item.from_head.toLowerCase(),
      );

      if (from) from.revised -= Number(item.amount);

      const to = originalHeads.find(
        (x) => x.head.toLowerCase() == item.to_head.toLowerCase(),
      );

      if (to) to.revised += Number(item.amount);
    });
    const b = budgetRes.rows[0] || {};
    const budgetSnapshot = {
      non_recurring_total: parseFloat(b.non_recurring_total || 0),
      manpower_total: parseFloat(b.manpower_total || 0),
      consumables: parseFloat(b.consumables || 0),
      travel: parseFloat(b.travel || 0),
      contingency: parseFloat(b.contingency || 0),
      ssr_budget: parseFloat(b.ssr_budget || 0),
      overhead_total: parseFloat(b.overhead_total || 0),
    };
    // after Promise.all([...]) that gives reqRes, detailRes, histRes, prevInstRes

    const finalApprove = histRes.rows.find((r) => r.action === "FINAL_APPROVE");

    let directorSignature = reqRes.rows[0]?.director_signature || null;
    let directorNameResolved = reqRes.rows[0]?.director_name || null;

    if (finalApprove?.assigned_from) {
      const dirRes = await pool.query(
        `SELECT name, signature_path
     FROM admin_users
     WHERE name = $1 AND LOWER(role) = 'director'
     LIMIT 1`,
        [finalApprove.assigned_from],
      );
      if (dirRes.rows.length) {
        directorSignature = dirRes.rows[0].signature_path;
        directorNameResolved = dirRes.rows[0].name;
      }
    }
    console.log(originalHeads);
    res.json({
      request: reqRes.rows[0],
      details: detailRes.rows,
      history: histRes.rows,
      previousInstallments: prevInstRes.rows,
      budgetSnapshot,
      reportBudget: originalHeads,
      directorSignature, // ← new
      directorName: directorNameResolved, // ← new
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch detail" });
  }
});
router.get("/reappropriation/assign-history/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM reappropriation_assign_history
      WHERE reappropriation_id=$1
      ORDER BY created_at ASC
      `,
      [id],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed",
    });
  }
});
router.put("/reappropriation/:id/approve-and-assign", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, assigned_from, remarks } = req.body;
    console.log("[Reap API] approve-and-assign", {
      id,
      assigned_to,
      assigned_from,
      remarks,
    });

    await pool.query(
      `
      UPDATE reappropriation_requests
      SET
          status='ASSIGNED TO SUPERVISOR',
          assigned_to=$1
      WHERE reappropriation_id=$2
      `,
      [assigned_to, id],
    );

    await pool.query(
      `
      INSERT INTO reappropriation_assign_history
      (
          reappropriation_id,
          assigned_from,
          assigned_to,
          action,
          remarks
      )
      VALUES
      (
          $1,$2,$3,
          'APPROVE_AND_ASSIGN',
          $4
      )
      `,
      [id, assigned_from, assigned_to, remarks || ""],
    );

    res.json({
      message: "Approved and assigned to supervisor",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed",
    });
  }
});
router.put("/reappropriation/:id/approve-and-assign-dd", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, assigned_from, remarks } = req.body;
    console.log("[Reap API] approve-and-assign-dd", {
      id,
      assigned_to,
      assigned_from,
      remarks,
    });

    await pool.query(
      `
      UPDATE reappropriation_requests
      SET
          status='ASSIGNED TO DD',
          assigned_to=$1
      WHERE reappropriation_id=$2
      `,
      [assigned_to, id],
    );

    await pool.query(
      `
      INSERT INTO reappropriation_assign_history
      (
          reappropriation_id,
          assigned_from,
          assigned_to,
          action,
          remarks
      )
      VALUES
      (
          $1,$2,$3,
          'APPROVE_AND_ASSIGN_DD',
          $4
      )
      `,
      [id, assigned_from, assigned_to, remarks || ""],
    );

    res.json({
      message: "Approved and assigned to DD",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed",
    });
  }
});
// NOTE: this route now serves as the DD's approve action (approve & send
// to director) rather than the superviser's — the superviser now goes
// through approve-and-assign-dd above instead. The SQL itself needed no
// change since it already just moves the record to 'ASSIGNED TO DIRECTOR'.
router.put(
  "/reappropriation/:id/approve-and-assign-director",
  async (req, res) => {
    try {
      const { id } = req.params;

      const { assigned_to, assigned_from, remarks } = req.body;
      console.log("[Reap API] approve-and-assign-director", {
        id,
        assigned_to,
        assigned_from,
        remarks,
      });

      await pool.query(
        `
      UPDATE reappropriation_requests
      SET
          status='ASSIGNED TO DIRECTOR',
          assigned_to=$1
      WHERE reappropriation_id=$2
      `,
        [assigned_to, id],
      );

      await pool.query(
        `
      INSERT INTO reappropriation_assign_history
      (
          reappropriation_id,
          assigned_from,
          assigned_to,
          action,
          remarks
      )
      VALUES
      (
          $1,$2,$3,
          'APPROVE_AND_ASSIGN_DIRECTOR',
          $4
      )
      `,
        [id, assigned_from, assigned_to, remarks || ""],
      );

      res.json({
        message: "Approved and assigned to director",
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: "Failed",
      });
    }
  },
);
router.put("/reappropriation/:id/transfer-to-supervisor", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, assigned_from, remarks } = req.body;
    console.log("[Reap API] transfer-to-supervisor", {
      id,
      assigned_to,
      assigned_from,
      remarks,
    });

    await pool.query(
      `
      UPDATE reappropriation_requests
      SET
          status='ASSIGNED TO SUPERVISOR',
          assigned_to=$1
      WHERE reappropriation_id=$2
      `,
      [assigned_to, id],
    );

    await pool.query(
      `
      INSERT INTO reappropriation_assign_history
      (
          reappropriation_id,
          assigned_from,
          assigned_to,
          action,
          remarks
      )
      VALUES
      (
          $1,$2,$3,
          'TRANSFER_TO_SUPERVISOR',
          $4
      )
      `,
      [id, assigned_from, assigned_to, remarks || ""],
    );

    res.json({
      message: "Transferred back to supervisor",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed",
    });
  }
});
router.put("/reappropriation/:id/transfer", async (req, res) => {
  try {
    const { id } = req.params;

    const { assigned_to, assigned_from, remarks } = req.body;
    console.log("[Reap API] transfer", {
      id,
      assigned_to,
      assigned_from,
      remarks,
    });

    await pool.query(
      `
      UPDATE reappropriation_requests
      SET assigned_to=$1
      WHERE reappropriation_id=$2
      `,
      [assigned_to, id],
    );

    await pool.query(
      `
      INSERT INTO reappropriation_assign_history
      (
          reappropriation_id,
          assigned_from,
          assigned_to,
          action,
          remarks
      )
      VALUES
      (
          $1,$2,$3,
          'TRANSFER',
          $4
      )
      `,
      [id, assigned_from, assigned_to, remarks || ""],
    );

    res.json({
      message: "Transferred",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed",
    });
  }
});
router.put("/reappropriation/:id/final-approve", async (req, res) => {
  try {
    const { id } = req.params;

    const { assigned_from, remarks } = req.body;
    console.log("[Reap API] final-approve", {
      id,
      assigned_from,
      remarks,
    });

    await pool.query(
      `
      UPDATE reappropriation_requests
      SET status='COMPLETED'
      WHERE reappropriation_id=$1
      `,
      [id],
    );

    await pool.query(
      `
      INSERT INTO reappropriation_assign_history
      (
          reappropriation_id,
          assigned_from,
          assigned_to,
          action,
          remarks
      )
      VALUES
      (
          $1,$2,$3,
          'FINAL_APPROVE',
          $4
      )
      `,
      [id, assigned_from, assigned_from, remarks || ""],
    );

    res.json({
      message: "Final Approved",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed",
    });
  }
});
router.get("/full-detail/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [
      installmentResult,
      nonRecurringResult,
      manpowerResult,
      recurringHeadsResult,
      overheadsResult,
      historyResult,
      prevInstallmentsResult,
      reappropriationsResult,
    ] = await Promise.all([
      pool.query(
        `SELECT i.*,
                p.project_title, p.funding_agency, p.scheme,
                p.sanction_reference_no, p.sanction_reference_date,
                p.project_start_date, p.project_end_date,
                f.staff_name AS pi_name, f.designation AS pi_designation,
                f.department AS pi_dept, f.campus AS pi_campus
         FROM installments i
         LEFT JOIN projects p ON i.project_id = p.id
         LEFT JOIN endorsements e ON p.endorsement_id = e.id
         LEFT JOIN faculty_profile f ON e.user_id = f.user_id
         WHERE i.id = $1`,
        [id],
      ),
      pool.query(
        `SELECT * FROM installment_non_recurring WHERE installment_id = $1`,
        [id],
      ),
      pool.query(
        `SELECT * FROM installment_manpower WHERE installment_id = $1`,
        [id],
      ),
      pool.query(
        `SELECT * FROM installment_recurring_heads WHERE installment_id = $1`,
        [id],
      ),
      pool.query(
        `SELECT * FROM installment_overheads WHERE installment_id = $1`,
        [id],
      ),
      pool.query(
        `SELECT * FROM installment_assign_history WHERE installment_id = $1 ORDER BY created_at ASC`,
        [id],
      ),
      pool.query(
        `SELECT i2.id, i2.installment, i2.sanction_date,
           COALESCE((SELECT SUM(nr.amount) FROM installment_non_recurring nr WHERE nr.installment_id = i2.id), 0) +
           COALESCE((SELECT SUM(mp.amount) FROM installment_manpower mp WHERE mp.installment_id = i2.id), 0) +
           COALESCE((SELECT (r.consumables + r.travel + r.contingency) FROM installment_recurring_heads r WHERE r.installment_id = i2.id), 0) +
           COALESCE((SELECT o.total_overhead FROM installment_overheads o WHERE o.installment_id = i2.id), 0)
           AS total_amount
         FROM installments i2
         WHERE i2.project_id = (SELECT project_id FROM installments WHERE id = $1)
         AND i2.id != $1
         ORDER BY i2.id ASC`,
        [id],
      ),
      pool.query(
        `SELECT r.id, r.head_from, r.head_to, r.amount,
                r.reason, r.created_at, r.status, r.amount_in_words
         FROM reappropriations r
         WHERE r.installment_id = $1
         ORDER BY r.created_at DESC`,
        [id],
      ),
    ]);

    const nr = nonRecurringResult.rows.reduce(
      (s, r) => s + parseFloat(r.amount || 0),
      0,
    );
    const mp = manpowerResult.rows.reduce(
      (s, r) => s + parseFloat(r.amount || 0),
      0,
    );
    const rh = recurringHeadsResult.rows[0] || {};
    const rc =
      parseFloat(rh.consumables || 0) +
      parseFloat(rh.travel || 0) +
      parseFloat(rh.contingency || 0);
    const oh = overheadsResult.rows[0]
      ? parseFloat(overheadsResult.rows[0].total_overhead || 0)
      : 0;
    const grandTotal = nr + mp + rc + oh;

    res.json({
      installment: installmentResult.rows[0],
      nonRecurring: nonRecurringResult.rows,
      manpower: manpowerResult.rows,
      recurringHeads: recurringHeadsResult.rows,
      overheads: overheadsResult.rows,
      history: historyResult.rows,
      previousInstallments: prevInstallmentsResult.rows,
      reappropriations: reappropriationsResult.rows,
      grandTotal,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch full detail" });
  }
});
// ---------- NEW APPOINTMENTS (project_faculty_details) ----------
const APPOINTMENT_SELECT = `
  SELECT
      fd.*,
      p.project_title,
      p.funding_agency,
      f.staff_name AS pi_name
  FROM project_faculty_details fd
  LEFT JOIN projects p ON fd.project_id = p.id
  LEFT JOIN endorsements e ON p.endorsement_id = e.id
  LEFT JOIN faculty_profile f ON e.user_id = f.user_id
`;

router.get("/appointments/pending", async (req, res) => {
  try {
    const result = await pool.query(
      `${APPOINTMENT_SELECT} WHERE LOWER(TRIM(fd.status)) = 'pending' ORDER BY fd.created_at DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch pending appointments" });
  }
});

router.get("/appointments/assigned", async (req, res) => {
  try {
    const result = await pool.query(
      `${APPOINTMENT_SELECT}
       WHERE LOWER(TRIM(fd.status)) IN ('assigned', 'assigned to supervisor', 'assigned to director')
       ORDER BY fd.created_at DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch assigned appointments" });
  }
});

router.get("/appointments/completed", async (req, res) => {
  try {
    const result = await pool.query(
      `${APPOINTMENT_SELECT} WHERE LOWER(TRIM(fd.status)) = 'completed' ORDER BY fd.created_at DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch completed appointments" });
  }
});

// ---------- STAFF EXTENSIONS (project_faculty_extensions) ----------
const FACULTY_EXT_SELECT = `
  SELECT
      fe.*,
      fd.staff_name,
      fd.designation,
      p.project_title,
      p.funding_agency,
      f.staff_name AS pi_name
  FROM project_faculty_extensions fe
  LEFT JOIN project_faculty_details fd ON fe.project_faculty_id = fd.id
  LEFT JOIN projects p ON fe.project_id = p.id
  LEFT JOIN endorsements e ON p.endorsement_id = e.id
  LEFT JOIN faculty_profile f ON e.user_id = f.user_id
`;

router.get("/faculty-extensions/pending", async (req, res) => {
  try {
    const result = await pool.query(
      `${FACULTY_EXT_SELECT} WHERE LOWER(TRIM(fe.status)) = 'pending' ORDER BY fe.created_at DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch pending staff extensions" });
  }
});

router.get("/faculty-extensions/assigned", async (req, res) => {
  try {
    const result = await pool.query(
      `${FACULTY_EXT_SELECT}
       WHERE LOWER(TRIM(fe.status)) IN ('assigned', 'assigned to supervisor', 'assigned to director')
       ORDER BY fe.created_at DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to fetch assigned staff extensions" });
  }
});

router.get("/faculty-extensions/completed", async (req, res) => {
  try {
    const result = await pool.query(
      `${FACULTY_EXT_SELECT} WHERE LOWER(TRIM(fe.status)) = 'completed' ORDER BY fe.created_at DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to fetch completed staff extensions" });
  }
});

// ─────────────────────────────────────────────────────────
// FACULTY APPOINTMENT / EXTENSION 4-TIER WORKFLOW
// assistant -> superviser (superintendent) -> dd -> director -> completed
//
// Shared history table: faculty_assign_history
//   record_type: 'appointment' | 'extension'
//   record_id  : id in project_faculty_details / project_faculty_extensions
// ─────────────────────────────────────────────────────────

const FACULTY_STATUS = {
  ASSISTANT: "ASSIGNED",
  SUPERVISOR: "ASSIGNED TO SUPERVISOR",
  DD: "ASSIGNED TO DD",
  DIRECTOR: "ASSIGNED TO DIRECTOR",
  COMPLETED: "COMPLETED",
};

function registerFacultyWorkflow(
  router,
  {
    prefix,
    table,
    alias,
    selectSql,
    recordType,
    editableColumns = [],
    linked = null,
  },
) {
  // ---- Save edits from the Manage modal's "Edit" tab ----
  // `editableColumns` are columns that live directly on `table`.
  // `linked` (if set) describes a foreign row (e.g. for extensions,
  // staff_name/designation actually live on project_faculty_details,
  // reached via project_faculty_extensions.project_faculty_id) whose
  // columns should be updated instead when those keys show up in the body.
  router.put(`${prefix}/:id/details`, async (req, res) => {
    try {
      const { id } = req.params;
      const body = req.body || {};

      // "" from empty date/number inputs must become NULL, not the string "".
      const clean = (v) => (v === "" || v === undefined ? null : v);

      const ownUpdates = {};
      const linkedUpdates = {};
      for (const key of Object.keys(body)) {
        if (linked && linked.columns.includes(key)) {
          linkedUpdates[key] = clean(body[key]);
        } else if (editableColumns.includes(key)) {
          ownUpdates[key] = clean(body[key]);
        }
      }

      if (Object.keys(ownUpdates).length > 0) {
        const cols = Object.keys(ownUpdates);
        const setSql = cols.map((c, i) => `${c} = $${i + 1}`).join(", ");
        const values = cols.map((c) => ownUpdates[c]);
        values.push(id);
        await pool.query(
          `UPDATE ${table} SET ${setSql} WHERE id = $${values.length}`,
          values,
        );
      }

      if (linked && Object.keys(linkedUpdates).length > 0) {
        const cols = Object.keys(linkedUpdates);
        const setSql = cols.map((c, i) => `${c} = $${i + 1}`).join(", ");
        const values = cols.map((c) => linkedUpdates[c]);
        values.push(id);
        await pool.query(
          `UPDATE ${linked.table} SET ${setSql}
           WHERE id = (SELECT ${linked.foreignKey} FROM ${table} WHERE id = $${values.length})`,
          values,
        );
      }

      const result = await pool.query(`${selectSql} WHERE ${alias}.id = $1`, [
        id,
      ]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Record not found" });
      }
      res.json({ message: "Details updated", record: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update details" });
    }
  });

  // ---- Queue fetches, one per role stage ----
  const stageRoute = (path, statusValue) => {
    router.get(`${prefix}/${path}`, async (req, res) => {
      try {
        const { username } = req.query;
        const result = await pool.query(
          `${selectSql}
           WHERE LOWER(TRIM(${alias}.status)) = LOWER($1)
             AND ${alias}.assigned_to = $2
           ORDER BY ${alias}.created_at DESC`,
          [statusValue, username],
        );
        res.json(result.rows);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Failed to fetch ${path}` });
      }
    });
  };

  stageRoute("assigned-to-me", FACULTY_STATUS.ASSISTANT);
  stageRoute("assigned-to-supervisor", FACULTY_STATUS.SUPERVISOR);
  stageRoute("assigned-to-dd", FACULTY_STATUS.DD);
  stageRoute("assigned-to-director", FACULTY_STATUS.DIRECTOR);

  // NOTE: transferred-by-me / completed-by-me previously did
  // `SELECT DISTINCT ${alias}.*` with no joins at all, so project_title,
  // funding_agency, pi_name (and for extensions, staff_name/designation)
  // came back undefined — those tabs looked "broken"/empty in the UI even
  // though the row existed. Reuse the same selectSql the queue routes use
  // (which already has the LEFT JOINs to projects/endorsements/
  // faculty_profile[/project_faculty_details]) and just add DISTINCT plus
  // the history join/filter on top of it.
  const distinctSelectSql = selectSql.replace("SELECT", "SELECT DISTINCT");

  // ---- Records this user has forwarded on, still in progress ----
  router.get(`${prefix}/transferred-by-me`, async (req, res) => {
    try {
      const { username } = req.query;
      const result = await pool.query(
        `${distinctSelectSql}
         INNER JOIN faculty_assign_history h
           ON h.record_type = $1 AND h.record_id = ${alias}.id
         WHERE h.assigned_from = $2
           AND LOWER(TRIM(${alias}.status)) != LOWER($3)
         ORDER BY ${alias}.id DESC`,
        [recordType, username, FACULTY_STATUS.COMPLETED],
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch transferred-by-me" });
    }
  });

  // ---- Records this user has forwarded on that are now fully completed ----
  router.get(`${prefix}/completed-by-me`, async (req, res) => {
    try {
      const { username } = req.query;
      const result = await pool.query(
        `${distinctSelectSql}
         INNER JOIN faculty_assign_history h
           ON h.record_type = $1 AND h.record_id = ${alias}.id
         WHERE h.assigned_from = $2
           AND LOWER(TRIM(${alias}.status)) = LOWER($3)
         ORDER BY ${alias}.id DESC`,
        [recordType, username, FACULTY_STATUS.COMPLETED],
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch completed-by-me" });
    }
  });

  // ---- Full transfer/approval trail for one record ----
  router.get(`${prefix}/assign-history/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `SELECT * FROM faculty_assign_history
         WHERE record_type = $1 AND record_id = $2
         ORDER BY created_at ASC`,
        [recordType, id],
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch assign history" });
    }
  });

  // Helper to write one history row
  const logHistory = (id, assigned_from, assigned_to, action, remarks) =>
    pool.query(
      `INSERT INTO faculty_assign_history
         (record_type, record_id, assigned_from, assigned_to, action, remarks)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [recordType, id, assigned_from, assigned_to, action, remarks || ""],
    );

  // ---- ASSISTANT: Approve & Transfer -> superviser ----
  router.put(`${prefix}/:id/approve-and-assign`, async (req, res) => {
    try {
      const { id } = req.params;
      const { assigned_to, assigned_from, remarks } = req.body;
      await pool.query(
        `UPDATE ${table} SET status = $1, assigned_to = $2 WHERE id = $3`,
        [FACULTY_STATUS.SUPERVISOR, assigned_to, id],
      );
      await logHistory(
        id,
        assigned_from,
        assigned_to,
        "APPROVE_AND_ASSIGN",
        remarks,
      );
      res.json({ message: "Approved and assigned to superviser" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to approve and assign" });
    }
  });

  // ---- SUPERVISER: Approve & Transfer -> dd ----
  router.put(`${prefix}/:id/approve-and-assign-dd`, async (req, res) => {
    try {
      const { id } = req.params;
      const { assigned_to, assigned_from, remarks } = req.body;
      await pool.query(
        `UPDATE ${table} SET status = $1, assigned_to = $2 WHERE id = $3`,
        [FACULTY_STATUS.DD, assigned_to, id],
      );
      await logHistory(
        id,
        assigned_from,
        assigned_to,
        "APPROVE_AND_ASSIGN_DD",
        remarks,
      );
      res.json({ message: "Approved and assigned to DD" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to approve and assign to DD" });
    }
  });

  // ---- DD: Approve & Transfer -> director ----
  router.put(`${prefix}/:id/approve-and-assign-director`, async (req, res) => {
    try {
      const { id } = req.params;
      const { assigned_to, assigned_from, remarks } = req.body;
      await pool.query(
        `UPDATE ${table} SET status = $1, assigned_to = $2 WHERE id = $3`,
        [FACULTY_STATUS.DIRECTOR, assigned_to, id],
      );
      await logHistory(
        id,
        assigned_from,
        assigned_to,
        "APPROVE_AND_ASSIGN_DIRECTOR",
        remarks,
      );
      res.json({ message: "Approved and assigned to director" });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Failed to approve and assign to director" });
    }
  });

  // ---- ASSISTANT / SUPERVISER: Transfer (no approval), same level ----
  // Reassigns to another user at the SAME stage; status is untouched.
  router.put(`${prefix}/:id/transfer`, async (req, res) => {
    try {
      const { id } = req.params;
      const { assigned_to, assigned_from, remarks } = req.body;
      await pool.query(`UPDATE ${table} SET assigned_to = $1 WHERE id = $2`, [
        assigned_to,
        id,
      ]);
      await logHistory(id, assigned_from, assigned_to, "TRANSFER", remarks);
      res.json({ message: "Transferred" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to transfer" });
    }
  });

  // ---- DD: Transfer (no approval) -> sends back to superviser ----
  router.put(`${prefix}/:id/transfer-to-supervisor`, async (req, res) => {
    try {
      const { id } = req.params;
      const { assigned_to, assigned_from, remarks } = req.body;
      await pool.query(
        `UPDATE ${table} SET status = $1, assigned_to = $2 WHERE id = $3`,
        [FACULTY_STATUS.SUPERVISOR, assigned_to, id],
      );
      await logHistory(
        id,
        assigned_from,
        assigned_to,
        "TRANSFER_TO_SUPERVISOR",
        remarks,
      );
      res.json({ message: "Transferred back to superviser" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to transfer to superviser" });
    }
  });

  // ---- DIRECTOR: Final Approve -> completed ----
  router.put(`${prefix}/:id/final-approve`, async (req, res) => {
    try {
      const { id } = req.params;
      const { assigned_from, remarks } = req.body;
      await pool.query(`UPDATE ${table} SET status = $1 WHERE id = $2`, [
        FACULTY_STATUS.COMPLETED,
        id,
      ]);
      await logHistory(
        id,
        assigned_from,
        assigned_from,
        "FINAL_APPROVE",
        remarks,
      );
      res.json({ message: "Final Approved" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to final approve" });
    }
  });
}

// ── Register workflow routes (must be after FACULTY_STATUS + function def,
//    and before static /:id routes) ─────────────────────────────────────
registerFacultyWorkflow(router, {
  prefix: "/appointments",
  table: "project_faculty_details",
  alias: "fd",
  selectSql: APPOINTMENT_SELECT,
  recordType: "appointment",
  editableColumns: [
    "staff_name",
    "designation",
    "appointment_order_no",
    "appointment_order_date",
    "contract_period_from",
    "contract_period_upto",
    "joining_due_date",
    "fixed_salary",
    "hra",
  ],
});

registerFacultyWorkflow(router, {
  prefix: "/faculty-extensions",
  table: "project_faculty_extensions",
  alias: "fe",
  selectSql: FACULTY_EXT_SELECT,
  recordType: "extension",
  editableColumns: [
    "extension_order_no",
    "extension_order_date",
    "extension_from",
    "extension_upto",
    "rejoin_due_date",
    "fixed_salary",
    "hra",
  ],
  // staff_name / designation aren't columns on project_faculty_extensions —
  // they're joined in from the linked appointment row.
  linked: {
    table: "project_faculty_details",
    foreignKey: "project_faculty_id",
    columns: ["staff_name", "designation"],
  },
});

// ── /:id GET/PUT routes MUST come AFTER registerFacultyWorkflow ──────────────
// If placed before, Express matches /assigned-to-me as /:id = "assigned-to-me"

router.get("/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`${APPOINTMENT_SELECT} WHERE fd.id = $1`, [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch appointment detail" });
  }
});

router.put("/appointments/:id/assign", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, assign_remarks } = req.body;
    const result = await pool.query(
      `UPDATE project_faculty_details
       SET status = 'ASSIGNED', assigned_to = $1, assign_remarks = $2
       WHERE id = $3
       RETURNING *`,
      [assigned_to, assign_remarks || null, id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json({ message: "Assigned successfully", appointment: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to assign appointment" });
  }
});

router.get("/faculty-extensions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`${FACULTY_EXT_SELECT} WHERE fe.id = $1`, [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Staff extension not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch staff extension detail" });
  }
});

router.put("/faculty-extensions/:id/assign", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, assign_remarks } = req.body;
    const result = await pool.query(
      `UPDATE project_faculty_extensions
       SET status = 'ASSIGNED', assigned_to = $1, assign_remarks = $2
       WHERE id = $3
       RETURNING *`,
      [assigned_to, assign_remarks || null, id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Staff extension not found" });
    }
    res.json({ message: "Assigned successfully", extension: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to assign staff extension" });
  }
});

// ---- Dropdown source: Deputy Directors ----
router.get("/staff/dd", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, username, role FROM admin_users WHERE role = 'dd' ORDER BY name`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch DDs" });
  }
});

module.exports = router;
