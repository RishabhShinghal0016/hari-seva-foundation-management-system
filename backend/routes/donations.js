const express = require("express");
const crypto = require("crypto");
const { collection } = require("../store");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
const donations = collection("donations");
const campaigns = collection("campaigns");
const foodDrives = collection("foodDrives");
const inventory = collection("inventory");
const settings = collection("settings");

let razorpay = null;
function getRazorpay() {
  if (razorpay) return razorpay;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  const Razorpay = require("razorpay");
  razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return razorpay;
}

function nextReceiptNumber() {
  const count = donations.all().length + 1;
  return `HSF-RCPT-${1000 + count}`;
}

// Bump a campaign's and/or food drive's raised amount after a verified/paid money donation
function applyMoneyToTargets({ campaignId, driveId }, amount) {
  if (campaignId) {
    const campaign = campaigns.findById(campaignId);
    if (campaign) campaigns.update(campaign.id, { raisedAmount: (campaign.raisedAmount || 0) + amount });
  }
  if (driveId) {
    const drive = foodDrives.findById(driveId);
    if (drive) foodDrives.update(drive.id, { raisedAmount: (drive.raisedAmount || 0) + amount });
  }
}

// Bump a campaign's and/or food drive's requiredMaterials + shared inventory after a verified material donation
function applyMaterialToTargets({ campaignId, driveId, material, quantity, unit }) {
  const bump = (list) =>
    (list || []).map((m) =>
      m.item.toLowerCase() === material.toLowerCase() ? { ...m, received: (m.received || 0) + quantity } : m
    );

  if (campaignId) {
    const campaign = campaigns.findById(campaignId);
    if (campaign) campaigns.update(campaign.id, { requiredMaterials: bump(campaign.requiredMaterials) });
  }
  if (driveId) {
    const drive = foodDrives.findById(driveId);
    if (drive) foodDrives.update(drive.id, { requiredMaterials: bump(drive.requiredMaterials) });
  }

  const invItem = inventory.findOne((i) => i.item.toLowerCase() === material.toLowerCase());
  if (invItem) {
    inventory.update(invItem.id, { quantity: (invItem.quantity || 0) + quantity });
  } else {
    inventory.insert({ item: material, category: "Food", unit: unit || "", quantity, lowStockThreshold: 10 });
  }
}

// Public: UPI + Razorpay availability for the money-donation page
router.get("/upi-details", (req, res) => {
  const upi = settings.findOne((s) => s.key === "upiId");
  res.json({
    upiId: upi ? upi.value : "",
    qrImage: "/assets/qr-code.jpg",
    razorpayEnabled: Boolean(process.env.RAZORPAY_KEY_ID),
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || null,
  });
});

router.get("/", requireAuth, (req, res) => {
  const all = donations.all();
  if (req.user.role === "admin") return res.json(all);
  res.json(all.filter((d) => d.donorId === req.user.id));
});

// Money donation submitted manually after scanning the UPI QR (self-reported transaction ID,
// so it stays "pending" until an admin cross-checks it against the bank statement)
router.post("/money", requireAuth, requireRole("donor"), (req, res) => {
  const { amount, campaignId, driveId, transactionId, paymentScreenshot, contactName } = req.body;
  if (!amount || !transactionId) {
    return res.status(400).json({ error: "Amount and transaction ID are required." });
  }
  const donation = donations.insert({
    donorName: req.user.name,
    donorId: req.user.id,
    contactName: contactName || req.user.name,
    type: "money",
    paymentMethod: "upi_manual",
    amount: Number(amount),
    campaignId: campaignId || null,
    driveId: driveId || null,
    transactionId,
    paymentScreenshot: paymentScreenshot || "",
    status: "pending",
    receiptNumber: nextReceiptNumber(),
  });
  res.status(201).json(donation);
});

// --- Razorpay flow -------------------------------------------------------
// 1) Frontend asks us to create an order for the chosen amount.
router.post("/razorpay/order", requireAuth, requireRole("donor"), async (req, res) => {
  const client = getRazorpay();
  if (!client) {
    return res.status(503).json({
      error:
        "Razorpay isn't configured yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env and restart the server.",
    });
  }
  const { amount } = req.body;
  if (!amount || Number(amount) < 1) return res.status(400).json({ error: "A valid amount is required." });

  try {
    const order = await client.orders.create({
      amount: Math.round(Number(amount) * 100), // paise
      currency: "INR",
      receipt: `hsf_${Date.now()}`,
    });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ error: "Could not create Razorpay order. Please try again." });
  }
});

// 2) After checkout succeeds in the browser, frontend posts back the payment/order/signature
//    so we can verify it was genuinely signed by Razorpay before recording the donation as paid.
router.post("/razorpay/verify", requireAuth, requireRole("donor"), (req, res) => {
  const { orderId, paymentId, signature, amount, campaignId, driveId, contactName } = req.body;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return res.status(503).json({ error: "Razorpay isn't configured on the server." });
  if (!orderId || !paymentId || !signature || !amount) {
    return res.status(400).json({ error: "Missing payment verification details." });
  }

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  if (expected !== signature) {
    return res.status(400).json({ error: "Payment signature could not be verified." });
  }

  // A verified Razorpay signature means the money has genuinely moved, so this
  // donation is recorded as verified immediately (no manual admin check needed).
  const donation = donations.insert({
    donorName: req.user.name,
    donorId: req.user.id,
    contactName: contactName || req.user.name,
    type: "money",
    paymentMethod: "razorpay",
    amount: Number(amount),
    campaignId: campaignId || null,
    driveId: driveId || null,
    transactionId: paymentId,
    status: "verified",
    receiptNumber: nextReceiptNumber(),
  });

  applyMoneyToTargets({ campaignId, driveId }, Number(amount));
  res.status(201).json(donation);
});

// Raw material donation, tied to a campaign's or a food drive's requirement list.
// Also captures where to collect from and when the donor is available.
router.post("/material", requireAuth, requireRole("donor"), (req, res) => {
  const { campaignId, driveId, material, quantity, unit, contactName, address, latitude, longitude, preferredTimeSlot } = req.body;
  if (!material || !quantity || (!campaignId && !driveId)) {
    return res.status(400).json({ error: "A campaign or food drive, material and quantity are required." });
  }
  if (!contactName) return res.status(400).json({ error: "A contact name is required." });
  if (!address) return res.status(400).json({ error: "Pickup address is required." });
  if (!preferredTimeSlot) return res.status(400).json({ error: "Please share a time slot you're available." });

  if (campaignId && !campaigns.findById(campaignId)) return res.status(404).json({ error: "Campaign not found." });
  if (driveId && !foodDrives.findById(driveId)) return res.status(404).json({ error: "Food drive not found." });

  const donation = donations.insert({
    donorName: req.user.name,
    donorId: req.user.id,
    type: "material",
    material,
    quantity: Number(quantity),
    unit: unit || "",
    campaignId: campaignId || null,
    driveId: driveId || null,
    contactName,
    address,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
    preferredTimeSlot,
    status: "pending",
    receiptNumber: nextReceiptNumber(),
  });
  res.status(201).json(donation);
});

// Admin verifies a donation -> updates campaign/drive totals + inventory automatically
router.put("/:id/verify", requireAuth, requireRole("admin"), (req, res) => {
  const { status } = req.body; // verified | rejected
  const donation = donations.findById(req.params.id);
  if (!donation) return res.status(404).json({ error: "Donation not found." });

  const updated = donations.update(req.params.id, { status });

  if (status === "verified" && donation.status !== "verified") {
    if (donation.type === "money") {
      applyMoneyToTargets({ campaignId: donation.campaignId, driveId: donation.driveId }, donation.amount);
    }
    if (donation.type === "material") {
      applyMaterialToTargets({
        campaignId: donation.campaignId,
        driveId: donation.driveId,
        material: donation.material,
        quantity: donation.quantity,
        unit: donation.unit,
      });
    }
  }

  res.json(updated);
});

module.exports = router;
