const moment = require("moment");

const User = require("../models/user");

async function updatePvpStats() {
  setInterval(checkUsers, 1000 * 60);

  async function checkUsers() {
    const time = moment().format("HH-mm");
    if (time !== "02-00") return;

    const diceUsers = await User.find({ "pvpDice.count": { $gte: 1 } }).sort({
      "pvpDice.winCash": -1,
    });

    for (let i = 0; i < users.length; i++) {
      await User.updateOne(
        { userId: diceUsers[i].userId },
        { "pvpDice.rating": i + 1 }
      );
    }

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
  }
}

module.exports = updatePvpStats;
