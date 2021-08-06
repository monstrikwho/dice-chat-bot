const { Router } = require("express");
const router = Router();

const PvpFootballGame = require("../models/pvpAllGames");

router.get("/", async (req, res) => {
  const football = await PvpFootballGame.find().sort({ _id: -1 });
  res.send(football);
});

module.exports = router;
