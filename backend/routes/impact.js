const express = require("express");
const { computeImpactStats } = require("../lib/impactStats");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(computeImpactStats());
});

module.exports = router;
