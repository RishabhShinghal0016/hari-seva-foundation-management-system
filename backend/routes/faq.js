const express = require("express");
const faq = require("../data/faq");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(faq.map(({ id, question, answer }) => ({ id, question, answer })));
});

module.exports = router;
