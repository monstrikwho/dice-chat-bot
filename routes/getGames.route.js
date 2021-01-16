const { Router } = require("express");
const router = Router();

const InfoGames = require("../models/infoGames");
const moment = require("moment");

router.get("/", async (req, res) => {
  try {
    const games = await InfoGames.find({ date: moment().format("YYYY-MM-DD") });

    let countGame = game.length;
    let countWinGame = 0;
    let amountRate = 0;
    let amountWinRate = 0;

    for (let game of games) {
      if (game.result === "win") countWinGame++;
      amountRate += game.rateAmount;
      amountWinRate += game.rateWinAmount;
    }

    let percentWinGame = Math.floor((countGame / countWinGame) * 100);

    res
      .status(200)
      .send({ countGame, percentWinGame, amountRate, amountWinRate });
  } catch (error) {
    res.status(500).send({ message: "Что-то пошло не так" });
  }
});

module.exports = router;
