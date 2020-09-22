const User = require("../models/user");

module.exports = (bot) => {
  let now = Date.now();

  setInterval( async () => {
    if (Date.now() > now + 1000 * 60 * 60 * 24) {
      const users = await User.find()
      await bot.telegram.sendMessage(727186107, `Зарегистрировано ${users.length} человек`)
      now = Date.now();
    }
  }, 1000*60*30);
};
