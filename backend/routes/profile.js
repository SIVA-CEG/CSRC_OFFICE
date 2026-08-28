const express = require("express");
const router = express.Router();

const profiles = {
  1: {
    id: 1,
    name: "Dr. Priya Kumar",
    department: "Computer Science",
    campus: "CEG Campus",
    designation: "Professor",
    email: "priya.kumar@university.edu",
    superannuation_date: "2035-12-31",
  },
  2: {
    id: 2,
    name: "Dr. Rajesh Sharma",
    department: "Civil Engineering",
    campus: "CEG Campus",
    designation: "Associate Professor",
    email: "rajesh.sharma@university.edu",
    superannuation_date: "2038-07-01",
  },
};

router.get("/:userId", (req, res) => {
  const { userId } = req.params;
  const profile = profiles[userId];
  if (!profile) return res.status(404).json({ error: "Profile not found" });

  res.json(profile);
});

module.exports = router;
