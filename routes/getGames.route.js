const { Router } = require("express");
const router = Router();

const InfoGames = require("../models/infoGames");
const moment = require("moment");

router.get("/:date", async (req, res) => {
  try {
    const games = await InfoGames.find({ date: req.params.date });

    let countGame = games.length;
    let countWinGame = 0;
    let countDemoGame = 0;
    let countMainGame = 0;
    let amountRate = 0;
    let amountWinRate = 0;
    let countTypeGame = {
      slot: 0,
      dice: 0,
      football: 0,
    };

    for (let game of games) {
      if (game.result === "win") countWinGame++;
      amountRate += game.rateAmount;
      amountWinRate += game.rateWinAmount;
      countTypeGame[game.typeGame] += 1;
      if (game.typeBalance === "mainGame") countMainGame++;
      if (game.typeBalance === "demoGame") countDemoGame++;
    }

    let percentWinGame = Math.floor((countGame / countWinGame) * 100);

    res.status(200).send({
      countGame,
      percentWinGame,
      countDemoGame,
      countMainGame,
      amountRate,
      amountWinRate,
      countTypeGame,
    });
  } catch (error) {
    res.status(500).send({ message: "Что-то пошло не так" });
  }
});

module.exports = router;
