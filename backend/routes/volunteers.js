const express = require("express");
const { collection } = require("../store");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
const users = collection("users");
const foodDrives = collection("foodDrives");

router.get("/me/summary", requireAuth, requireRole("volunteer"), (req, res) => {
  const user = users.findById(req.user.id);
  const myDrives = foodDrives
    .all()
    .filter((d) => (d.assignedVolunteers || []).some((v) => v.userId === req.user.id))
    .map((d) => ({
      ...d,
      myStatus: d.assignedVolunteers.find((v) => v.userId === req.user.id).status,
    }));

  res.json({
    totalEvents: user.totalEvents || 0,
    totalHours: user.totalHours || 0,
    certificatesEarned: Math.floor((user.totalEvents || 0) / 3),
    events: myDrives,
  });
});

// Admin: list all volunteers
router.get("/", requireAuth, requireRole("admin"), (req, res) => {
  res.json(users.all().filter((u) => u.role === "volunteer"));
});

module.exports = router;
