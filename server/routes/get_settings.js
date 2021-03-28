const { Router } = require("express");
const router = Router();

const MainStats = require("../models/mainstats");

router.get("/", async (req, res) => {
  const stats = await MainStats.findOne({});

  res.send(stats);
});

module.exports = router;
