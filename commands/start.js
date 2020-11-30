const setupScenes = require("../scens/setupScenes");
const moment = require("moment");
const User = require("../models/user");

function setupStart(bot) {
  // Setup scens
  setupScenes(bot);

  const actionsUser = async (ctx) => {
    const selectUser = await User.findOne({ userId: ctx.from.id });

    if (!selectUser) {
      const user = new User({
        userId: ctx.from.id,
        demoBalance: 1000,
        mainBalance: 0,
        regDate: moment().format("DD, MM, YYYY, hh:mm:ss"),
        userName: ctx.from.username,
        isBlocked: false,
      });
      await user.save();
    } else {
      await User.findOne({ userId: ctx.from.id }, { isBlocked: false });
      return await ctx.scene.enter("showMainMenu");
    }

    await ctx.reply(`Добро пожаловать в бот честных онлайн игр!
  Здесь удача зависит только от вас!🌈
  
  Вы сами отправляете нам игровой стикер от телеграмм, а мы считываем его результат и платим Вам деньги! 💸
  
  Попробуйте БЕСПЛАТНО на демо-счете. Приятной игры!🎉`);
    return await ctx.scene.enter("showMainMenu");
  };

  // Start command
  bot.start(async (ctx) => {
    try {
      setTimeout(() => actionsUser(ctx), 0);
    } catch (err) {
      console.log("Не удалось пройти регистрацию", err.message);
    }
  });
}

// Exports
module.exports = setupStart;
