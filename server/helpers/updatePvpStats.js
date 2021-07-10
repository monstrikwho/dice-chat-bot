const moment = require("moment");

const User = require("../models/user");

async function updatePvpStats() {
  setInterval(checkUsers, 1000 * 60);

  async function checkUsers() {
    const time = moment().format("HH-mm");
    if (time !== "02-00") return;

    // Рейтинг КОСТИ
    const diceUsers = await User.find({ "pvpDice.count": { $gte: 1 } }).sort({
      "pvpDice.winCash": -1,
    });

    for (let i = 0; i < diceUsers.length; i++) {
      await User.updateOne(
        { userId: diceUsers[i].userId },
        { "pvpDice.rating": i + 1 }
      );
    }

    // Рейтинг ФУТБОЛ
    const footballUsers = await User.find({
      "pvpFootball.count": { $gte: 1 },
    }).sort({
      "pvpFootball.winCash": -1,
    });

    for (let i = 0; i < footballUsers.length; i++) {
      await User.updateOne(
        { userId: footballUsers[i].userId },
        { "pvpFootball.rating": i + 1 }
      );
    }

    // Рейтинг БОУЛИНГ
    const boulingUsers = await User.find({
      "pvpBouling.count": { $gte: 1 },
    }).sort({
      "pvpBouling.winCash": -1,
    });

    for (let i = 0; i < boulingUsers.length; i++) {
      await User.updateOne(
        { userId: boulingUsers[i].userId },
        { "pvpBouling.rating": i + 1 }
      );
    }
  }
}

module.exports = updatePvpStats;
