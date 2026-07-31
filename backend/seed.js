const bcrypt = require("bcryptjs");
const { collection } = require("./store");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "data", "db.json");

function resetDb() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2));
}

function seed() {
  resetDb();

  const users = collection("users");
  const campaigns = collection("campaigns");
  const foodDrives = collection("foodDrives");
  const inventory = collection("inventory");
  const donations = collection("donations");
  const settings = collection("settings");

  const passwordHash = bcrypt.hashSync("password123", 10);

  users.insert({
    name: "Rishabh Shinghal",
    email: "rishabhshngl121@gmail.com",
    mobile: "8630197225",
    password: passwordHash,
    role: "admin",
  });

  users.insert({
    name: "Anita Verma",
    email: "donor@example.com",
    mobile: "9876500001",
    password: passwordHash,
    role: "donor",
  });

  users.insert({
    name: "Rahul Mehta",
    email: "volunteer@example.com",
    mobile: "9876500002",
    password: passwordHash,
    role: "volunteer",
    skills: "Cooking, Logistics",
    availability: "Weekends",
    totalEvents: 0,
    totalHours: 0,
  });

  users.insert({
    name: "Shanti Bhawan Community Hall",
    email: "partner@example.com",
    mobile: "9876500003",
    password: passwordHash,
    role: "partner",
    address: "Civil Lines, Bareilly, UP",
    facilities: "Kitchen, Hall for 200, Parking",
  });

  const c1 = campaigns.insert({
    name: "Independence Day Food Distribution",
    description:
      "A special food distribution drive to mark Independence Day, serving nutritious meals to families in underserved neighbourhoods of Bareilly.",
    bannerImage: "",
    startDate: "2026-08-10",
    endDate: "2026-08-16",
    location: "Bareilly, Uttar Pradesh",
    targetAmount: 60000,
    raisedAmount: 21500,
    requiredMaterials: [
      { item: "Rice", unit: "KG", required: 50, received: 35 },
      { item: "Oil", unit: "Litres", required: 20, received: 10 },
      { item: "Pulses", unit: "KG", required: 30, received: 12 },
    ],
    status: "active",
  });

  campaigns.insert({
    name: "Winter Relief Campaign",
    description:
      "Distributing blankets, warm clothes, and hot meals to homeless and daily-wage families through the winter months.",
    bannerImage: "",
    startDate: "2026-12-01",
    endDate: "2027-01-31",
    location: "Bareilly & Rampur, Uttar Pradesh",
    targetAmount: 150000,
    raisedAmount: 4000,
    requiredMaterials: [
      { item: "Blankets", unit: "Pieces", required: 300, received: 40 },
      { item: "Milk", unit: "Litres", required: 100, received: 0 },
    ],
    status: "upcoming",
  });

  campaigns.insert({
    name: "School Kit Distribution",
    description:
      "Providing bags, notebooks, and stationery kits to children from low-income families to support their education.",
    bannerImage: "",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    location: "Bareilly, Uttar Pradesh",
    targetAmount: 40000,
    raisedAmount: 40000,
    requiredMaterials: [{ item: "School Supplies", unit: "Kits", required: 200, received: 200 }],
    status: "completed",
  });

  foodDrives.insert({
    name: "Monthly Food Distribution Drive",
    description: "Our regular monthly drive serving hot, freshly cooked meals to families in need.",
    campaignId: c1.id,
    date: "2026-08-10",
    time: "10:00 AM",
    location: "Bareilly",
    address: "Community Ground, Civil Lines, Bareilly, Uttar Pradesh",
    mapsLink: "https://maps.google.com/?q=Bareilly",
    posterImage: "",
    volunteersRequired: 15,
    assignedVolunteers: [],
    targetMeals: 500,
    mealsDistributed: 0,
    requiredMaterials: [
      { item: "Rice", required: 60, received: 0, unit: "KG" },
      { item: "Oil", required: 15, received: 0, unit: "Litres" },
      { item: "Vegetables", required: 40, received: 0, unit: "KG" },
    ],
    targetAmount: 25000,
    raisedAmount: 0,
    photos: [],
    status: "upcoming",
  });

  foodDrives.insert({
    name: "Independence Day Meal Distribution",
    description: "Serving 800 meals across three localities to mark Independence Day.",
    campaignId: c1.id,
    date: "2026-08-15",
    time: "9:00 AM",
    location: "Bareilly",
    address: "Multiple points, Bareilly, Uttar Pradesh",
    mapsLink: "https://maps.google.com/?q=Bareilly",
    posterImage: "",
    volunteersRequired: 25,
    assignedVolunteers: [],
    targetMeals: 800,
    mealsDistributed: 0,
    requiredMaterials: [
      { item: "Rice", required: 100, received: 0, unit: "KG" },
      { item: "Water Bottles", required: 800, received: 0, unit: "Pieces" },
      { item: "Plates", required: 800, received: 0, unit: "Pieces" },
    ],
    targetAmount: 45000,
    raisedAmount: 0,
    photos: [],
    status: "upcoming",
  });

  foodDrives.insert({
    name: "School Kit Handover Day",
    description: "Handed over 200 school kits to children across five schools.",
    campaignId: null,
    date: "2026-06-25",
    time: "11:00 AM",
    location: "Bareilly",
    address: "Govt. Primary Schools, Bareilly",
    mapsLink: "https://maps.google.com/?q=Bareilly",
    posterImage: "",
    volunteersRequired: 10,
    assignedVolunteers: [],
    targetMeals: 0,
    mealsDistributed: 0,
    photos: [],
    status: "completed",
  });

  [
    { item: "Rice", category: "Food", unit: "KG", quantity: 35, lowStockThreshold: 20 },
    { item: "Oil", category: "Food", unit: "Litres", quantity: 10, lowStockThreshold: 15 },
    { item: "Pulses", category: "Food", unit: "KG", quantity: 12, lowStockThreshold: 15 },
    { item: "Blankets", category: "Winter Supplies", unit: "Pieces", quantity: 40, lowStockThreshold: 50 },
    { item: "School Kits", category: "School Supplies", unit: "Kits", quantity: 0, lowStockThreshold: 10 },
  ].forEach((i) => inventory.insert(i));

  donations.insert({
    donorName: "Anita Verma",
    donorId: null,
    type: "money",
    amount: 5000,
    campaignId: c1.id,
    transactionId: "UPI2026081001",
    paymentScreenshot: "",
    status: "verified",
    receiptNumber: "HSF-RCPT-1001",
  });

  donations.insert({
    donorName: "Anonymous Well-wisher",
    donorId: null,
    type: "material",
    material: "Rice",
    quantity: 20,
    unit: "KG",
    campaignId: c1.id,
    status: "verified",
    receiptNumber: "HSF-RCPT-1002",
  });

  settings.insert({
    key: "upiId",
    value: "rishabhshngl121@okhdfcbank",
  });
  settings.insert({
    key: "orgStats",
    value: {
      totalBeneficiaries: 3200,
      locationsCovered: 14,
    },
  });

  console.log("Seed complete.");
  console.log("Admin login -> email: rishabhshngl121@gmail.com | password: password123");
  console.log("Donor login -> email: donor@example.com | password: password123");
  console.log("Volunteer login -> email: volunteer@example.com | password: password123");
  console.log("Partner login -> email: partner@example.com | password: password123");
}

seed();
