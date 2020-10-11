const moment = require("moment");
const checkRasp = require("../helpers/checkRasp");
const User = require("../models/user");

module.exports = (bot) => {
  let every30m = setInterval(checkDate, 1000 * 60 * 30);
  let every5m = null;

  function checkDate() {
    const today = new Date().getDay();
    if (today === 3 && moment().hours() > 13) {
      remove30m();
      every5m = setInterval(checkRasp5m, 1000 * 60 * 5);
    }
  }

  async function checkRasp5m() {
    remove5m();
    const status = await checkRasp();
    if (status) {
      const allUser = await User.find();
      for (let user of allUser) {
        try {
          bot.sendMessage(
            user.userId,
            'Появилось расписание на следующую неделю. Вы можете посмотреть его во вкладке "Полное 📷".'
          );
        } catch (err) {
          console.log("Cообщение не было доставлено");
        }
      }
    } else {
      every30m = setInterval(checkDate, 1000 * 60 * 30);
    }
  }

  var remove30m = () => clearInterval(every30m);
  var remove5m = () => clearInterval(every5m);
};
