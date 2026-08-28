const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("../db/db");

const uploadDir = path.join(__dirname, "..", "uploads", "revenue-pdf");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) =>
    cb(null, `${Date.now()}-${file.fieldname}-${file.originalname}`),
});
const upload = multer({ storage });

const NEXT_ROLE = {
  assistant: "superintendent",
  superintendent: "deputy_director",
  deputy_director: "director",
};

// ── List requests — optional ?status= filter (active/transferred/etc. map
// to the raw status column; frontend tabs pass the exact status string) ──
router.get("/requests", async (req, res) => {
  try {
    const { status } = req.query;
    let query = `SELECT * FROM revenue_pdf_requests`;
    const values = [];
    if (status) {
      query += ` WHERE status = $1`;
      values.push(status);
    }
    query += ` ORDER BY submitted_at DESC`;
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch PDF requests" });
  }
});

// ── My queue — requests currently assigned to this role ────────
router.get("/requests/my-queue", async (req, res) => {
  try {
    const { role } = req.query;
    if (!role) return res.status(400).json({ error: "role is required" });
    const result = await pool.query(
      `SELECT * FROM revenue_pdf_requests
       WHERE status = 'assigned' AND assigned_to_role = $1
       ORDER BY submitted_at DESC`,
      [role],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch queue" });
  }
});

// ── Faculty submits a new PDF request ───────────────────────────
router.post(
  "/requests",
  upload.fields([
    { name: "letterFile", maxCount: 1 },
    { name: "supportingFiles", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const b = req.body;
      const files = req.files || {};

      const result = await pool.query(
        `INSERT INTO revenue_pdf_requests
           (user_id, faculty_name, designation, department, campus, request_type,
            category, category_fields, bill_details, account, amount,
            letter_file_path, supporting_file_paths, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'pending')
         RETURNING id`,
        [
          b.userId || null,
          b.facultyName,
          b.designation || null,
          b.department || null,
          b.campus || null,
          b.requestType,
          b.category,
          b.categoryFields ? JSON.parse(b.categoryFields) : {},
          b.billDetails ? JSON.parse(b.billDetails) : {},
          b.account ? JSON.parse(b.account) : {},
          b.amount,
          files.letterFile?.[0]?.path.replace(/\\/g, "/") || null,
          JSON.stringify(
            (files.supportingFiles || []).map((f) => f.path.replace(/\\/g, "/")),
          ),
        ],
      );

      res.status(201).json({ message: "Request submitted", requestId: result.rows[0].id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to submit PDF request" });
    }
  },
);

// ── Full detail — request + office fields + bill processing + office use + history ──
router.get("/requests/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [reqRes, officeRes, billRes, ouRes, histRes] = await Promise.all([
      pool.query(`SELECT * FROM revenue_pdf_requests WHERE id = $1`, [id]),
      pool.query(`SELECT * FROM revenue_pdf_office_fields WHERE request_id = $1`, [id]),
      pool.query(`SELECT * FROM revenue_pdf_bill_processing WHERE request_id = $1`, [id]),
      pool.query(`SELECT * FROM revenue_pdf_office_use WHERE request_id = $1`, [id]),
      pool.query(
        `SELECT * FROM revenue_pdf_assign_history WHERE request_id = $1 ORDER BY created_at ASC`,
        [id],
      ),
    ]);

    if (reqRes.rows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.json({
      ...reqRes.rows[0],
      officeFields: officeRes.rows[0] || null,
      billProcessing: billRes.rows[0] || null,
      officeUse: ouRes.rows[0] || null,
      history: histRes.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch request detail" });
  }
});

// ── Save office fields (mh_no, head, subhead, proceeding no, etc.) ─
router.put("/requests/:id/office-fields", async (req, res) => {
  try {
    const { id } = req.params;
    const { mhNo, head, subhead, sNo, pageNo, proceedingNo, proceedingDate, directorName } =
      req.body;

    const result = await pool.query(
      `INSERT INTO revenue_pdf_office_fields
         (request_id, mh_no, head, subhead, s_no, page_no, proceeding_no, proceeding_date, director_name, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now())
       ON CONFLICT (request_id) DO UPDATE SET
         mh_no = EXCLUDED.mh_no, head = EXCLUDED.head, subhead = EXCLUDED.subhead,
         s_no = EXCLUDED.s_no, page_no = EXCLUDED.page_no,
         proceeding_no = EXCLUDED.proceeding_no, proceeding_date = EXCLUDED.proceeding_date,
         director_name = EXCLUDED.director_name, updated_at = now()
       RETURNING *`,
      [id, mhNo, head, subhead, sNo, pageNo, proceedingNo, proceedingDate, directorName],
    );

    res.json({ message: "Office fields saved", officeFields: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save office fields" });
  }
});

// ── Assign to assistant (initial hand-off, if it doesn't start there) ──
router.put("/requests/:id/assign", async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo, assignedFrom, remarks } = req.body;

    await pool.query(
      `UPDATE revenue_pdf_requests SET status = 'assigned', assigned_to = $1, assigned_to_role = 'assistant' WHERE id = $2`,
      [assignedTo, id],
    );
    await pool.query(
      `INSERT INTO revenue_pdf_assign_history (request_id, assigned_from, assigned_to, assigned_to_role, action, remarks)
       VALUES ($1,$2,$3,'assistant','ASSIGN',$4)`,
      [id, assignedFrom || "Tapal", assignedTo, remarks || ""],
    );

    res.json({ message: "Assigned to assistant" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to assign" });
  }
});

// ── Approve & forward to next role in the sanction chain ───────
router.put("/requests/:id/approve-and-assign", async (req, res) => {
  try {
    const { id } = req.params;
    const { currentRole, assignedTo, assignedFrom, remarks } = req.body;

    const nextRole = NEXT_ROLE[currentRole];
    if (!nextRole) {
      return res
        .status(400)
        .json({ error: "No tier above this role — use final-approve" });
    }

    await pool.query(
      `UPDATE revenue_pdf_requests SET status = 'assigned', assigned_to = $1, assigned_to_role = $2 WHERE id = $3`,
      [assignedTo, nextRole, id],
    );
    await pool.query(
      `INSERT INTO revenue_pdf_assign_history
         (request_id, assigned_from, assigned_from_role, assigned_to, assigned_to_role, action, remarks)
       VALUES ($1,$2,$3,$4,$5,'APPROVE_AND_ASSIGN',$6)`,
      [id, assignedFrom, currentRole, assignedTo, nextRole, remarks || ""],
    );

    res.json({ message: `Approved and assigned to ${nextRole}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to approve and assign" });
  }
});

// ── Director's final approval — moves into Bill Processing ─────
router.put("/requests/:id/final-approve", async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedFrom, remarks } = req.body;

    await pool.query(
      `UPDATE revenue_pdf_requests SET status = 'bill_processing', assigned_to = NULL, assigned_to_role = NULL WHERE id = $1`,
      [id],
    );
    await pool.query(
      `INSERT INTO revenue_pdf_assign_history
         (request_id, assigned_from, assigned_from_role, action, remarks)
       VALUES ($1,$2,'director','FINAL_APPROVE',$3)`,
      [id, assignedFrom, remarks || ""],
    );

    res.json({ message: "Final approved — sent to bill processing" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to final approve" });
  }
});

// ── Reject at any sanction stage ────────────────────────────────
router.put("/requests/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;
    const { role, assignedFrom, remarks } = req.body;

    await pool.query(
      `UPDATE revenue_pdf_requests SET status = 'rejected', assigned_to = NULL, assigned_to_role = NULL WHERE id = $1`,
      [id],
    );
    await pool.query(
      `INSERT INTO revenue_pdf_assign_history (request_id, assigned_from, assigned_from_role, action, remarks)
       VALUES ($1,$2,$3,'REJECT',$4)`,
      [id, assignedFrom, role, remarks || "Rejected"],
    );

    res.json({ message: "Request rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reject" });
  }
});

// ── Bill processing — assistant enters/saves Claim Bill draft ──
router.put("/requests/:id/bill-processing", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      month, year, contactNo, csrcBillNo,
      appropriation1, appropriation2, spent1, spent2, balance1, balance2,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO revenue_pdf_bill_processing
         (request_id, month, year, contact_no, csrc_bill_no,
          appropriation_1, appropriation_2, spent_1, spent_2, balance_1, balance_2)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (request_id) DO UPDATE SET
         month = EXCLUDED.month, year = EXCLUDED.year, contact_no = EXCLUDED.contact_no,
         csrc_bill_no = EXCLUDED.csrc_bill_no,
         appropriation_1 = EXCLUDED.appropriation_1, appropriation_2 = EXCLUDED.appropriation_2,
         spent_1 = EXCLUDED.spent_1, spent_2 = EXCLUDED.spent_2,
         balance_1 = EXCLUDED.balance_1, balance_2 = EXCLUDED.balance_2
       RETURNING *`,
      [id, month, year, contactNo, csrcBillNo, appropriation1, appropriation2, spent1, spent2, balance1, balance2],
    );

    res.json({ message: "Bill processing draft saved", billProcessing: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save bill processing draft" });
  }
});

// ── Send to faculty for signature ───────────────────────────────
router.put("/requests/:id/send-to-faculty", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      `UPDATE revenue_pdf_requests SET status = 'awaiting_signature' WHERE id = $1`,
      [id],
    );
    await pool.query(
      `UPDATE revenue_pdf_bill_processing SET sent_to_faculty_at = now() WHERE request_id = $1`,
      [id],
    );
    res.json({ message: "Sent to faculty for signature" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send to faculty" });
  }
});

// ── Register office use — completes the request ────────────────
router.put("/requests/:id/register-office-use", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      appropriationPageNo, vdsFolioNo, vdsYear, passedForPayRs,
      voucherNo, cashBookPageNo, paidRs, chequeNo, dated,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO revenue_pdf_office_use
         (request_id, appropriation_page_no, vds_folio_no, vds_year, passed_for_pay_rs,
          voucher_no, cash_book_page_no, paid_rs, cheque_no, dated)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (request_id) DO UPDATE SET
         appropriation_page_no = EXCLUDED.appropriation_page_no, vds_folio_no = EXCLUDED.vds_folio_no,
         vds_year = EXCLUDED.vds_year, passed_for_pay_rs = EXCLUDED.passed_for_pay_rs,
         voucher_no = EXCLUDED.voucher_no, cash_book_page_no = EXCLUDED.cash_book_page_no,
         paid_rs = EXCLUDED.paid_rs, cheque_no = EXCLUDED.cheque_no, dated = EXCLUDED.dated,
         registered_at = now()
       RETURNING *`,
      [id, appropriationPageNo, vdsFolioNo, vdsYear, passedForPayRs, voucherNo, cashBookPageNo, paidRs, chequeNo, dated],
    );

    await pool.query(
      `UPDATE revenue_pdf_requests SET status = 'completed' WHERE id = $1`,
      [id],
    );

    res.json({ message: "Registered and marked completed", officeUse: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register office use" });
  }
});

// ── Balance summary — total PDF sanctioned vs committed vs available ──
// NOTE: your frontend currently hardcodes `facultyProjects` with pdfAmount
// per project — that data doesn't exist in the DB yet. This endpoint sums
// committed amounts from actual requests; total PDF sanctioned per faculty
// still needs a real source (a `projects`/`overheads` column?) before this
// can be fully accurate. Flagging rather than guessing.
router.get("/balance-summary/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS committed
       FROM revenue_pdf_requests
       WHERE user_id = $1 AND status IN ('pending','assigned','bill_processing','awaiting_signature','completed')`,
      [userId],
    );
    res.json({ committedAmount: parseFloat(result.rows[0].committed) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch balance summary" });
  }
});

module.exports = router;