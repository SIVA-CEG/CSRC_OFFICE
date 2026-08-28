const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();
require("./db/db");

const app = express();

// ── Middleware FIRST ──────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static files ──────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ────────────────────────────────────────────────
const adminAuthRoutes = require("./routes/adminAuth");
const tapalRoutes = require("./routes/tapal");
const facultyRoutes = require("./routes/faculty");
const profileRoutes = require("./routes/profile");
const endorsementRoutes = require("./routes/endorsements");
const authRoutes = require("./routes/auth");
const sanctionRoutes = require("./routes/sanctions");
const renewalSanctionRoutes = require("./routes/renewalSanctions");
const projectTransferRoutes = require("./routes/projectTransferRoutes");
const revenueSalaryRoutes = require("./routes/revenueSalary");
const revenueStaffRoutes = require("./routes/revenueStaff");
const revenueOTRoutes = require("./routes/revenueOT");
const revenuePDFRoutes = require("./routes/revenuePDF");
app.use("/api/revenue/pdf", revenuePDFRoutes);
app.use("/api/revenue/ot", revenueOTRoutes);
app.use("/api/revenue/staff", revenueStaffRoutes);
app.use("/api/revenue/salary", revenueSalaryRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/tapals", tapalRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/endorsements", endorsementRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/sanctions", sanctionRoutes);

app.use("/api/renewal-sanctions", renewalSanctionRoutes);

app.use("/api/project-transfer", projectTransferRoutes);
app.get("/", (req, res) => {
  res.json({ message: "CSRC Office backend is running." });
});

// ── Listen ────────────────────────────────────────────────
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5100;

function tryListen(port, attempts = 5) {
  const server = app.listen(port, () => {
    console.log(`Backend server listening on http://localhost:${port}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      if (attempts > 0) {
        const nextPort = port + 1;
        console.warn(`Port ${port} in use, trying ${nextPort}...`);
        setTimeout(() => tryListen(nextPort, attempts - 1), 300);
      } else {
        console.error("All fallback ports are in use. Exiting.");
        process.exit(1);
      }
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });
}

tryListen(DEFAULT_PORT);
