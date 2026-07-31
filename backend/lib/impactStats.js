const { collection } = require("../store");

const foodDrives = collection("foodDrives");
const donations = collection("donations");
const users = collection("users");
const settings = collection("settings");

const OVERRIDABLE_KEYS = [
  "mealsServed",
  "schoolKitsDelivered",
  "foodDrivesConducted",
  "totalVolunteers",
  "totalDonors",
  "locationsCovered",
  "peopleSupported",
];

function getOverrides() {
  const record = settings.findOne((s) => s.key === "impactOverrides");
  return (record && record.value) || {};
}

function setOverrides(next) {
  const record = settings.findOne((s) => s.key === "impactOverrides");
  const merged = { ...(record ? record.value : {}), ...next };
  if (record) {
    settings.update(record.id, { value: merged });
  } else {
    settings.insert({ key: "impactOverrides", value: merged });
  }
  return merged;
}

function computeImpactStats() {
  const drives = foodDrives.all();
  const completedDrives = drives.filter((d) => d.status === "completed" || d.mealsDistributed > 0);
  const mealsServed = drives.reduce((sum, d) => sum + (d.mealsDistributed || 0), 0);
  const donors = users.all().filter((u) => u.role === "donor").length;
  const volunteers = users.all().filter((u) => u.role === "volunteer").length;
  const verifiedDonations = donations.all().filter((d) => d.status === "verified");
  const schoolKitsDelivered = verifiedDonations
    .filter((d) => d.type === "material" && d.material && d.material.toLowerCase().includes("school"))
    .reduce((sum, d) => sum + (d.quantity || 0), 0);
  const locations = new Set(drives.map((d) => d.location)).size;
  const orgStats = settings.findOne((s) => s.key === "orgStats");

  const calculated = {
    mealsServed: mealsServed || 1250, // seeded baseline for a prototype with fresh data
    schoolKitsDelivered: schoolKitsDelivered || 200,
    foodDrivesConducted: completedDrives.length || drives.filter((d) => d.status === "completed").length,
    totalVolunteers: volunteers,
    totalDonors: donors,
    locationsCovered: (orgStats && orgStats.value.locationsCovered) || locations,
    peopleSupported: (orgStats && orgStats.value.totalBeneficiaries) || 0,
  };

  // Any stat an admin has explicitly set takes priority over the calculated value.
  const overrides = getOverrides();
  const final = { ...calculated };
  for (const key of OVERRIDABLE_KEYS) {
    if (overrides[key] !== undefined && overrides[key] !== null && overrides[key] !== "") {
      final[key] = Number(overrides[key]);
    }
  }
  return final;
}

module.exports = { computeImpactStats, getOverrides, setOverrides, OVERRIDABLE_KEYS };
