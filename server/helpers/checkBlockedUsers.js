const moment = require("moment");

const User = require("../models/user");
const MainStats = require("../models/mainstats");

async function setupStats(bot) {
  setInterval(checkUsers, 1000 * 60);

  async function checkUsers() {
    const time = moment().format("HH-mm");
    if (time !== "04-00") return;

    const users = await User.find();
    for (let { userId } of users) {
      let countBlocked = 0;
      try {
        await bot.telegram.sendChatAction(userId, "typing");
        await User.updateOne({ userId }, { isBlocked: false });
      } catch (err) {
        countBlocked++;
        await User.updateOne({ userId }, { isBlocked: true });
      }
    }

    await MainStats.updateOne(
      {},
      { "usersStats.countUsersBlocked": countBlocked }
    );
  }
}

module.exports = setupStats;
