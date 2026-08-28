const express = require("express");
const multer = require("multer");
const router = express.Router();
const pool = require("../db/db");

const upload = multer({ dest: "uploads/endorsements" });
const PDFMerger = require("pdf-merger-js").default;
const path = require("path");
const fs = require("fs");
router.get("/all", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.id,
             e.status,
             e.full_project_title,
             e.funding_agency,
             e.reference_number,
             f.staff_name AS pi_name
      FROM endorsements e
      LEFT JOIN faculty_profile f ON e.user_id = f.user_id
      ORDER BY e.created_at DESC
      LIMIT 20
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching all endorsements", err);
    res.status(500).json({ error: "Failed to fetch all endorsements" });
  }
});

router.get("/pending", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.id,
             e.user_id,
             e.endorsement_id,
             e.applied_on,
             e.scheme,
             e.status,
             e.created_at,
             e.pdf_file,
             e.funding_agency,
             e.funding_agency_type,
             e.project_type,
             e.full_project_title,
             e.reference_number,
             e.non_recurring,
             e.recurring,
             e.overhead_percent,
             e.gst_added,
             e.total_amount,
             e.submission_due_date,
             e.is_pi_regular_faculty,
             e.endorsement_required,
             e.endorsement_format,
             e.report_pdf,
             f.salutation,
             f.initial,
             f.staff_name AS pi_name,
             f.designation AS pi_designation,
             f.department AS pi_dept,
             f.campus AS pi_campus,
            f.dob AS pi_dob,
            f.dos AS pi_dos,
            f.superannuation_date AS pi_superannuation,
             f.intercom,
             f.mobile
      FROM endorsements e
      LEFT JOIN faculty_profile f ON e.user_id = f.user_id
      WHERE LOWER(TRIM(e.status)) = 'pending'
      ORDER BY e.applied_on DESC NULLS LAST, e.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching pending endorsements", err);
    res.status(500).json({ error: "Failed to fetch pending endorsements" });
  }
});
router.get("/assigned", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.id,
             e.user_id,
             e.endorsement_id,
             e.applied_on,
             e.scheme,
             e.status,
             e.created_at,
             e.funding_agency,
             e.funding_agency_type,
             e.project_type,
             e.full_project_title,
             e.reference_number,
             e.non_recurring,
             e.recurring,
             e.overhead_percent,
             e.gst_added,
             e.total_amount,
             e.submission_due_date,
             e.is_pi_regular_faculty,
             e.endorsement_required,
             e.endorsement_format,
             e.report_pdf,
             e.assigned_to,
             e.assign_remarks,
             f.staff_name AS pi_name,
             f.designation AS pi_designation,
             f.department AS pi_dept,
             f.campus AS pi_campus,
             f.dob AS pi_dob,
             f.dos AS pi_dos,
             f.superannuation_date AS pi_superannuation
      FROM endorsements e
      LEFT JOIN faculty_profile f ON e.user_id = f.user_id
      WHERE LOWER(TRIM(e.status)) IN (
        'assigned',
        'assigned to supervisor',
        'assigned to dd',
        'assigned to director',
        'assigned_with_superviser',
        'assigned_with_director'
      )
      ORDER BY e.applied_on DESC NULLS LAST, e.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching assigned endorsements", err);
    res.status(500).json({ error: "Failed to fetch assigned endorsements" });
  }
});
router.get("/completed", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.id,
             e.user_id,
             e.endorsement_id,
             e.applied_on,
             e.scheme,
             e.status,
             e.created_at,
             e.funding_agency,
             e.funding_agency_type,
             e.project_type,
             e.full_project_title,
             e.reference_number,
             e.non_recurring,
             e.recurring,
             e.overhead_percent,
             e.gst_added,
             e.total_amount,
             e.submission_due_date,
             e.assigned_to,
             e.assign_remarks,
             f.staff_name AS pi_name,
             f.designation AS pi_designation,
             f.department AS pi_dept,
             f.campus AS pi_campus,
             f.dob AS pi_dob,
             f.dos AS pi_dos,
             f.superannuation_date AS pi_superannuation
      FROM endorsements e
      LEFT JOIN faculty_profile f ON e.user_id = f.user_id
      WHERE LOWER(TRIM(e.status)) IN ('completed', 'approved')
      ORDER BY e.applied_on DESC NULLS LAST, e.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching completed endorsements", err);
    res.status(500).json({ error: "Failed to fetch completed endorsements" });
  }
});

router.get("/assigned-to-me", async (req, res) => {
  try {
    const { username } = req.query;
    const result = await pool.query(
      `SELECT e.id, e.status, e.funding_agency, e.scheme, e.full_project_title,
              e.reference_number, e.applied_on, e.total_amount, e.assigned_to,
              f.staff_name AS pi_name
       FROM endorsements e
       LEFT JOIN faculty_profile f ON e.user_id = f.user_id
       WHERE LOWER(TRIM(e.status)) = 'assigned'
       AND e.assigned_to = $1
       ORDER BY e.created_at DESC`,
      [username],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch assigned endorsements" });
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
router.get("/transferred-by-me", async (req, res) => {
  try {
    const { username } = req.query;
    const result = await pool.query(
      `SELECT DISTINCT e.id, e.status, e.funding_agency, e.scheme,
              e.full_project_title, e.reference_number, e.applied_on,
              e.total_amount, e.assigned_to, e.endorsement_format,
              e.submission_due_date,
              f.staff_name AS pi_name, f.designation AS pi_designation,
              f.department AS pi_dept, f.campus AS pi_campus
       FROM endorsements e
       LEFT JOIN faculty_profile f ON e.user_id = f.user_id
       INNER JOIN endorsement_assign_history h ON h.endorsement_id = e.id
       WHERE h.assigned_from = $1
       AND LOWER(TRIM(e.status)) NOT IN ('approved', 'completed')
       ORDER BY e.id DESC`,
      [username],
    );

    // For each endorsement, get last history entry to determine current stage
    const enriched = await Promise.all(
      result.rows.map(async (row) => {
        const lastH = await pool.query(
          `SELECT * FROM endorsement_assign_history
         WHERE endorsement_id = $1
         ORDER BY created_at DESC LIMIT 1`,
          [row.id],
        );
        const last = lastH.rows[0];
        return {
          ...row,
          current_holder: last?.assigned_to || row.assigned_to,
          last_action: last?.action || "",
        };
      }),
    );

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transferred endorsements" });
  }
});

router.get("/assign-history/:endorsementId", async (req, res) => {
  try {
    const { endorsementId } = req.params;
    const result = await pool.query(
      `SELECT * FROM endorsement_assign_history
       WHERE endorsement_id = $1
       ORDER BY created_at ASC`,
      [endorsementId],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

router.get("/endorsement-meta/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const endorsement = await pool.query(
      `SELECT e.user_id, f.dos, f.superannuation_date FROM endorsements e
   LEFT JOIN faculty_profile f ON e.user_id = f.user_id
   WHERE e.id = $1`,
      [id],
    );
    if (endorsement.rows.length === 0)
      return res.status(404).json({ error: "Not found" });

    const superannuationDate = endorsement.rows[0].superannuation_date;
    let yearsService = "__";
    if (superannuationDate) {
      const today = new Date();
      const superDate = new Date(superannuationDate);
      const diffMs = superDate - today;
      const years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));
      yearsService = Math.max(0, years).toString();
    }

    res.json({
      yearsService,
      assistantSignaturePath: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch endorsement meta" });
  }
});

router.get("/assigned-to-supervisor", async (req, res) => {
  try {
    const { username } = req.query;
    const result = await pool.query(
      `SELECT e.id, e.status, e.funding_agency, e.scheme, e.full_project_title,
              e.reference_number, e.applied_on, e.total_amount, e.assigned_to,
              f.staff_name AS pi_name
       FROM endorsements e
       LEFT JOIN faculty_profile f ON e.user_id = f.user_id
       WHERE LOWER(TRIM(e.status)) = 'assigned to supervisor'
       AND e.assigned_to = $1
       ORDER BY e.created_at DESC`,
      [username],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch supervisor endorsements" });
  }
});
router.get("/assigned-to-director", async (req, res) => {
  try {
    const { username } = req.query;
    const result = await pool.query(
      `SELECT e.id, e.status, e.funding_agency, e.scheme, e.full_project_title,
              e.reference_number, e.applied_on, e.total_amount, e.assigned_to,
              e.endorsement_format,
              f.staff_name AS pi_name, f.designation AS pi_designation,
              f.department AS pi_dept, f.campus AS pi_campus
       FROM endorsements e
       LEFT JOIN faculty_profile f ON e.user_id = f.user_id
       WHERE LOWER(TRIM(e.status)) = 'assigned to director'
       AND e.assigned_to = $1
       ORDER BY e.created_at DESC`,
      [username],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch director endorsements" });
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

// Dropdown source for DD stage — same shape/pattern as sanctions.js's /staff/dd
router.get("/staff/dd", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, username, role FROM admin_users WHERE role = 'dd' ORDER BY name`,
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch DDs" });
  }
});

router.get("/assigned-to-dd", async (req, res) => {
  try {
    const { username } = req.query;
    const result = await pool.query(
      `SELECT e.id, e.status, e.funding_agency, e.scheme, e.full_project_title,
              e.reference_number, e.applied_on, e.total_amount, e.assigned_to,
              e.endorsement_format,
              f.staff_name AS pi_name, f.designation AS pi_designation,
              f.department AS pi_dept, f.campus AS pi_campus
       FROM endorsements e
       LEFT JOIN faculty_profile f ON e.user_id = f.user_id
       WHERE LOWER(TRIM(e.status)) = 'assigned to dd'
       AND e.assigned_to = $1
       ORDER BY e.created_at DESC`,
      [username],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch DD endorsements" });
  }
});

router.put("/:id/approve-and-assign-director", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, assigned_from, remarks } = req.body;

    await pool.query(
      `UPDATE endorsements SET status = 'ASSIGNED TO DIRECTOR', assigned_to = $1 WHERE id = $2`,
      [assigned_to, id],
    );

    await pool.query(
      `INSERT INTO endorsement_assign_history (endorsement_id, assigned_from, assigned_to, action, remarks)
       VALUES ($1, $2, $3, 'APPROVE_AND_ASSIGN_DIRECTOR', $4)`,
      [id, assigned_from, assigned_to, remarks],
    );

    res.json({ message: "Approved and assigned to director" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to approve and assign to director" });
  }
});

// ---- SUPERINTENDENT: Approve & Transfer -> DD ----
router.put("/:id/approve-and-assign-dd", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, assigned_from, remarks } = req.body;

    await pool.query(
      `UPDATE endorsements SET status = 'ASSIGNED TO DD', assigned_to = $1 WHERE id = $2`,
      [assigned_to, id],
    );

    await pool.query(
      `INSERT INTO endorsement_assign_history (endorsement_id, assigned_from, assigned_to, action, remarks)
       VALUES ($1, $2, $3, 'APPROVE_AND_ASSIGN_DD', $4)`,
      [id, assigned_from, assigned_to, remarks],
    );

    res.json({ message: "Approved and assigned to DD" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to approve and assign to DD" });
  }
});

// ---- DD: Transfer (no approval) -> sends back to superviser ----
router.put("/:id/transfer-to-supervisor", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, assigned_from, remarks } = req.body;

    await pool.query(
      `UPDATE endorsements SET status = 'ASSIGNED TO SUPERVISOR', assigned_to = $1 WHERE id = $2`,
      [assigned_to, id],
    );

    await pool.query(
      `INSERT INTO endorsement_assign_history (endorsement_id, assigned_from, assigned_to, action, remarks)
       VALUES ($1, $2, $3, 'TRANSFER_TO_SUPERVISOR', $4)`,
      [id, assigned_from, assigned_to, remarks],
    );

    res.json({ message: "Transferred back to superviser" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to transfer to superviser" });
  }
});

router.get("/signatures/:endorsementId", async (req, res) => {
  try {
    const { endorsementId } = req.params;

    const history = await pool.query(
      `SELECT * FROM endorsement_assign_history
       WHERE endorsement_id = $1
       ORDER BY created_at ASC`,
      [endorsementId],
    );

    const rows = history.rows;

    // Find who performed each approval action
    const asstAction = rows.find((r) => r.action === "APPROVE_AND_ASSIGN");
    const supdtAction = rows.find(
      (r) =>
        r.action === "APPROVE_AND_ASSIGN_DD" ||
        r.action === "APPROVE_AND_ASSIGN_SUPERVISOR",
    );
    const ddAction = rows.find(
      (r) => r.action === "APPROVE_AND_ASSIGN_DIRECTOR",
    );
    const dirAction = rows.find((r) => r.action === "FINAL_APPROVE");

    const fetchSig = async (name) => {
      if (!name) return null;
      const u = await pool.query(
        `SELECT signature_path FROM admin_users WHERE name = $1 LIMIT 1`,
        [name],
      );
      const p = u.rows[0]?.signature_path;
      return p ? p.replace(/\\/g, "/") : null;
    };

    const [asstSig, supdtSig, ddSig, dirSig] = await Promise.all([
      fetchSig(asstAction?.assigned_from),
      fetchSig(supdtAction?.assigned_from),
      fetchSig(ddAction?.assigned_from),
      fetchSig(dirAction?.assigned_from),
    ]);

    res.json({ asstSig, supdtSig, ddSig, dirSig });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch signatures" });
  }
});



router.get("/completed-full", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.id, e.status, e.funding_agency, e.scheme, e.full_project_title,
             e.reference_number, e.applied_on, e.total_amount, e.assigned_to,
             e.endorsement_format, e.submission_due_date,
             f.staff_name AS pi_name, f.designation AS pi_designation,
             f.department AS pi_dept, f.campus AS pi_campus,
             f.superannuation_date AS pi_superannuation
      FROM endorsements e
      LEFT JOIN faculty_profile f ON e.user_id = f.user_id
      WHERE LOWER(TRIM(e.status)) IN ('approved', 'completed')
      ORDER BY e.id DESC
    `);

    const enriched = await Promise.all(
      result.rows.map(async (row) => {
        const historyRes = await pool.query(
          `SELECT * FROM endorsement_assign_history WHERE endorsement_id = $1 ORDER BY created_at ASC`,
          [row.id],
        );

        const history = historyRes.rows;
        const asstAction = history.find(
          (h) => h.action === "APPROVE_AND_ASSIGN",
        );
        const supdtAction = history.find(
          (h) => h.action === "APPROVE_AND_ASSIGN_DD",
        );
        const ddAction = history.find(
          (h) => h.action === "APPROVE_AND_ASSIGN_DIRECTOR",
        );
        const dirAction = history.find((h) => h.action === "FINAL_APPROVE");

        let asstSig = null,
          supdtSig = null,
          ddSig = null,
          dirSig = null;
        if (asstAction) {
          const u = await pool.query(
            `SELECT signature_path FROM admin_users WHERE name = $1 LIMIT 1`,
            [asstAction.assigned_from],
          );
          asstSig = u.rows[0]?.signature_path || null;
        }
        if (supdtAction) {
          const u = await pool.query(
            `SELECT signature_path FROM admin_users WHERE name = $1 LIMIT 1`,
            [supdtAction.assigned_from],
          );
          supdtSig = u.rows[0]?.signature_path || null;
        }
        if (ddAction) {
          const u = await pool.query(
            `SELECT signature_path FROM admin_users WHERE name = $1 LIMIT 1`,
            [ddAction.assigned_from],
          );
          ddSig = u.rows[0]?.signature_path || null;
        }
        if (dirAction) {
          const u = await pool.query(
            `SELECT signature_path FROM admin_users WHERE name = $1 LIMIT 1`,
            [dirAction.assigned_from],
          );
          dirSig = u.rows[0]?.signature_path || null;
        }

        const completedEntry = history.find(
          (h) => h.action === "FINAL_APPROVE",
        );

        return {
          ...row,
          history,
          completed_on: completedEntry?.created_at || null,
          asstSig,
          supdtSig,
          ddSig,
          dirSig,
        };
      }),
    );

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch completed endorsements" });
  }
});
router.get("/search", async (req, res) => {
  try {
    const {
      fundingAgency,
      projectScheme,
      fundingType,
      facultyName,
      department,
      campus,
      tapalNo,
      dateFrom,
      dateTo,
    } = req.query;

    let query = `
      SELECT
        e.id,
        e.applied_on,
        e.reference_number,
        e.funding_agency,
        e.scheme,
        e.funding_agency_type,
        e.total_amount,
        e.status,
        f.staff_name,
        f.department,
        f.campus
      FROM endorsements e
      LEFT JOIN faculty_profile f
        ON e.user_id = f.user_id
      WHERE 1=1
    `;

    const values = [];
    let idx = 1;

    if (fundingAgency) {
      query += ` AND e.funding_agency = $${idx++}`;
      values.push(fundingAgency);
    }

    if (projectScheme) {
      query += ` AND LOWER(e.scheme) LIKE LOWER($${idx++})`;
      values.push(`%${projectScheme}%`);
    }

    if (fundingType) {
      query += ` AND e.funding_agency_type = $${idx++}`;
      values.push(fundingType);
    }

    if (facultyName) {
      query += ` AND LOWER(f.staff_name) LIKE LOWER($${idx++})`;
      values.push(`%${facultyName}%`);
    }

    if (department) {
      query += ` AND LOWER(f.department) LIKE LOWER($${idx++})`;
      values.push(`%${department}%`);
    }

    if (campus) {
      query += ` AND f.campus = $${idx++}`;
      values.push(campus);
    }

    if (tapalNo) {
      query += ` AND LOWER(COALESCE(e.reference_number,'')) LIKE LOWER($${idx++})`;
      values.push(`%${tapalNo}%`);
    }

    if (dateFrom) {
      query += ` AND e.applied_on >= $${idx++}`;
      values.push(dateFrom);
    }

    if (dateTo) {
      query += ` AND e.applied_on <= $${idx++}`;
      values.push(dateTo);
    }

    query += `
      ORDER BY e.created_at DESC
    `;

    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to search endorsements",
    });
  }
});

router.get("/dashboard-counts", async (req, res) => {
  //console.log("DASHBOARD COUNTS HIT");
  try {
    const { username } = req.query;

    const userResult = await pool.query(
      `
      SELECT name, role
      FROM admin_users
      WHERE username = $1
      `,
      [username],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const user = userResult.rows[0];

    const name = user.name;
    const role = user.role;

    let counts = {
      awaiting: 0,
      pending: 0,
      completed: 0,
      total: 0,
    };

    // =====================================
    // ASSISTANT
    // =====================================
    if (role === "assistant") {
      const awaiting = await pool.query(
        `
        SELECT COUNT(*)
        FROM endorsements
        WHERE status='ASSIGNED'
        AND assigned_to=$1
        `,
        [name],
      );

      const pending = await pool.query(
        `
        SELECT COUNT(DISTINCT e.id)
        FROM endorsements e
        WHERE LOWER(TRIM(e.status)) IN ('assigned to supervisor', 'assigned to dd', 'assigned to director')
        AND EXISTS (
          SELECT 1
          FROM endorsement_assign_history h
          WHERE h.endorsement_id = e.id
          AND h.assigned_from = $1
          AND h.action = 'APPROVE_AND_ASSIGN'
        )
        `,
        [name],
      );

      const completed = await pool.query(
        `
        SELECT COUNT(DISTINCT h1.endorsement_id)
        FROM endorsement_assign_history h1
        WHERE h1.assigned_from=$1
        AND h1.action='APPROVE_AND_ASSIGN'
        AND EXISTS (
          SELECT 1
          FROM endorsement_assign_history h2
          WHERE h2.endorsement_id=h1.endorsement_id
          AND h2.action='FINAL_APPROVE'
        )
        `,
        [name],
      );

      counts.awaiting = Number(awaiting.rows[0].count);
      counts.pending = Number(pending.rows[0].count);
      counts.completed = Number(completed.rows[0].count);
      counts.total = counts.awaiting + counts.pending + counts.completed;
    }

    // =====================================
    // SUPERINTENDENT
    // =====================================
    else if (role === "superintendent") {
      const awaiting = await pool.query(
        `
        SELECT COUNT(*)
        FROM endorsements
        WHERE status='ASSIGNED TO SUPERVISOR'
        AND assigned_to=$1
        `,
        [name],
      );

      const pending = await pool.query(
        `
        SELECT COUNT(DISTINCT e.id)
        FROM endorsements e
        WHERE LOWER(TRIM(e.status)) IN ('assigned to dd', 'assigned to director')
        AND EXISTS (
          SELECT 1
          FROM endorsement_assign_history h
          WHERE h.endorsement_id = e.id
          AND h.assigned_from = $1
          AND h.action = 'APPROVE_AND_ASSIGN_DD'
        )
        `,
        [name],
      );

      const completed = await pool.query(
        `
        SELECT COUNT(DISTINCT h1.endorsement_id)
        FROM endorsement_assign_history h1
        WHERE h1.assigned_from=$1
        AND h1.action='APPROVE_AND_ASSIGN_DD'
        AND EXISTS (
          SELECT 1
          FROM endorsement_assign_history h2
          WHERE h2.endorsement_id=h1.endorsement_id
          AND h2.action='FINAL_APPROVE'
        )
        `,
        [name],
      );

      counts.awaiting = Number(awaiting.rows[0].count);
      counts.pending = Number(pending.rows[0].count);
      counts.completed = Number(completed.rows[0].count);
      counts.total = counts.awaiting + counts.pending + counts.completed;
    }

    // =====================================
    // DD
    // =====================================
    else if (role === "dd") {
      const awaiting = await pool.query(
        `
        SELECT COUNT(*)
        FROM endorsements
        WHERE status='ASSIGNED TO DD'
        AND assigned_to=$1
        `,
        [name],
      );

      const pending = await pool.query(
        `
        SELECT COUNT(DISTINCT e.id)
        FROM endorsements e
        WHERE LOWER(TRIM(e.status)) IN ('assigned to director')
        AND EXISTS (
          SELECT 1
          FROM endorsement_assign_history h
          WHERE h.endorsement_id = e.id
          AND h.assigned_from = $1
          AND h.action = 'APPROVE_AND_ASSIGN_DIRECTOR'
        )
        `,
        [name],
      );

      const completed = await pool.query(
        `
        SELECT COUNT(DISTINCT h1.endorsement_id)
        FROM endorsement_assign_history h1
        WHERE h1.assigned_from=$1
        AND h1.action='APPROVE_AND_ASSIGN_DIRECTOR'
        AND EXISTS (
          SELECT 1
          FROM endorsement_assign_history h2
          WHERE h2.endorsement_id=h1.endorsement_id
          AND h2.action='FINAL_APPROVE'
        )
        `,
        [name],
      );

      counts.awaiting = Number(awaiting.rows[0].count);
      counts.pending = Number(pending.rows[0].count);
      counts.completed = Number(completed.rows[0].count);
      counts.total = counts.awaiting + counts.pending + counts.completed;
    }

    // =====================================
    // DIRECTOR
    // =====================================
    else if (role === "director") {
      const awaiting = await pool.query(`
        SELECT COUNT(*)
        FROM endorsements
        WHERE status IN (
          'PENDING',
          'pending'
          
        )
      `);

      const pending = await pool.query(`
        SELECT COUNT(*)
        FROM endorsements
        WHERE status IN (
          
          'ASSIGNED',
          'ASSIGNED TO SUPERVISOR',
          'ASSIGNED TO DD',
          'ASSIGNED TO DIRECTOR'
        )
      `);

      const completed = await pool.query(`
        SELECT COUNT(*)
        FROM endorsements
        WHERE status IN (
          'APPROVED',
          'COMPLETED'
          
        )
      `);

      const total = await pool.query(`
        SELECT COUNT(*)
        FROM endorsements
      `);

      counts.awaiting = Number(awaiting.rows[0]?.count || 0);
      counts.pending = Number(pending.rows[0]?.count || 0);
      counts.completed = Number(completed.rows[0]?.count || 0);
      counts.total = Number(total.rows[0]?.count || 0);
    }

    res.json(counts);
  } catch (err) {
    console.error("DASHBOARD ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

router.post("/save-report", upload.single("report_pdf"), async (req, res) => {
  try {
    const { endorsementId } = req.body;
    const file = req.file;

    if (!endorsementId) {
      return res.status(400).json({ error: "Missing endorsementId" });
    }

    if (!file) {
      return res.status(400).json({ error: "Missing report_pdf file" });
    }

    const reportDir = path.join("uploads", "endorsements");
    const reportFileName = `ENDORSEMENT_${endorsementId}_FINAL.pdf`;
    const reportPath = path.join(reportDir, reportFileName);

    fs.mkdirSync(reportDir, { recursive: true });
    fs.renameSync(file.path, reportPath);

    const result = await pool.query(
      `UPDATE endorsements SET report_pdf = $1 WHERE id = $2 RETURNING *`,
      [`/${reportPath.replace(/\\/g, "/")}`, endorsementId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Endorsement not found" });
    }

    res.json({
      message: "Report uploaded",
      endorsementId,
      file: result.rows[0].report_pdf,
    });
  } catch (err) {
    console.error("Error saving endorsement report", err);
    res.status(500).json({ error: "Failed to save report" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Fetch main endorsement with faculty (PI) info
    const endorsementQuery = `
      SELECT e.*, 
             f.salutation,
             f.initial,
             f.staff_name AS pi_name,
             f.designation AS pi_designation,
             f.department AS pi_dept,
             f.campus AS pi_campus,
             f.dob AS pi_dob,
             f.dos AS pi_dos,
             f.superannuation_date AS pi_superannuation,
             f.intercom,
             f.mobile
      FROM endorsements e
      LEFT JOIN faculty_profile f ON e.user_id = f.user_id
      WHERE e.id = $1
    `;

    const docsQuery = `
      SELECT id, endorsement_id, proposal_copy, signed_writeup, signed_budget, endorsement_format_file, overhead_exemption_file, created_at
      FROM endorsement_documents
      WHERE endorsement_id = $1
      ORDER BY created_at DESC
    `;

    const copiQuery = `
      SELECT c.id, c.endorsement_id, c.copi_user_id, c.role, c.created_at,
             f.staff_name AS copi_name,
             f.designation AS copi_designation,
             f.department AS copi_dept,
             f.campus AS copi_campus,
             f.dob AS copi_dob,
             f.dos AS copi_dos,
             f.superannuation_date AS copi_superannuation
      FROM endorsement_copi c
      LEFT JOIN faculty_profile f ON c.copi_user_id = f.user_id
      WHERE c.endorsement_id = $1
      ORDER BY c.created_at DESC
    `;

    const extInvQuery = `
      SELECT id, endorsement_id, full_name, designation, institute, created_at
      FROM endorsement_external_investigators
      WHERE endorsement_id = $1
      ORDER BY created_at DESC
    `;

    const [endorsementRes, docsRes, copiRes, extInvRes] = await Promise.all([
      pool.query(endorsementQuery, [id]),
      pool.query(docsQuery, [id]),
      pool.query(copiQuery, [id]),
      pool.query(extInvQuery, [id]),
    ]);

    if (endorsementRes.rows.length === 0) {
      return res.status(404).json({ error: "Endorsement not found" });
    }

    const endorsement = endorsementRes.rows[0];

    res.json({
      endorsement,
      documents: docsRes.rows,
      copi: copiRes.rows,
      external_investigators: extInvRes.rows,
    });
  } catch (err) {
    console.error("Error fetching endorsement", err);
    res.status(500).json({ error: "Failed to fetch endorsement" });
  }
});

router.post("/", upload.any(), async (req, res) => {
  try {
    const rawData = req.body;
    const files = req.files || [];
    const now = new Date();

    const nextIdResult = await pool.query(`
  SELECT COALESCE(MAX(CAST(endorsement_id AS BIGINT)), 0) + 1 AS next_id
  FROM endorsements
  WHERE endorsement_id ~ '^[0-9]+$'
`);

    const endorsementIdValue = nextIdResult.rows[0].next_id;
    const appliedOn = rawData.applied_on || now.toISOString().slice(0, 10);
    const createdAt = now.toISOString();

    // endorsements.user_id is the join key every other route uses to pull PI
    // details from faculty_profile (e.user_id = f.user_id) — so it must hold
    // the *selected PI's* faculty user id, not the office staff submitting
    // the form. Fall back to rawData.user_id only if no PI was picked.
    const piUserId = rawData.pi_user_id || rawData.user_id || null;

    const insertQuery = `
      INSERT INTO endorsements (
        user_id,
        endorsement_id,
        applied_on,
        scheme,
        status,
        created_at,
        pdf_file,
        funding_agency,
        funding_agency_type,
        project_type,
        full_project_title,
        reference_number,
        non_recurring,
        recurring,
        overhead_percent,
        gst_added,
        total_amount,
        submission_due_date,
        is_pi_regular_faculty,
        endorsement_required,
        endorsement_format,
        report_pdf
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
      RETURNING id, endorsement_id
    `;

    const params = [
      piUserId,
      endorsementIdValue,
      appliedOn,
      rawData.scheme || rawData.project_scheme || null,
      "PENDING",
      createdAt,
      null,
      rawData.funding_agency || null,
      rawData.funding_agency_type || null,
      rawData.project_type || null,
      rawData.full_project_title || null,
      rawData.reference_number || null,
      rawData.non_recurring || null,
      rawData.recurring || null,
      rawData.overhead_percent || null,
      rawData.gst_added === "true" || rawData.gst_added === true,
      rawData.total_amount || null,
      rawData.submission_due_date || null,
      rawData.is_pi_regular_faculty === "true" ||
        rawData.is_pi_regular_faculty === true,
      rawData.endorsement_required === "true" ||
        rawData.endorsement_required === true,
      rawData.endorsement_format || null,
      null,
    ];

    const result = await pool.query(insertQuery, params);
    const endorsementId = result.rows[0].id;
    const merger = new PDFMerger();

    const mergedDir = path.join("uploads", "endorsements");
    fs.mkdirSync(mergedDir, { recursive: true });
    const mergedPdfPath = path.join(
      mergedDir,
      `ENDORSEMENT_${endorsementId}.pdf`,
    );

    for (const file of files) {
      try {
        await merger.add(file.path);
      } catch (err) {
        console.log("Skipping non-PDF:", file.originalname);
      }
    }

    await merger.save(mergedPdfPath);

    await pool.query(
      `
  UPDATE endorsements
  SET pdf_file = $1
  WHERE id = $2
  `,
      [`/${mergedPdfPath.replace(/\\/g, "/")}`, endorsementId],
    );
    // ── Persist uploaded documents (proposal copy, signed writeup/budget,
    // endorsement format file, overhead exemption file) so GET /:id can
    // actually find them via endorsement_documents.
    const filesByField = {};
    files.forEach((f) => {
      filesByField[f.fieldname] = `/uploads/endorsements/${f.filename}`;
    });
    const hasAnyDoc = Object.keys(filesByField).length > 0;
    if (hasAnyDoc) {
      await pool.query(
        `INSERT INTO endorsement_documents
           (endorsement_id, proposal_copy, signed_writeup, signed_budget, endorsement_format_file, overhead_exemption_file)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          endorsementId,
          filesByField.proposal_copy || null,
          filesByField.signed_writeup || null,
          filesByField.signed_budget || null,
          filesByField.endorsement_format_file || null,
          filesByField.overhead_exemption_file || null,
        ],
      );
    }

    // ── Persist Co-PIs sent as JSON from the form.
    let coPIs = [];
    try {
      coPIs = JSON.parse(rawData.coPrincipalInvestigators || "[]");
    } catch (parseErr) {
      console.error("Invalid coPrincipalInvestigators JSON", parseErr);
    }
    for (const c of coPIs) {
      if (!c.copi_user_id) continue;
      await pool.query(
        `INSERT INTO endorsement_copi (endorsement_id, copi_user_id, role)
         VALUES ($1, $2, $3)`,
        [endorsementId, c.copi_user_id, c.role || null],
      );
    }

    // ── Persist external investigators sent as JSON from the form.
    let extInvs = [];
    try {
      extInvs = JSON.parse(rawData.externalInvestigators || "[]");
    } catch (parseErr) {
      console.error("Invalid externalInvestigators JSON", parseErr);
    }
    for (const ext of extInvs) {
      if (!ext.full_name) continue;
      await pool.query(
        `INSERT INTO endorsement_external_investigators (endorsement_id, full_name, designation, institute)
         VALUES ($1, $2, $3, $4)`,
        [
          endorsementId,
          ext.full_name,
          ext.designation || null,
          ext.institute || null,
        ],
      );
    }

    res.status(201).json({
      message: "Endorsement created",
      endorsementId,
      endorsement: result.rows[0],
    });
  } catch (err) {
    console.error("Error creating endorsement", err);
    res.status(500).json({ error: "Failed to create endorsement" });
  }
});

router.put("/:id/assign", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, assign_remarks, assigned_from } = req.body;

    const result = await pool.query(
      `UPDATE endorsements 
       SET status = 'ASSIGNED', assigned_to = $1, assign_remarks = $2 
       WHERE id = $3 RETURNING *`,
      [assigned_to, assign_remarks, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Endorsement not found" });
    }

    await pool.query(
      `INSERT INTO endorsement_assign_history (endorsement_id, assigned_from, assigned_to, action, remarks)
       VALUES ($1, $2, $3, 'ASSIGN', $4)`,
      [
        id,
        assigned_from || "Office",
        assigned_to || null,
        assign_remarks || "",
      ],
    );

    res.json({ message: "Assigned successfully", endorsement: result.rows[0] });
  } catch (err) {
    console.error("Error assigning endorsement", err);
    res.status(500).json({ error: "Failed to assign endorsement" });
  }
});

router.put("/:id/approve-and-assign", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, assigned_from, remarks } = req.body;

    await pool.query(
      `UPDATE endorsements SET status = 'ASSIGNED TO SUPERVISOR', assigned_to = $1 WHERE id = $2`,
      [assigned_to, id],
    );

    await pool.query(
      `INSERT INTO endorsement_assign_history (endorsement_id, assigned_from, assigned_to, action, remarks)
       VALUES ($1, $2, $3, 'APPROVE_AND_ASSIGN', $4)`,
      [id, assigned_from, assigned_to, remarks],
    );

    res.json({ message: "Approved and assigned to supervisor" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to approve and assign" });
  }
});

router.put("/:id/transfer", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, assigned_from, remarks } = req.body;

    await pool.query(`UPDATE endorsements SET assigned_to = $1 WHERE id = $2`, [
      assigned_to,
      id,
    ]);

    await pool.query(
      `INSERT INTO endorsement_assign_history (endorsement_id, assigned_from, assigned_to, action, remarks)
       VALUES ($1, $2, $3, 'TRANSFER', $4)`,
      [id, assigned_from, assigned_to, remarks],
    );

    res.json({ message: "Transferred without approval" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to transfer" });
  }
});

router.put("/:id/final-approve", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_from, remarks } = req.body;

    await pool.query(
      `UPDATE endorsements SET status = 'APPROVED' WHERE id = $1`,
      [id],
    );

    await pool.query(
      `INSERT INTO endorsement_assign_history (endorsement_id, assigned_from, assigned_to, action, remarks)
       VALUES ($1, $2, $3, 'FINAL_APPROVE', $4)`,
      [id, assigned_from, assigned_from, remarks || ""],
    );

    res.json({ message: "Final approved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to final approve" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      funding_agency,
      scheme,
      funding_agency_type,
      project_type,
      gst_added,
      tapal_no,
      submission_due_date,
      non_recurring,
      recurring,
      overhead_percent,
      full_project_title,
      is_pi_regular_faculty,
      endorsement_required,
      endorsement_format,
      total_amount,
      remarks,
    } = req.body;

    const result = await pool.query(
      `UPDATE endorsements SET
        funding_agency = $1, scheme = $2, funding_agency_type = $3,
        project_type = $4, gst_added = $5, submission_due_date = $6,
        non_recurring = $7, recurring = $8, overhead_percent = $9,
        full_project_title = $10, is_pi_regular_faculty = $11,
        endorsement_required = $12, endorsement_format = $13,
        total_amount = $14, remarks = $15
      WHERE id = $16 RETURNING *`,
      [
        funding_agency,
        scheme,
        funding_agency_type,
        project_type,
        gst_added,
        submission_due_date,
        non_recurring,
        recurring,
        overhead_percent,
        full_project_title,
        is_pi_regular_faculty,
        endorsement_required,
        endorsement_format,
        total_amount,
        remarks,
        id,
      ],
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Endorsement not found" });

    res.json({ message: "Updated successfully", endorsement: result.rows[0] });
  } catch (err) {
    console.error("Error updating endorsement", err);
    res.status(500).json({ error: "Failed to update endorsement" });
  }
});
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
        staff_name,
        designation,
        dob,
        dos,
        superannuation_date,
        department,
        campus
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
      error: "Failed to fetch faculty",
    });
  }
});

router.get("/signatures/:endorsementId", async (req, res) => {
  try {
    const { endorsementId } = req.params;

    const history = await pool.query(
      `SELECT * FROM endorsement_assign_history
       WHERE endorsement_id = $1
       ORDER BY created_at ASC`,
      [endorsementId],
    );

    const rows = history.rows;

    // Find who performed each approval action
    const asstAction = rows.find((r) => r.action === "APPROVE_AND_ASSIGN");
    const supdtAction = rows.find(
      (r) =>
        r.action === "APPROVE_AND_ASSIGN_DD" ||
        r.action === "APPROVE_AND_ASSIGN_SUPERVISOR",
    );
    const ddAction = rows.find(
      (r) => r.action === "APPROVE_AND_ASSIGN_DIRECTOR",
    );
    const dirAction = rows.find((r) => r.action === "FINAL_APPROVE");

    const fetchSig = async (name) => {
      if (!name) return null;
      const u = await pool.query(
        `SELECT signature_path FROM admin_users WHERE name = $1 LIMIT 1`,
        [name],
      );
      const p = u.rows[0]?.signature_path;
      return p ? p.replace(/\\/g, "/") : null;
    };

    const [asstSig, supdtSig, ddSig, dirSig] = await Promise.all([
      fetchSig(asstAction?.assigned_from),
      fetchSig(supdtAction?.assigned_from),
      fetchSig(ddAction?.assigned_from),
      fetchSig(dirAction?.assigned_from),
    ]);

    res.json({ asstSig, supdtSig, ddSig, dirSig });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch signatures" });
  }
});

module.exports = router;
