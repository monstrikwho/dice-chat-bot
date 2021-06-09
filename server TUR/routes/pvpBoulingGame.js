const { Router } = require("express");
const router = Router();

const PvpBoulingGame = require("../models/pvpBoulingGame");

router.get("/", async (req, res) => {
  const bouling = await PvpBoulingGame.find().sort({ _id: -1 });
  res.send(bouling);
});

module.exports = router;
