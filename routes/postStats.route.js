const { Router } = require("express");
const router = Router();

const DayStats = require("../models/dayStats");
const MainStats = require("../models/mainStats");

router.post("/", async (req, res) => {
  try {
    saveData(req);
    res.status(200).send("Stats will be send");
  } catch (error) {
    res.status(500).send({ message: "Что-то пошло не так" });
  }
});

const initData = (date) => ({
  day: date,
  games: {
    countGames: 0,
    winGames: 0,
    amountRate: 0,
    amountWinCash: 0,
    slot: {
      countGames: 0,
      winGames: 0,
      amoutnRate: 0,
      amountWinCash: 0,
    },
    dice: {
      countGames: 0,
      winGames: 0,
      amoutnRate: 0,
      amountWinCash: 0,
    },
    football: {
      countGames: 0,
      winGames: 0,
      amoutnRate: 0,
      amountWinCash: 0,
    },
  },
  payments: {
    amountInCash: 0,
    amountOutCash: 0,
    countInOrder: 0,
    countOutOrder: 0,
  },
  users: {
    newUsers: 0,
    refUsers: 0,
  },
});

async function saveData({ type, data }) {
  if (type === "games") {
    const {
      typeGame,
      typeBalance,
      result,
      rateAmount,
      rateWinAmount,
      rateValue,
      rate,
      userId,
      date,
    } = data;

    if (typeBalance === "mainBalance") {
      const dataOfDay = await DayStats.findOne({ date });

      if (!dataOfDay) {
        const dayStats = new DayStats(initData(date));
        await dayStats.save();
      }

      await DayStats.updateOne(
        { date },
        {
          games: {
            $inc: {
              countGames: 1,
              winGames: result === "win" ? 1 : 0,
              amountRate: rateAmount,
              amountWinCash: rateWinAmount,
            },
            [typeGame]: {
              $inc: {
                countGames: 1,
                winGames: result === "win" ? 1 : 0,
                amountRate: rateAmount,
                amountWinCash: rateWinAmount,
              },
            },
          },
        }
      );

      await MainStats.updateOne(
        {},
        {
          games: {
            [typeGame]: {
              $inc: {
                countGame: 1,
                countWinGame: result === "win" ? 1 : 0,
                countAmount: rateAmount,
                countWinAmount: rateWinAmount,
              },
            },
          },
        }
      );
    }

    // Save info demo and main games
    const infoGame = new InfoGames(data);
    await infoGame.save();
  }

  if (type === "payments") {
    const { amount, typeOrder, txnId, date } = data;

    const dataOfDay = await DayStats.findOne({ date });

    if (!dataOfDay) {
      const dayStats = new DayStats(initData(date));
      await dayStats.save();
    }

    if (typeOrder === "IN") {
      await DayStats.updateOne(
        { date },
        {
          $inc: {
            "payments.amountInCash": amount,
            "payments.countInOrder": 1,
          },
        }
      );
      await MainStats.updateOne(
        {},
        {
          $inc: {
            "orderStats.amountInMoney": amount,
            "orderStats.countInOrder": 1,
          },
        }
      );
    }

    if (typeOrder === "OUT") {
      await DayStats.updateOne(
        { date },
        {
          $inc: {
            "payments.amountInCash": amount,
            "payments.countInOrder": 1,
          },
        }
      );
      await MainStats.updateOne(
        {},
        {
          $inc: {
            "orderStats.amountOutMoney": amount,
            "orderStats.countOutOrder": 1,
          },
          "orderStats.lastNumberOrder": txnId,
        }
      );
    }
  }

  if (type === "users") {
    const { date } = data;

    const dataOfDay = await DayStats.findOne({ date });

    if (!dataOfDay) {
      const dayStats = new DayStats(initData(date));
      await dayStats.save();
    }

    await DayStats.updateOne({ date }, { $inc: { "users.newUsers": 1 } });
    await MainStats.updateOne({}, { $inc: { "usersStats.countUsers": 1 } });
  }
}

module.exports = router;
