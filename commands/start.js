const setupScenes = require("../scens/setupScenes");
const User = require("../models/user");

function setupStart(bot) {
  // Setup scens
  setupScenes(bot);

  // Start command
  bot.start(async (ctx) => {
    try {
      const selectUser = await User.findOne({ userId: ctx.from.id });
      
      if (!selectUser) {
        const user = new User({
          userId: ctx.from.id,
          demoBalance: 1000,
          mainBalance: 0,
        });
        await user.save();
      } else {
        return await ctx.scene.enter("showMainMenu");
      }

      await ctx.reply(`Добро пожаловать в бот честных онлайн игр!
Тут удача зависит только от вас!🌈

Вы сами отправляете нам игровой стикер от телеграмм, а мы считываем его результат и платим Вам деньги! 💸

Попробуйте БЕСПЛАТНО на демо-счете. Приятной игры!🎉`);
      return await ctx.scene.enter("showMainMenu");
    } catch (err) {
      console.log("Не удалось пройти регистрацию", err.message);
    }
  });
}

// Exports
module.exports = setupStart;
