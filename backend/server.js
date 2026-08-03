require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const express = require('express');
const cors = require('cors');
const app = express();

const allowedOrigins = [
  'https://hariseva.netlify.app',
  'http://localhost:5173' // or your local frontend port
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Serve uploaded/static assets (QR code, logo, profile pic fallback)
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/assets", express.static(uploadsDir));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/campaigns", require("./routes/campaigns"));
app.use("/api/food-drives", require("./routes/fooddrives"));
app.use("/api/donations", require("./routes/donations"));
app.use("/api/volunteers", require("./routes/volunteers"));
app.use("/api/partners", require("./routes/partners"));
app.use("/api/inventory", require("./routes/inventory"));
app.use("/api/impact", require("./routes/impact"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/faq", require("./routes/faq"));
app.use("/api/assistant", require("./routes/assistant"));

app.get("/api/health", (req, res) => res.json({ status: "ok", name: "HSFMS API" }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

// Vercel imports this file as a serverless function handler and never calls it
// directly, so only start a normal listening server everywhere else (local
// dev, Render, Railway, etc.) — otherwise Vercel would try (and fail) to bind
// a real port inside its serverless environment.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Hari Seva Foundation Management System API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
