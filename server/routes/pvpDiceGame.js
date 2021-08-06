const { Router } = require("express");
const router = Router();

const PvpModel = require("../models/pvpAllGames");

router.get("/", async (req, res) => {
  const dice = await PvpModel.find().sort({ _id: -1 });
  res.send(dice);
});

module.exports = router;
