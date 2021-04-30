const { Router } = require("express");
const router = Router();

const Stats = require("../models/mainstats");

router.get("/", async (req, res) => {
  const stats = await Stats.findOne();
  res.send({ stats });
});

module.exports = router;
