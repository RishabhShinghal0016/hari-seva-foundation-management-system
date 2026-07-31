const express = require("express");
const { collection } = require("../store");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
const users = collection("users");
const partnerRequests = collection("partnerRequests");

router.get("/", requireAuth, requireRole("admin"), (req, res) => {
  res.json(users.all().filter((u) => u.role === "partner"));
});

router.get("/requests", requireAuth, (req, res) => {
  const all = partnerRequests.all();
  if (req.user.role === "admin") return res.json(all);
  res.json(all.filter((r) => r.partnerId === req.user.id));
});

router.post("/requests", requireAuth, requireRole("partner"), (req, res) => {
  const { preferredDates, capacity, notes } = req.body;
  const request = partnerRequests.insert({
    partnerId: req.user.id,
    partnerName: req.user.name,
    preferredDates: preferredDates || "",
    capacity: capacity || "",
    notes: notes || "",
    status: "pending",
  });
  res.status(201).json(request);
});

router.put("/requests/:id", requireAuth, requireRole("admin"), (req, res) => {
  const { status } = req.body; // approved | rejected
  const updated = partnerRequests.update(req.params.id, { status });
  if (!updated) return res.status(404).json({ error: "Request not found." });
  res.json(updated);
});

module.exports = router;
