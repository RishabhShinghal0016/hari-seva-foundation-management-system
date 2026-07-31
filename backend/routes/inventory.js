const express = require("express");
const { collection } = require("../store");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
const inventory = collection("inventory");

router.get("/", requireAuth, requireRole("admin"), (req, res) => {
  const items = inventory.all().map((i) => ({ ...i, lowStock: i.quantity <= i.lowStockThreshold }));
  res.json(items);
});

router.post("/", requireAuth, requireRole("admin"), (req, res) => {
  const { item, category, unit, quantity, lowStockThreshold } = req.body;
  if (!item) return res.status(400).json({ error: "Item name is required." });
  const created = inventory.insert({
    item,
    category: category || "Other",
    unit: unit || "",
    quantity: Number(quantity) || 0,
    lowStockThreshold: Number(lowStockThreshold) || 10,
  });
  res.status(201).json(created);
});

router.put("/:id", requireAuth, requireRole("admin"), (req, res) => {
  const updated = inventory.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Item not found." });
  res.json(updated);
});

// Record stock used (e.g. consumed during a food drive)
router.post("/:id/use", requireAuth, requireRole("admin"), (req, res) => {
  const { quantity } = req.body;
  const item = inventory.findById(req.params.id);
  if (!item) return res.status(404).json({ error: "Item not found." });
  const updated = inventory.update(req.params.id, {
    quantity: Math.max(0, (item.quantity || 0) - Number(quantity || 0)),
  });
  res.json(updated);
});

module.exports = router;
