const express = require("express");
const { collection } = require("../store");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
const foodDrives = collection("foodDrives");
const users = collection("users");

router.get("/", (req, res) => {
  res.json(foodDrives.all().sort((a, b) => new Date(a.date) - new Date(b.date)));
});

router.get("/:id", (req, res) => {
  const d = foodDrives.findById(req.params.id);
  if (!d) return res.status(404).json({ error: "Food drive not found." });
  res.json(d);
});

router.post("/", requireAuth, requireRole("admin"), (req, res) => {
  const {
    name,
    date,
    time,
    location,
    address,
    mapsLink,
    volunteersRequired,
    targetMeals,
    campaignId,
    description,
    requiredMaterials,
    targetAmount,
  } = req.body;
  if (!name || !date || !location) {
    return res.status(400).json({ error: "Name, date and location are required." });
  }
  const drive = foodDrives.insert({
    name,
    description: description || "",
    campaignId: campaignId || null,
    date,
    time: time || "",
    location,
    address: address || "",
    mapsLink: mapsLink || "",
    posterImage: "",
    volunteersRequired: Number(volunteersRequired) || 0,
    assignedVolunteers: [],
    targetMeals: Number(targetMeals) || 0,
    mealsDistributed: 0,
    // Materials this specific drive needs (independent of any linked campaign),
    // e.g. [{ item: "Rice", required: 50, received: 0, unit: "KG" }]
    requiredMaterials: Array.isArray(requiredMaterials)
      ? requiredMaterials.map((m) => ({
          item: m.item,
          required: Number(m.required) || 0,
          received: Number(m.received) || 0,
          unit: m.unit || "",
        }))
      : [],
    // Fund target for this specific drive (separate from any campaign's target)
    targetAmount: Number(targetAmount) || 0,
    raisedAmount: 0,
    photos: [],
    status: "upcoming",
  });
  res.status(201).json(drive);
});

router.put("/:id", requireAuth, requireRole("admin"), (req, res) => {
  const updated = foodDrives.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Food drive not found." });
  res.json(updated);
});

router.delete("/:id", requireAuth, requireRole("admin"), (req, res) => {
  const ok = foodDrives.delete(req.params.id);
  if (!ok) return res.status(404).json({ error: "Food drive not found." });
  res.json({ success: true });
});

// Volunteer requests to join a food drive (status: pending -> approved/rejected)
router.post("/:id/join", requireAuth, requireRole("volunteer"), (req, res) => {
  const drive = foodDrives.findById(req.params.id);
  if (!drive) return res.status(404).json({ error: "Food drive not found." });

  const already = (drive.assignedVolunteers || []).find((v) => v.userId === req.user.id);
  if (already) return res.status(409).json({ error: "You've already requested to join this event." });

  const assignedVolunteers = [
    ...(drive.assignedVolunteers || []),
    { userId: req.user.id, name: req.user.name, status: "pending", hoursWorked: 0, checkInTime: null },
  ];
  const updated = foodDrives.update(req.params.id, { assignedVolunteers });
  res.json(updated);
});

// Admin approves/rejects a volunteer's join request
router.put("/:id/volunteers/:userId", requireAuth, requireRole("admin"), (req, res) => {
  const { status } = req.body; // approved | rejected
  const drive = foodDrives.findById(req.params.id);
  if (!drive) return res.status(404).json({ error: "Food drive not found." });

  const assignedVolunteers = (drive.assignedVolunteers || []).map((v) =>
    v.userId === req.params.userId ? { ...v, status } : v
  );
  const updated = foodDrives.update(req.params.id, { assignedVolunteers });
  res.json(updated);
});

// Mark attendance / check-in for a volunteer at a drive
router.post("/:id/attendance", requireAuth, requireRole("admin"), (req, res) => {
  const { userId, hoursWorked } = req.body;
  const drive = foodDrives.findById(req.params.id);
  if (!drive) return res.status(404).json({ error: "Food drive not found." });

  const assignedVolunteers = (drive.assignedVolunteers || []).map((v) =>
    v.userId === userId
      ? { ...v, checkInTime: new Date().toISOString(), hoursWorked: Number(hoursWorked) || v.hoursWorked }
      : v
  );
  const updated = foodDrives.update(req.params.id, { assignedVolunteers });

  const volunteerEntry = assignedVolunteers.find((v) => v.userId === userId);
  const user = users.findById(userId);
  if (user && volunteerEntry) {
    users.update(userId, {
      totalEvents: (user.totalEvents || 0) + 1,
      totalHours: (user.totalHours || 0) + (Number(hoursWorked) || 0),
    });
  }

  res.json(updated);
});

module.exports = router;
