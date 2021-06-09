const { Router } = require("express");
const router = Router();

const Games = require("../models/games");

router.get("/", async (req, res) => {
  const games = await Games.find({ typeBalance: "mainGame" }).sort({ _id: -1 });
  res.send({ games });
});

module.exports = router;
