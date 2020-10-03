const Markup = require("telegraf/markup");
const setupScenes = require("../scens/setupScenes");

const User = require("../models/user");

function setupStart(bot) {
  // Setup scens
  setupScenes(bot);

  // Start command
  bot.start(async (ctx) => {
    try {
      let reg = await ctx.reply(
        "Регистрация",
        Markup.removeKeyboard().extra()
      );

      const selectUser = await User.findOne({ userId: ctx.from.id });
      if (selectUser) {
        await ctx.deleteMessage(reg.message_id)
        await ctx.reply("Вы уже зарегистрированы.");
        return await ctx.scene.enter("showMainMenu");
      }

      await ctx.scene.enter("step1");
    } catch (err) {
      console.log("Не удалось пройти регистрацию (start.js)", err.message);
    }
  });
}

// Exports
module.exports = setupStart;
