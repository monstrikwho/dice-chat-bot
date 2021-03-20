const setupScenes = require("../scens/setupScenes");

const moment = require("moment");

const User = require("../models/user");

function setupStart(bot) {
  // Setup scens
  setupScenes(bot);

  // Start command
  bot.start(async (ctx) => {
    // Откидываем возможность запуска бота в пабликах
    if (+ctx.chat.id < 0) return;

    try {
      const selectUser = await User.findOne({ userId: ctx.from.id });
      if (!selectUser) {
        const user = new User({
          userId: ctx.from.id,
          demoBalance: 2000,
          mainBalance: 0,
          isBlocked: false,
          regDate: moment().format("YYYY-MM-DD"),
          status: 'user'
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
    } catch (err) {
      console.log("Не удалось пройти регистрацию", err.message);
    }
  });
}

module.exports = setupStart;
