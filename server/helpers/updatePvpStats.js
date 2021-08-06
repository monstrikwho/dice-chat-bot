const moment = require("moment");

const User = require("../models/user");

async function updatePvpStats() {
  setInterval(checkUsers, 1000 * 60);

  async function checkUsers() {
    const time = moment().format("HH-mm");
    if (time !== "02-00") return;

    const diceUsers = await User.find({ "pvp.count": { $gte: 1 } }).sort({
      "pvp.winCash": -1,
    });

    for (let i = 0; i < diceUsers.length; i++) {
      await User.updateOne(
        { userId: diceUsers[i].userId },
        { "pvp.rating": i + 1 }
      );
    }
  }
}

module.exports = updatePvpStats;
