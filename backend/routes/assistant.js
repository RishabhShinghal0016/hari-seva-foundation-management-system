const express = require("express");
const { collection } = require("../store");
const { computeImpactStats } = require("../lib/impactStats");
const faq = require("../data/faq");

const router = express.Router();
const campaigns = collection("campaigns");
const foodDrives = collection("foodDrives");
const settings = collection("settings");

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "am", "do", "does", "did", "i", "you", "we", "they",
  "of", "for", "to", "in", "on", "and", "or", "how", "what", "when", "where", "why",
  "can", "could", "would", "should", "will", "my", "your", "our", "it", "me", "please",
  "hi", "hello", "hey", "there", "about",
]);

function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w));
}

function includesAny(tokens, words) {
  return words.some((w) => tokens.includes(w));
}

function formatCurrency(n) {
  return `₹${(n || 0).toLocaleString("en-IN")}`;
}

function listActiveCampaigns() {
  const active = campaigns.all().filter((c) => c.status === "active");
  if (active.length === 0) return "There are no active campaigns right now — check the Campaigns page for what's coming up.";
  const lines = active
    .slice(0, 5)
    .map((c) => `• ${c.name} — ${formatCurrency(c.raisedAmount)} raised of ${formatCurrency(c.targetAmount)} (${c.location})`);
  return `Here's what's currently active:\n${lines.join("\n")}\n\nSee full details and donate on the Campaigns page.`;
}

function listUpcomingDrives() {
  const upcoming = foodDrives.all().filter((d) => d.status === "upcoming");
  if (upcoming.length === 0) return "There aren't any upcoming food drives scheduled right now — check back soon, or the Food Drives page for the latest.";
  const lines = upcoming
    .slice(0, 5)
    .map((d) => {
      const date = new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
      return `• ${d.name} — ${date} at ${d.location} (targeting ${d.targetMeals} meals, needs ${d.volunteersRequired} volunteers)`;
    });
  return `Upcoming food drives:\n${lines.join("\n")}\n\nYou can join as a volunteer or donate directly from the Food Drives page.`;
}

function donateAnswer() {
  const upi = settings.findOne((s) => s.key === "upiId");
  const razorpayEnabled = Boolean(process.env.RAZORPAY_KEY_ID);
  return (
    `You can donate two ways from the Donate page:\n` +
    `• Money — scan our UPI QR (${upi ? upi.value : "shown on the page"})${razorpayEnabled ? " or pay instantly via Razorpay (card/UPI/netbanking)" : ""}, then submit your transaction ID\n` +
    `• Raw materials — pick a campaign or food drive, choose the material and quantity, and share your pickup address and available time slot\n\n` +
    `You'll need to log in as a donor first so your history and receipts stay in one place.`
  );
}

function volunteerAnswer() {
  return (
    "Register with the 'Volunteer' role, then head to the Food Drives page and click 'Join as volunteer' " +
    "on any upcoming drive. An admin approves your request, and your hours and events show up automatically in your Volunteer Dashboard."
  );
}

function partnerAnswer() {
  return (
    "Register with the 'Food Drive Partner' role — that covers restaurants, temples, schools, community halls, and companies. " +
    "From your Partner Dashboard, submit your preferred dates and capacity, and our team will review and schedule a drive at your location."
  );
}

function impactAnswer() {
  const s = computeImpactStats();
  return (
    `So far: ${s.mealsServed.toLocaleString("en-IN")} meals served, ${s.schoolKitsDelivered.toLocaleString("en-IN")} school kits delivered, ` +
    `${s.foodDrivesConducted} food drives conducted, across ${s.totalVolunteers} volunteers and ${s.totalDonors} donors reaching ` +
    `${s.locationsCovered} location${s.locationsCovered === 1 ? "" : "s"}. See the full picture on our homepage's Impact section.`
  );
}

function contactAnswer() {
  return "You can reach Rishabh Shinghal, our founder, at +91 86301 97225 or rishabhshngl121@gmail.com, or use the form on the Contact page.";
}

function aboutAnswer() {
  return faq.find((f) => f.id === "what-is-hsf").answer;
}

// Loose FAQ match: score every FAQ entry by how many of the message's
// meaningful words appear in its question/answer/keywords, and return the
// best match if it clears a small relevance bar.
function matchFaq(tokens) {
  let best = null;
  let bestScore = 0;
  for (const entry of faq) {
    const haystack = tokenize(`${entry.question} ${entry.answer} ${entry.keywords.join(" ")}`);
    const score = tokens.filter((t) => haystack.includes(t)).length;
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }
  return bestScore >= 1 ? best : null;
}

router.post("/ask", (req, res) => {
  const message = (req.body?.message || "").trim();
  if (!message) return res.status(400).json({ error: "Message is required." });

  const tokens = tokenize(message);
  let reply;

  if (tokens.length === 0 || includesAny(tokens, ["namaste", "hii", "hiya", "sup"])) {
    reply = "Namaste 🙏 I'm Hari, the Hari Seva Foundation assistant. Ask me about donating, volunteering, food drives, campaigns, or our impact so far.";
  } else if (includesAny(tokens, ["material", "rice", "oil", "supplies", "goods", "pickup", "groceries"])) {
    reply = faq.find((f) => f.id === "how-donate-material").answer;
  } else if (includesAny(tokens, ["donate", "donation", "contribute", "pay", "payment", "upi", "razorpay", "qr", "fund", "money"])) {
    reply = donateAnswer();
  } else if (includesAny(tokens, ["volunteer", "volunteering"])) {
    reply = volunteerAnswer();
  } else if (includesAny(tokens, ["partner", "host", "venue", "restaurant", "temple", "collaborate", "collaboration"])) {
    reply = partnerAnswer();
  } else if (includesAny(tokens, ["drive", "drives", "event", "events", "distribution"])) {
    reply = listUpcomingDrives();
  } else if (includesAny(tokens, ["campaign", "campaigns", "fundraiser", "fundraising"])) {
    reply = listActiveCampaigns();
  } else if (includesAny(tokens, ["impact", "meals", "stats", "statistics", "beneficiaries", "served"])) {
    reply = impactAnswer();
  } else if (includesAny(tokens, ["contact", "phone", "email", "number", "reach", "call", "founder"])) {
    reply = contactAnswer();
  } else if (includesAny(tokens, ["hari", "foundation", "ngo", "seva", "who", "what"])) {
    reply = aboutAnswer();
  } else {
    const matched = matchFaq(tokens);
    if (matched) {
      reply = matched.answer;
    } else {
      reply =
        "I'm not totally sure about that one — you can reach us directly at rishabhshngl121@gmail.com or +91 86301 97225. " +
        "Or ask me about donating, volunteering, food drives, campaigns, or our impact so far.";
    }
  }

  res.json({ reply });
});

module.exports = router;
