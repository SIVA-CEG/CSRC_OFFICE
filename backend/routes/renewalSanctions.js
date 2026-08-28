const express = require("express");
const router = express.Router();
const pool = require("../db/db");

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
router.get("/reappropriation/pending", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.reappropriation_id AS id, r.status, r.created_at,
             r.assigned_to, r.assign_remarks,
             p.project_title, p.funding_agency,
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
    res.status(500).json({ error: "Failed to fetch pending requests" });
  }
});

router.get("/reappropriation/assigned", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.reappropriation_id AS id, r.status, r.created_at,
             r.assigned_to, r.assign_remarks,
             p.project_title, p.funding_agency,
             f.staff_name AS pi_name
      FROM reappropriation_requests r
      LEFT JOIN projects p ON r.project_id = p.id
      LEFT JOIN endorsements e ON p.endorsement_id = e.id
      LEFT JOIN faculty_profile f ON e.user_id = f.user_id
      WHERE LOWER(TRIM(r.status)) = 'assigned'
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch assigned requests" });
  }
});

router.get("/reappropriation/completed", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.reappropriation_id AS id, r.status, r.created_at,
             r.assigned_to, r.assign_remarks,
             p.project_title, p.funding_agency,
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
    res.status(500).json({ error: "Failed to fetch completed requests" });
  }
});
router.get("/reappropriation/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const requestRes = await pool.query(
      `
      SELECT r.*, p.project_title, p.funding_agency,
             i.installment,
             f.staff_name AS pi_name
      FROM reappropriation_requests r
      LEFT JOIN projects p ON r.project_id = p.id
      LEFT JOIN installments i ON r.installment_id = i.id
      LEFT JOIN endorsements e ON p.endorsement_id = e.id
      LEFT JOIN faculty_profile f ON e.user_id = f.user_id
      WHERE r.reappropriation_id = $1
    `,
      [id],
    );

    const detailsRes = await pool.query(
      `
      SELECT * FROM reappropriation_details WHERE reappropriation_id = $1
    `,
      [id],
    );

    if (requestRes.rows.length === 0)
      return res.status(404).json({ error: "Not found" });

    res.json({
      request: requestRes.rows[0],
      details: detailsRes.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reappropriation details" });
  }
});
router.put("/reappropriation/:id/assign", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, assign_remarks } = req.body;
    const result = await pool.query(
      `UPDATE reappropriation_requests SET status = 'ASSIGNED', assigned_to = $1, assign_remarks = $2 WHERE reappropriation_id = $3 RETURNING *`,
      [assigned_to, assign_remarks, id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Request not found" });
    res.json({ message: "Assigned successfully", request: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to assign request" });
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
      WHERE LOWER(TRIM(ex.status)) = 'under review'
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
      WHERE LOWER(TRIM(ex.status)) = 'assigned'
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
             p.id AS project_id, p.project_title, p.funding_agency,
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
      WHERE LOWER(TRIM(i.status)) = 'assigned' AND i.assigned_to = $1 AND i.installment <> 'I'
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
             p.id AS project_id, p.project_title, p.funding_agency,
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
      WHERE LOWER(TRIM(i.status)) = 'assigned to supervisor' AND i.assigned_to = $1 AND i.installment <> 'I'
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

router.get("/assigned-to-dd", async (req, res) => {
  try {
    const { username } = req.query;
    const result = await pool.query(
      `
      SELECT i.id, i.installment, i.status, i.assigned_to, i.created_at,
             p.id AS project_id, p.project_title, p.funding_agency,
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
      WHERE LOWER(TRIM(i.status)) = 'assigned to dd' AND i.assigned_to = $1 AND i.installment <> 'I'
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
             p.id AS project_id, p.project_title, p.funding_agency,
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
      WHERE LOWER(TRIM(i.status)) = 'assigned to director' AND i.assigned_to = $1 AND i.installment <> 'I'
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
             p.project_title, p.funding_agency, p.sanction_reference_no,
             f.staff_name AS pi_name, f.department AS pi_dept
      FROM installments i
      LEFT JOIN projects p ON i.project_id = p.id
      LEFT JOIN endorsements e ON p.endorsement_id = e.id
      LEFT JOIN faculty_profile f ON e.user_id = f.user_id
      INNER JOIN installment_assign_history h ON h.installment_id = i.id
      WHERE h.assigned_from = $1
      AND LOWER(TRIM(i.status)) NOT IN ('completed', 'pending') AND i.installment <> 'I'
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
             p.project_title, p.funding_agency, p.sanction_reference_no,
             f.staff_name AS pi_name, f.department AS pi_dept
      FROM installments i
      LEFT JOIN projects p ON i.project_id = p.id
      LEFT JOIN endorsements e ON p.endorsement_id = e.id
      LEFT JOIN faculty_profile f ON e.user_id = f.user_id
      INNER JOIN installment_assign_history h ON h.installment_id = i.id
      WHERE h.assigned_from = $1
      AND LOWER(TRIM(i.status)) = 'completed' AND i.installment <> 'I'
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
        SELECT i.*, p.project_title, p.funding_agency,p.scheme, p.sanction_reference_no,
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
    if (instRes.rows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    const installment = instRes.rows[0];

    const nonRecurring = nrRes.rows;
    const manpower = mpRes.rows;
    const recurringHeads = rhRes.rows;
    const overheads = ohRes.rows;
    const history = histRes.rows;

    const allInstallmentsResult = await pool.query(
      `
SELECT
    i.*,

    COALESCE(
      (
        SELECT json_agg(nr)
        FROM non_recurring_heads nr
        WHERE nr.installment_id = i.id
      ),
      '[]'
    ) AS non_recurring,

    COALESCE(
      (
        SELECT json_agg(mp)
        FROM manpower mp
        WHERE mp.installment_id = i.id
      ),
      '[]'
    ) AS manpower,

    (
      SELECT row_to_json(rh)
      FROM recurring_heads rh
      WHERE rh.installment_id = i.id
      LIMIT 1
    ) AS recurring,

    (
      SELECT row_to_json(oh)
      FROM overheads oh
      WHERE oh.installment_id = i.id
      LIMIT 1
    ) AS overhead

FROM installments i
WHERE i.project_id = $1

ORDER BY
CASE i.installment
  WHEN 'I' THEN 1
  WHEN 'II' THEN 2
  WHEN 'III' THEN 3
  WHEN 'IV' THEN 4
  WHEN 'V' THEN 5
END
`,
      [installment.project_id],
    );

    res.json({
      installment,
      nonRecurring,
      manpower,
      recurringHeads,
      overheads,
      history,
      allInstallments: allInstallmentsResult.rows,
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
    const { assigned_to, assigned_from, remarks } = req.body;
    await pool.query(
      `UPDATE installments SET status = 'ASSIGNED TO SUPERVISOR', assigned_to = $1 WHERE id = $2`,
      [assigned_to, id],
    );
    await pool.query(
      `INSERT INTO installment_assign_history (installment_id, assigned_from, assigned_to, action, remarks) VALUES ($1,$2,$3,'APPROVE_AND_ASSIGN',$4)`,
      [id, assigned_from, assigned_to, remarks || ""],
    );
    res.json({ message: "Approved and assigned to supervisor" });
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

// NOTE: this route now serves as the DD's approve action (approve & send
// to director) rather than the superviser's — the superviser now goes
// through approve-and-assign-dd above instead. The SQL itself needed no
// change since it already just moves the record to 'ASSIGNED TO DIRECTOR'.
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
module.exports = router;
