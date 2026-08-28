const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pool = require("../db/db");

// ── Upload directory ──────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, "..", "uploads", "transferLetters");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// ── Project cost helper ────────────────────────────────────────────────────────
// `projects` has no total_cost column — a project's sanctioned cost is the
// sum of everything sanctioned across ALL its installments: non-recurring
// heads (equipment), recurring heads (consumables/travel/contingency/SSR),
// manpower, and overheads. Every query below that needs a project's cost
// joins these four grouped subqueries and adds them together.
const COST_SELECT = `
      COALESCE(nr.total, 0) + COALESCE(rh.total, 0)
      + COALESCE(mp.total, 0) + COALESCE(oh.total, 0) AS cost`;

const COST_JOINS = `
      LEFT JOIN (
        SELECT project_id, SUM(amount) AS total
        FROM non_recurring_heads
        GROUP BY project_id
      ) nr ON nr.project_id = p.id
      LEFT JOIN (
        SELECT project_id,
               SUM(COALESCE(consumables,0) + COALESCE(travel,0)
                   + COALESCE(contingency,0) + COALESCE(ssr_budget,0)) AS total
        FROM recurring_heads
        GROUP BY project_id
      ) rh ON rh.project_id = p.id
      LEFT JOIN (
        SELECT project_id, SUM(amount) AS total
        FROM manpower
        GROUP BY project_id
      ) mp ON mp.project_id = p.id
      LEFT JOIN (
        SELECT project_id, SUM(total_overhead) AS total
        FROM overheads
        GROUP BY project_id
      ) oh ON oh.project_id = p.id`;

// ── Faculty portal routes ─────────────────────────────────────────────────────

router.get("/my-projects", async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: "user_id required" });
    const result = await pool.query(
      `SELECT p.id, p.project_title AS title, p.funding_agency,
              p.sanction_reference_no AS file_no,${COST_SELECT},
              p.project_start_date, p.project_end_date
       FROM projects p
       JOIN endorsements e ON e.id = p.endorsement_id${COST_JOINS}
       WHERE e.user_id = $1
       ORDER BY p.id DESC`,
      [user_id],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/faculty-list", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT fp.user_id, fp.staff_name AS name, fp.designation, fp.department, fp.campus
       FROM faculty_profile fp ORDER BY fp.staff_name ASC`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/sent", async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: "user_id required" });
    const result = await pool.query(
      `SELECT pt.*, p.project_title AS title, p.funding_agency,
              p.sanction_reference_no AS file_no,${COST_SELECT},
              p.project_start_date, p.project_end_date,
              fp_from.staff_name AS from_name, fp_from.designation AS from_designation, fp_from.department AS from_dept,
              fp_to.staff_name AS to_name, fp_to.designation AS to_designation, fp_to.department AS to_dept
       FROM project_transfers pt
       JOIN projects p ON p.id = pt.project_id${COST_JOINS}
       JOIN faculty_profile fp_from ON fp_from.user_id = pt.from_user_id
       JOIN faculty_profile fp_to   ON fp_to.user_id   = pt.to_user_id
       WHERE pt.from_user_id = $1
       ORDER BY pt.created_at DESC`,
      [user_id],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/received", async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: "user_id required" });
    const result = await pool.query(
      `SELECT pt.*, p.project_title AS title, p.funding_agency,
              p.sanction_reference_no AS file_no,${COST_SELECT},
              p.project_start_date, p.project_end_date,
              fp_from.staff_name AS from_name, fp_from.designation AS from_designation, fp_from.department AS from_dept,
              fp_to.staff_name AS to_name, fp_to.designation AS to_designation, fp_to.department AS to_dept
       FROM project_transfers pt
       JOIN projects p ON p.id = pt.project_id${COST_JOINS}
       JOIN faculty_profile fp_from ON fp_from.user_id = pt.from_user_id
       JOIN faculty_profile fp_to   ON fp_to.user_id   = pt.to_user_id
       WHERE pt.to_user_id = $1
       AND pt.status NOT IN ('draft', 'finish_later')
       ORDER BY pt.created_at DESC`,
      [user_id],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { project_id, from_user_id, to_user_id, sub, ref, reason, status } =
      req.body;
    const existing = await pool.query(
      `SELECT id FROM project_transfers WHERE project_id = $1
       AND status NOT IN ('rejected_by_faculty','rejected_by_csrc','approved_by_csrc','completed')`,
      [project_id],
    );
    if (existing.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "An active transfer already exists for this project" });
    }
    const result = await pool.query(
      `INSERT INTO project_transfers (project_id, from_user_id, to_user_id, sub, ref, reason, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        project_id,
        from_user_id,
        to_user_id,
        sub,
        ref,
        reason,
        status || "draft",
      ],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/upload-letter", upload.single("letter"), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const rawPath = req.file.path.replace(/\\/g, "/");
    const uploadsIndex = rawPath.indexOf("uploads/");
    const letterPath =
      uploadsIndex !== -1 ? rawPath.slice(uploadsIndex) : rawPath;
    await pool.query(
      `UPDATE project_transfers SET letter_path=$1, letter_upload_date=$2, status='pending_faculty' WHERE id=$3`,
      [letterPath, new Date().toISOString(), id],
    );
    res.json({ message: "Letter uploaded", letter_path: letterPath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/finish-later", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      `UPDATE project_transfers SET status='finish_later' WHERE id=$1`,
      [id],
    );
    res.json({ message: "Saved as finish later" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/faculty-accept", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      `UPDATE project_transfers SET status='accepted_by_faculty', faculty_response_date=NOW() WHERE id=$1`,
      [id],
    );
    res.json({ message: "Transfer accepted by faculty" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/faculty-reject", async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    await pool.query(
      `UPDATE project_transfers SET status='rejected_by_faculty', faculty_response_date=NOW(), reject_remarks=$1 WHERE id=$2`,
      [remarks || null, id],
    );
    res.json({ message: "Transfer rejected by faculty" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Tapal (admin) routes ──────────────────────────────────────────────────────

router.get("/tapal/pending", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pt.*, p.project_title AS title, p.funding_agency,
              p.sanction_reference_no AS file_no,${COST_SELECT},
              fp_from.staff_name AS from_name, fp_from.designation AS from_designation, fp_from.department AS from_dept,
              fp_to.staff_name AS to_name, fp_to.designation AS to_designation, fp_to.department AS to_dept
       FROM project_transfers pt
       JOIN projects p ON p.id = pt.project_id${COST_JOINS}
       JOIN faculty_profile fp_from ON fp_from.user_id = pt.from_user_id
       JOIN faculty_profile fp_to   ON fp_to.user_id   = pt.to_user_id
       WHERE pt.status = 'accepted_by_faculty'
       ORDER BY pt.created_at DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/tapal/assigned", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pt.*, p.project_title AS title, p.funding_agency,
              p.sanction_reference_no AS file_no,${COST_SELECT},
              fp_from.staff_name AS from_name, fp_from.designation AS from_designation, fp_from.department AS from_dept,
              fp_to.staff_name AS to_name, fp_to.designation AS to_designation, fp_to.department AS to_dept
       FROM project_transfers pt
       JOIN projects p ON p.id = pt.project_id${COST_JOINS}
       JOIN faculty_profile fp_from ON fp_from.user_id = pt.from_user_id
       JOIN faculty_profile fp_to   ON fp_to.user_id   = pt.to_user_id
       WHERE pt.status IN ('assigned','assigned_supervisor','assigned_dd','assigned_director')
       ORDER BY pt.created_at DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/tapal/completed", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pt.*, p.project_title AS title, p.funding_agency,
              p.sanction_reference_no AS file_no,${COST_SELECT},
              fp_from.staff_name AS from_name, fp_from.designation AS from_designation, fp_from.department AS from_dept,
              fp_to.staff_name AS to_name, fp_to.designation AS to_designation, fp_to.department AS to_dept
       FROM project_transfers pt
       JOIN projects p ON p.id = pt.project_id${COST_JOINS}
       JOIN faculty_profile fp_from ON fp_from.user_id = pt.from_user_id
       JOIN faculty_profile fp_to   ON fp_to.user_id   = pt.to_user_id
       WHERE pt.status = 'completed'
       ORDER BY pt.created_at DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/tapal/:id/assign", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to_name, assigned_to_role, remarks } = req.body;
    const newStatus =
      assigned_to_role === "superintendent"
        ? "assigned_supervisor"
        : assigned_to_role === "dd"
          ? "assigned_dd"
          : assigned_to_role === "director"
            ? "assigned_director"
            : "assigned";
    await pool.query(
      `UPDATE project_transfers SET status=$1, assigned_to=$2, assign_remarks=$3, assigned_date=NOW() WHERE id=$4`,
      [newStatus, assigned_to_name, remarks || null, id],
    );
    res.json({ message: "Assigned successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/tapal/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      `UPDATE project_transfers SET status='completed', completed_date=NOW() WHERE id=$1`,
      [id],
    );
    res.json({ message: "Completed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
// ── Office pipeline v2: assistant → superintendent → dd → director ───────

const OFFICE_ROLE_TO_STATUS = {
  assistant: "assigned",
  superintendent: "assigned with supervisor",
  dd: "assigned with dd",
  director: "assigned with director",
};

const NEXT_OFFICE_ROLE = {
  assistant: "superintendent",
  superintendent: "dd",
  dd: "director",
};

const APPROVE_ACTION_BY_TARGET = {
  superintendent: "APPROVE_AND_ASSIGN_SUPERVISOR",
  dd: "APPROVE_AND_ASSIGN_DD",
  director: "APPROVE_AND_ASSIGN_DIRECTOR",
};

// ── Staff directory for a given office tier ───────────────────────────────
router.get("/tapal/staff/:role", async (req, res) => {
  try {
    const { role } = req.params;
    if (!OFFICE_ROLE_TO_STATUS[role]) {
      return res.status(400).json({ error: "Unknown role" });
    }
    const result = await pool.query(
      `SELECT id, name, username, role FROM admin_users WHERE role = $1 ORDER BY name`,
      [role],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── "New Requests" for a given tier — status matches AND assigned to me ──
router.get("/tapal/:role/new", async (req, res) => {
  try {
    const { role } = req.params;
    const { username } = req.query;
    const status = OFFICE_ROLE_TO_STATUS[role];
    if (!status) return res.status(400).json({ error: "Unknown role" });

    const result = await pool.query(
      `SELECT pt.*, p.project_title AS title, p.funding_agency,
              p.sanction_reference_no AS file_no,${COST_SELECT},
              fp_from.staff_name AS from_name, fp_from.designation AS from_designation, fp_from.department AS from_dept,
              fp_to.staff_name AS to_name, fp_to.designation AS to_designation, fp_to.department AS to_dept
       FROM project_transfers pt
       JOIN projects p ON p.id = pt.project_id${COST_JOINS}
       JOIN faculty_profile fp_from ON fp_from.user_id = pt.from_user_id
       JOIN faculty_profile fp_to   ON fp_to.user_id   = pt.to_user_id
       WHERE LOWER(TRIM(pt.status)) = LOWER($1)
       AND pt.assigned_to = $2
       ORDER BY pt.created_at DESC`,
      [status, username],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── "Transferred by me" — anything I forwarded, still in-flight ──────────
router.get("/tapal/transferred", async (req, res) => {
  try {
    const { username } = req.query;
    const result = await pool.query(
      `SELECT DISTINCT pt.*, p.project_title AS title, p.funding_agency,
              p.sanction_reference_no AS file_no,${COST_SELECT},
              fp_from.staff_name AS from_name, fp_from.designation AS from_designation, fp_from.department AS from_dept,
              fp_to.staff_name AS to_name, fp_to.designation AS to_designation, fp_to.department AS to_dept
       FROM project_transfers pt
       JOIN projects p ON p.id = pt.project_id${COST_JOINS}
       JOIN faculty_profile fp_from ON fp_from.user_id = pt.from_user_id
       JOIN faculty_profile fp_to   ON fp_to.user_id   = pt.to_user_id
       INNER JOIN project_transfer_assign_history h ON h.transfer_id = pt.id
       WHERE h.assigned_from = $1
       AND LOWER(TRIM(pt.status)) NOT IN ('completed', 'rejected_by_faculty', 'pending_faculty')
       ORDER BY pt.id DESC`,
      [username],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Approve & Transfer — moves the request UP one tier ────────────────────
router.put("/tapal/:id/approve-and-assign/:role", async (req, res) => {
  try {
    const { id, role } = req.params;
    const { assigned_to, assigned_from, remarks } = req.body;

    const upper = NEXT_OFFICE_ROLE[role];
    if (!upper) {
      return res.status(400).json({ error: "No tier above this role — use final-approve" });
    }
    const newStatus = OFFICE_ROLE_TO_STATUS[upper];
    const action = APPROVE_ACTION_BY_TARGET[upper];

    const result = await pool.query(
      `UPDATE project_transfers
       SET status = $1, assigned_to = $2, assign_remarks = $3, assigned_date = NOW()
       WHERE id = $4 RETURNING *`,
      [newStatus, assigned_to, remarks || null, id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Transfer not found" });
    }

    await pool.query(
      `INSERT INTO project_transfer_assign_history
       (transfer_id, assigned_from, assigned_to, action, remarks)
       VALUES ($1,$2,$3,$4,$5)`,
      [id, assigned_from, assigned_to, action, remarks || ""],
    );

    res.json({ message: "Approved and transferred", transfer: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Transfer without Approval — lateral handoff at the SAME tier ─────────
router.put("/tapal/:id/transfer", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, assigned_from, remarks } = req.body;

    const result = await pool.query(
      `UPDATE project_transfers
       SET assigned_to = $1, assign_remarks = $2, assigned_date = NOW()
       WHERE id = $3 RETURNING *`,
      [assigned_to, remarks || null, id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Transfer not found" });
    }

    await pool.query(
      `INSERT INTO project_transfer_assign_history
       (transfer_id, assigned_from, assigned_to, action, remarks)
       VALUES ($1,$2,$3,'TRANSFER',$4)`,
      [id, assigned_from, assigned_to, remarks || ""],
    );

    res.json({ message: "Transferred", transfer: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Director: Approve & Finalize — completes + reassigns PI-ship ─────────
router.put("/tapal/:id/final-approve", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_from, remarks } = req.body;

    const transferRes = await pool.query(
      `SELECT * FROM project_transfers WHERE id = $1`,
      [id],
    );
    if (transferRes.rows.length === 0) {
      return res.status(404).json({ error: "Transfer not found" });
    }
    const transfer = transferRes.rows[0];

    await pool.query(
      `UPDATE project_transfers SET status = 'completed', completed_date = NOW() WHERE id = $1`,
      [id],
    );

    // Reassign PI-ship: point the project's endorsement at the incoming PI
    const projRes = await pool.query(
      `SELECT endorsement_id FROM projects WHERE id = $1`,
      [transfer.project_id],
    );
    if (projRes.rows.length > 0 && projRes.rows[0].endorsement_id) {
      await pool.query(
        `UPDATE endorsements SET user_id = $1 WHERE id = $2`,
        [transfer.to_user_id, projRes.rows[0].endorsement_id],
      );
    }

    await pool.query(
      `INSERT INTO project_transfer_assign_history
       (transfer_id, assigned_from, assigned_to, action, remarks)
       VALUES ($1,$2,$2,'FINAL_APPROVE',$3)`,
      [id, assigned_from, remarks || ""],
    );

    res.json({ message: "Approved and finalized" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Movement history for a transfer ────────────────────────────────────────
router.get("/tapal/:id/history", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM project_transfer_assign_history WHERE transfer_id = $1 ORDER BY created_at ASC`,
      [id],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Full detail (used by Track modal) — must stay after the routes above,
// since it's a 2-segment path and would otherwise swallow /tapal/completed etc.
router.get("/tapal/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT pt.*, p.project_title AS title, p.funding_agency,
              p.sanction_reference_no AS file_no,${COST_SELECT},
              p.project_start_date, p.project_end_date,
              fp_from.staff_name AS from_name, fp_from.designation AS from_designation,
              fp_from.department AS from_dept, fp_from.campus AS from_campus,
              fp_to.staff_name AS to_name, fp_to.designation AS to_designation,
              fp_to.department AS to_dept, fp_to.campus AS to_campus
       FROM project_transfers pt
       JOIN projects p ON p.id = pt.project_id${COST_JOINS}
       JOIN faculty_profile fp_from ON fp_from.user_id = pt.from_user_id
       JOIN faculty_profile fp_to   ON fp_to.user_id   = pt.to_user_id
       WHERE pt.id = $1`,
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Transfer not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Bonus: initial hand-off into the office pipeline (accepted_by_faculty
// → assistant). Needed once, wherever a tapal clerk first logs an accepted
// transfer into the queue. Wire this up from whatever "Log Tapal" UI exists.
router.put("/tapal/:id/assign-to-assistant", async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, assigned_from, remarks } = req.body;

    const result = await pool.query(
      `UPDATE project_transfers
       SET status = 'assigned', assigned_to = $1, assign_remarks = $2, assigned_date = NOW()
       WHERE id = $3 RETURNING *`,
      [assigned_to, remarks || null, id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Transfer not found" });
    }

    await pool.query(
      `INSERT INTO project_transfer_assign_history
       (transfer_id, assigned_from, assigned_to, action, remarks)
       VALUES ($1,$2,$3,'ENTERED_OFFICE_QUEUE',$4)`,
      [id, assigned_from || "Tapal", assigned_to, remarks || ""],
    );

    res.json({ message: "Assigned to assistant", transfer: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
// GET single transfer — MUST BE LAST
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT pt.*, p.project_title AS title, p.funding_agency,
              p.sanction_reference_no AS file_no,${COST_SELECT},
              p.project_start_date, p.project_end_date,
              fp_from.staff_name AS from_name, fp_from.designation AS from_designation,
              fp_from.department AS from_dept, fp_from.campus AS from_campus,
              fp_to.staff_name AS to_name, fp_to.designation AS to_designation,
              fp_to.department AS to_dept, fp_to.campus AS to_campus
       FROM project_transfers pt
       JOIN projects p ON p.id = pt.project_id${COST_JOINS}
       JOIN faculty_profile fp_from ON fp_from.user_id = pt.from_user_id
       JOIN faculty_profile fp_to   ON fp_to.user_id   = pt.to_user_id
       WHERE pt.id = $1`,
      [id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Transfer not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
