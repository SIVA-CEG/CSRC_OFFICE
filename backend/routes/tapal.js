const express = require("express");
const multer = require("multer");
const router = express.Router();

const upload = multer({ dest: "uploads/tapals" });

const tapals = [];

const findTapal = (tapalNo) => tapals.find((item) => item.tapalNo === tapalNo);

router.get("/", (req, res) => {
  res.json(tapals);
});

router.post("/", upload.any(), (req, res) => {
  const payload = req.body;
  const files = req.files || [];
  const nextNo = tapals.length + 1;
  const tapalNo = String(nextNo).padStart(4, "0");

  const newTapal = {
    tapalNo,
    title: payload.title || payload.subject || `Tapal ${tapalNo}`,
    description: payload.description || "",
    status: "created",
    assignedTo: null,
    transferHistory: [],
    hardCopyReceived: false,
    hardCopyReceivedDate: null,
    createdAt: new Date().toISOString(),
    rawPayload: payload,
    fileInformation: files.map((file) => ({
      fieldname: file.fieldname,
      originalname: file.originalname,
      filename: file.filename,
      path: file.path,
    })),
  };

  tapals.push(newTapal);
  res.status(201).json({ message: "Tapal created", tapal: newTapal });
});

router.put("/:tapalNo/assign", (req, res) => {
  const { tapalNo } = req.params;
  const tapal = findTapal(tapalNo);
  if (!tapal) return res.status(404).json({ error: "Tapal not found" });

  const { assignedTo, assignedBy, assignedDate } = req.body;
  tapal.assignedTo = assignedTo || tapal.assignedTo;
  tapal.assignedBy = assignedBy || tapal.assignedBy;
  tapal.assignedDate = assignedDate || new Date().toISOString();
  tapal.status = "assigned";

  res.json({ message: "Tapal assigned", tapal });
});

router.put("/:tapalNo/transfer", (req, res) => {
  const { tapalNo } = req.params;
  const tapal = findTapal(tapalNo);
  if (!tapal) return res.status(404).json({ error: "Tapal not found" });

  const { transferredTo, transferReason } = req.body;
  tapal.transferHistory = tapal.transferHistory || [];
  tapal.transferHistory.push({
    transferredTo,
    transferReason,
    transferredAt: new Date().toISOString(),
  });
  tapal.status = "transferred";

  res.json({ message: "Tapal transferred", tapal });
});

router.put("/:tapalNo/complete", (req, res) => {
  const { tapalNo } = req.params;
  const tapal = findTapal(tapalNo);
  if (!tapal) return res.status(404).json({ error: "Tapal not found" });

  tapal.status = "completed";
  tapal.completedAt = new Date().toISOString();

  res.json({ message: "Tapal completed", tapal });
});

router.put("/:tapalNo/hard-copy-received", (req, res) => {
  const { tapalNo } = req.params;
  const tapal = findTapal(tapalNo);
  if (!tapal) return res.status(404).json({ error: "Tapal not found" });

  const { hardCopyReceivedDate } = req.body;
  tapal.hardCopyReceived = true;
  tapal.hardCopyReceivedDate = hardCopyReceivedDate || new Date().toISOString();

  res.json({ message: "Hard copy received", tapal });
});

module.exports = router;
