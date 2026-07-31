const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { collection } = require("../store");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();
const users = collection("users");

function sign(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function publicUser(user) {
  const { password, ...rest } = user;
  return rest;
}

router.get("/config", (req, res) => {
  res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID || null });
});

router.post("/register", (req, res) => {
  const { name, email, mobile, password, role, address, skills, availability, facilities } = req.body;

  if (!name || !email || !mobile || !password || !role) {
    return res.status(400).json({ error: "Name, email, mobile, password and role are required." });
  }
  if (!["donor", "volunteer", "partner"].includes(role)) {
    return res.status(400).json({ error: "Invalid role for self-registration." });
  }
  if (users.findOne((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }

  const hash = bcrypt.hashSync(password, 10);
  const user = users.insert({
    name,
    email,
    mobile,
    password: hash,
    role,
    address: address || "",
    skills: skills || "",
    availability: availability || "",
    facilities: facilities || "",
    totalEvents: 0,
    totalHours: 0,
  });

  const token = sign(user);
  res.status(201).json({ token, user: publicUser(user) });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.findOne((u) => u.email.toLowerCase() === (email || "").toLowerCase());
  if (!user) return res.status(401).json({ error: "Incorrect email or password." });
  if (!user.password) {
    return res.status(401).json({ error: "This account was created with Google sign-in. Please use 'Sign in with Google' instead." });
  }
  if (!bcrypt.compareSync(password || "", user.password)) {
    return res.status(401).json({ error: "Incorrect email or password." });
  }
  const token = sign(user);
  res.json({ token, user: publicUser(user) });
});

router.get("/me", (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Not logged in." });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = users.findById(payload.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ user: publicUser(user) });
  } catch {
    res.status(401).json({ error: "Session expired." });
  }
});

// Sign in / sign up with Google. Frontend sends the ID token credential from
// Google Identity Services; we verify it server-side before trusting it.
router.post("/google", async (req, res) => {
  const { credential, role } = req.body;
  if (!credential) return res.status(400).json({ error: "Missing Google credential." });
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(503).json({
      error: "Google sign-in isn't configured yet. Add GOOGLE_CLIENT_ID to backend/.env and restart the server.",
    });
  }

  let payload;
  try {
    const { OAuth2Client } = require("google-auth-library");
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    payload = ticket.getPayload();
  } catch (err) {
    return res.status(401).json({ error: "Could not verify Google sign-in. Please try again." });
  }

  const email = payload.email;
  let user = users.findOne((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // First time signing in with this Google account -> create a new account.
    // Self-serve Google sign-in only makes sense for donor/volunteer/partner,
    // same roles allowed for ordinary registration.
    const chosenRole = ["donor", "volunteer", "partner"].includes(role) ? role : "donor";
    user = users.insert({
      name: payload.name || email.split("@")[0],
      email,
      mobile: "",
      password: null,
      googleAuth: true,
      picture: payload.picture || "",
      role: chosenRole,
      address: "",
      skills: "",
      availability: "",
      facilities: "",
      totalEvents: 0,
      totalHours: 0,
    });
  }

  const token = sign(user);
  res.json({ token, user: publicUser(user) });
});

module.exports = router;
