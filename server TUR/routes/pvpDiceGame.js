const { Router } = require("express");
const router = Router();

const PvpDiceGame = require("../models/pvpDiceGame");

router.get("/", async (req, res) => {
  const dice = await PvpDiceGame.find().sort({ _id: -1 });
  res.send(dice);
});

module.exports = router;
