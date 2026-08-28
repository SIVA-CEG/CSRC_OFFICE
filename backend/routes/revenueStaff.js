const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("../db/db");

// ── Upload dir ────────────────────────────────────────────────
const uploadDir = path.join(__dirname, "..", "uploads", "revenue-staff");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) =>
    cb(null, `${Date.now()}-${file.fieldname}-${file.originalname}`),
});
const upload = multer({ storage });

// ── Row → camelCase mapper (frontend expects camelCase fields) ──
function mapStaffRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    department: row.department,
    employeeCode: row.employee_code,
    appellation: row.appellation,
    gender: row.gender,
    firstName: row.first_name,
    lastName: row.last_name,
    designation: row.designation,
    mobile: row.mobile,
    email: row.email,
    staffType: row.staff_type,
    tenureFrom: row.tenure_from,
    tenureTo: row.tenure_to,
    dob: row.dob,
    doj: row.doj,
    allotmentYear: row.allotment_year,
    orderNumber: row.order_number,
    orderDate: row.order_date,
    salaryType: row.salary_type,
    bankName: row.bank_name,
    bankAccountNumber: row.bank_account_number,
    ifscCode: row.ifsc_code,
    status: row.status,
    createdAt: row.created_at,
  };
}

// ── List all staff ───────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM revenue_staff ORDER BY first_name ASC`,
    );
    res.json(result.rows.map(mapStaffRow));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch staff list" });
  }
});

// ── Status counts (Present / Extended / Resigned) ────────────
router.get("/status-counts", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) AS all_count,
        COUNT(*) FILTER (WHERE status = 'active') AS active,
        COUNT(*) FILTER (WHERE status = 'extended') AS extended,
        COUNT(*) FILTER (WHERE status = 'resigned') AS resigned
      FROM revenue_staff
    `);
    const r = result.rows[0];
    res.json({
      all: Number(r.all_count),
      active: Number(r.active),
      extended: Number(r.extended),
      resigned: Number(r.resigned),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch status counts" });
  }
});

// ── Single staff member — full detail with history + documents ──
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [staffRes, extRes, resignRes, docsRes] = await Promise.all([
      pool.query(`SELECT * FROM revenue_staff WHERE id = $1`, [id]),
      pool.query(
        `SELECT * FROM revenue_staff_extension_history WHERE staff_id = $1 ORDER BY approved_at ASC`,
        [id],
      ),
      pool.query(
        `SELECT * FROM revenue_staff_resignation WHERE staff_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [id],
      ),
      pool.query(
        `SELECT * FROM revenue_staff_documents WHERE staff_id = $1 ORDER BY uploaded_at ASC`,
        [id],
      ),
    ]);

    if (staffRes.rows.length === 0) {
      return res.status(404).json({ error: "Staff member not found" });
    }

    const staff = mapStaffRow(staffRes.rows[0]);

    staff.extensionHistory = extRes.rows.map((h) => ({
      from: h.extension_from,
      to: h.extension_to,
      approvedOn: h.approved_at,
      remarks: h.remarks,
    }));

    staff.resignation = resignRes.rows[0]
      ? {
          date: resignRes.rows[0].resignation_date,
          remarks: resignRes.rows[0].remarks,
        }
      : null;

    // Group documents by doc_type -> { joiningLetter: {...}, vcApproval: {...}, ... }
    const docTypeToKey = {
      joining_letter: "joiningLetter",
      vc_approval: "vcApproval",
      rejoining_letter: "rejoiningLetter",
      registrar_approval: "registrarApproval",
      resignation_letter: "resignationLetter",
      relieving_letter: "relievingLetter",
      experience_letter: "experienceLetter",
    };
    staff.documents = {};
    docsRes.rows.forEach((d) => {
      const key = docTypeToKey[d.doc_type] || d.doc_type;
      staff.documents[key] = {
        name: path.basename(d.file_path),
        path: `/uploads/revenue-staff/${path.basename(d.file_path)}`,
      };
    });

    res.json(staff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch staff detail" });
  }
});

// ── New appointment — assistant only (enforced on the frontend route guard) ──
// multipart fields: all EMPTY_FORM keys from StaffNewAppointment.jsx
// files: joiningLetter, vcApproval
router.post(
  "/",
  upload.fields([
    { name: "joiningLetter", maxCount: 1 },
    { name: "vcApproval", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const b = req.body;
      const files = req.files || {};

      const result = await pool.query(
        `INSERT INTO revenue_staff (
           department, employee_code, appellation, gender, first_name, last_name,
           designation, mobile, email, staff_type, tenure_from, tenure_to,
           dob, doj, allotment_year, order_number, order_date, salary_type,
           bank_name, bank_account_number, ifsc_code, status, created_by
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,'active',$22)
         RETURNING id`,
        [
          b.department || "Centre for Sponsored Research and Consultancy",
          b.employeeCode || null,
          b.appellation || null,
          b.gender || null,
          b.firstName,
          b.lastName || null,
          b.designation,
          b.mobile || null,
          b.email || null,
          b.staffType || "Regular",
          b.tenureFrom || null,
          b.tenureTo || null,
          b.dob || null,
          b.doj || null,
          b.allotmentYear || null,
          b.orderNumber || null,
          b.orderDate || null,
          b.salaryType || "Consolidated Pay",
          b.bankName || null,
          b.bankAccountNumber || null,
          b.ifscCode || null,
          b.createdBy || "Assistant",
        ],
      );

      const staffId = result.rows[0].id;

      const docInserts = [];
      if (files.joiningLetter?.[0]) {
        docInserts.push(["joining_letter", files.joiningLetter[0].path]);
      }
      if (files.vcApproval?.[0]) {
        docInserts.push(["vc_approval", files.vcApproval[0].path]);
      }
      for (const [docType, filePath] of docInserts) {
        await pool.query(
          `INSERT INTO revenue_staff_documents (staff_id, doc_type, file_path) VALUES ($1,$2,$3)`,
          [staffId, docType, filePath.replace(/\\/g, "/")],
        );
      }

      res.status(201).json({ message: "Staff appointed", staffId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create appointment" });
    }
  },
);

// ── Edit staff details — assistant only (StaffList.jsx drawer "Save") ──
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const b = req.body;

    const result = await pool.query(
      `UPDATE revenue_staff SET
         mobile = $1, email = $2, designation = $3, staff_type = $4,
         tenure_from = $5, tenure_to = $6, order_number = $7, order_date = $8,
         salary_type = $9, bank_name = $10, bank_account_number = $11, ifsc_code = $12
       WHERE id = $13 RETURNING *`,
      [
        b.mobile || null,
        b.email || null,
        b.designation || null,
        b.staffType || null,
        b.tenureFrom || null,
        b.tenureTo || null,
        b.orderNumber || null,
        b.orderDate || null,
        b.salaryType || null,
        b.bankName || null,
        b.bankAccountNumber || null,
        b.ifscCode || null,
        id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Staff member not found" });
    }

    res.json({ message: "Staff updated", staff: mapStaffRow(result.rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update staff" });
  }
});

// ── Extension — assistant only, applied immediately ────────────
router.put(
  "/:id/extend",
  upload.fields([
    { name: "rejoiningLetter", maxCount: 1 },
    { name: "registrarApproval", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { extensionFrom, extensionTo, createdBy } = req.body;
      const files = req.files || {};

      if (!extensionFrom || !extensionTo) {
        return res
          .status(400)
          .json({ error: "extensionFrom and extensionTo are required" });
      }

      await pool.query(
        `UPDATE revenue_staff SET status = 'extended', tenure_from = $1, tenure_to = $2 WHERE id = $3`,
        [extensionFrom, extensionTo, id],
      );

      await pool.query(
        `INSERT INTO revenue_staff_extension_history (staff_id, extension_from, extension_to, approved_by)
         VALUES ($1,$2,$3,$4)`,
        [id, extensionFrom, extensionTo, createdBy || "Assistant"],
      );

      if (files.rejoiningLetter?.[0]) {
        await pool.query(
          `INSERT INTO revenue_staff_documents (staff_id, doc_type, file_path) VALUES ($1,'rejoining_letter',$2)`,
          [id, files.rejoiningLetter[0].path.replace(/\\/g, "/")],
        );
      }
      if (files.registrarApproval?.[0]) {
        await pool.query(
          `INSERT INTO revenue_staff_documents (staff_id, doc_type, file_path) VALUES ($1,'registrar_approval',$2)`,
          [id, files.registrarApproval[0].path.replace(/\\/g, "/")],
        );
      }

      res.json({ message: "Extension applied" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to apply extension" });
    }
  },
);

// ── Resignation — assistant only, applied immediately ──────────
router.put(
  "/:id/resign",
  upload.fields([
    { name: "resignationLetter", maxCount: 1 },
    { name: "relievingLetter", maxCount: 1 },
    { name: "experienceLetter", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { resignationDate, createdBy } = req.body;
      const files = req.files || {};

      if (!resignationDate) {
        return res.status(400).json({ error: "resignationDate is required" });
      }

      await pool.query(
        `UPDATE revenue_staff SET status = 'resigned' WHERE id = $1`,
        [id],
      );

      await pool.query(
        `INSERT INTO revenue_staff_resignation (staff_id, resignation_date, created_by)
         VALUES ($1,$2,$3)`,
        [id, resignationDate, createdBy || "Assistant"],
      );

      const docMap = {
        resignationLetter: "resignation_letter",
        relievingLetter: "relieving_letter",
        experienceLetter: "experience_letter",
      };
      for (const [field, docType] of Object.entries(docMap)) {
        if (files[field]?.[0]) {
          await pool.query(
            `INSERT INTO revenue_staff_documents (staff_id, doc_type, file_path) VALUES ($1,$2,$3)`,
            [id, docType, files[field][0].path.replace(/\\/g, "/")],
          );
        }
      }

      res.json({ message: "Resignation applied" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to apply resignation" });
    }
  },
);

module.exports = router;