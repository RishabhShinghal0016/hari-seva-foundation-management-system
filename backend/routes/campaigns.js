const express = require("express");
const { collection } = require("../store");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
const campaigns = collection("campaigns");

router.get("/", (req, res) => {
  res.json(campaigns.all().sort((a, b) => new Date(b.startDate) - new Date(a.startDate)));
});

router.get("/:id", (req, res) => {
  const c = campaigns.findById(req.params.id);
  if (!c) return res.status(404).json({ error: "Campaign not found." });
  res.json(c);
});

router.post("/", requireAuth, requireRole("admin"), (req, res) => {
  const { name, description, startDate, endDate, location, targetAmount, requiredMaterials, status } = req.body;
  if (!name || !startDate || !endDate) {
    return res.status(400).json({ error: "Name, start date and end date are required." });
  }
  const campaign = campaigns.insert({
    name,
    description: description || "",
    bannerImage: "",
    startDate,
    endDate,
    location: location || "",
    targetAmount: Number(targetAmount) || 0,
    raisedAmount: 0,
    requiredMaterials: requiredMaterials || [],
    status: status || "upcoming",
  });
  res.status(201).json(campaign);
});

router.put("/:id", requireAuth, requireRole("admin"), (req, res) => {
  const updated = campaigns.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Campaign not found." });
  res.json(updated);
});

router.delete("/:id", requireAuth, requireRole("admin"), (req, res) => {
  const ok = campaigns.delete(req.params.id);
  if (!ok) return res.status(404).json({ error: "Campaign not found." });
  res.json({ success: true });
});

module.exports = router;
