const express = require("express");
const { collection } = require("../store");
const { requireAuth, requireRole } = require("../middleware/auth");
const { computeImpactStats, getOverrides, setOverrides, OVERRIDABLE_KEYS } = require("../lib/impactStats");

const router = express.Router();
const users = collection("users");
const campaigns = collection("campaigns");
const foodDrives = collection("foodDrives");
const donations = collection("donations");
const inventory = collection("inventory");
const partnerRequests = collection("partnerRequests");

router.use(requireAuth, requireRole("admin"));

// Current calculated impact numbers + which of them are currently manually overridden.
router.get("/impact-settings", (req, res) => {
  res.json({ calculated: computeImpactStats(), overrides: getOverrides() });
});

// Set (or clear, by sending null/empty) manual overrides for any impact stat.
// Anything not overridden keeps being calculated live from real data.
router.put("/impact-settings", (req, res) => {
  const updates = {};
  for (const key of OVERRIDABLE_KEYS) {
    if (key in req.body) updates[key] = req.body[key] === "" ? null : req.body[key];
  }
  const overrides = setOverrides(updates);
  res.json({ calculated: computeImpactStats(), overrides });
});

router.get("/dashboard", (req, res) => {
  const allUsers = users.all();
  const allDonations = donations.all();
  const verifiedMoney = allDonations.filter((d) => d.type === "money" && d.status === "verified");
  const allDrives = foodDrives.all();

  const monthlyDonations = {};
  verifiedMoney.forEach((d) => {
    const month = (d.createdAt || "").slice(0, 7);
    monthlyDonations[month] = (monthlyDonations[month] || 0) + d.amount;
  });

  res.json({
    totalDonations: verifiedMoney.reduce((sum, d) => sum + d.amount, 0),
    totalDonors: allUsers.filter((u) => u.role === "donor").length,
    totalVolunteers: allUsers.filter((u) => u.role === "volunteer").length,
    totalPartners: allUsers.filter((u) => u.role === "partner").length,
    totalFoodDrives: allDrives.length,
    mealsServed: allDrives.reduce((sum, d) => sum + (d.mealsDistributed || 0), 0),
    activeCampaigns: campaigns.all().filter((c) => c.status === "active").length,
    pendingDonations: allDonations.filter((d) => d.status === "pending").length,
    pendingPartnerRequests: partnerRequests.all().filter((r) => r.status === "pending").length,
    lowStockItems: inventory.all().filter((i) => i.quantity <= i.lowStockThreshold).length,
    donationsByCampaign: campaigns.all().map((c) => ({ name: c.name, raised: c.raisedAmount || 0, target: c.targetAmount || 0 })),
    monthlyDonations: Object.entries(monthlyDonations).map(([month, amount]) => ({ month, amount })),
    driveStatusBreakdown: [
      { status: "upcoming", count: allDrives.filter((d) => d.status === "upcoming").length },
      { status: "ongoing", count: allDrives.filter((d) => d.status === "ongoing").length },
      { status: "completed", count: allDrives.filter((d) => d.status === "completed").length },
    ],
  });
});

router.get("/reports/:type", (req, res) => {
  const { type } = req.params;
  let rows = [];
  let headers = [];

  if (type === "donations") {
    headers = ["Receipt", "Donor", "Type", "Amount/Material", "Status", "Date"];
    rows = donations
      .all()
      .map((d) => [
        d.receiptNumber,
        d.donorName,
        d.type,
        d.type === "money" ? `Rs. ${d.amount}` : `${d.quantity} ${d.unit} ${d.material}`,
        d.status,
        d.createdAt,
      ]);
  } else if (type === "food-drives") {
    headers = ["Name", "Date", "Location", "Target Meals", "Meals Distributed", "Status"];
    rows = foodDrives.all().map((d) => [d.name, d.date, d.location, d.targetMeals, d.mealsDistributed, d.status]);
  } else if (type === "volunteers") {
    headers = ["Name", "Email", "Mobile", "Total Events", "Total Hours"];
    rows = users
      .all()
      .filter((u) => u.role === "volunteer")
      .map((u) => [u.name, u.email, u.mobile, u.totalEvents || 0, u.totalHours || 0]);
  } else if (type === "inventory") {
    headers = ["Item", "Category", "Quantity", "Unit", "Low Stock Threshold"];
    rows = inventory.all().map((i) => [i.item, i.category, i.quantity, i.unit, i.lowStockThreshold]);
  } else {
    return res.status(400).json({ error: "Unknown report type." });
  }

  const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v ?? ""}"`).join(","))].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${type}-report.csv"`);
  res.send(csv);
});

module.exports = router;
