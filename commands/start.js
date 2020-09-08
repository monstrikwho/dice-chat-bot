const setupScenes = require("../scens/setupScenes");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");

function setupStart(bot) {
  // Setup scens
  setupScenes(bot);

  // Start command
  bot.start(async (ctx) => {
    await ctx.reply("Регистрация", Markup.removeKeyboard().extra());
    
    const selectUser = await User.findOne({ userId: ctx.from.id });
    if (selectUser) {
      await ctx.reply("Вы уже зарегистрированы.");
      await ctx.scene.enter("showMainMenu");
      return;
    }

    await ctx.scene.enter("step1");
  });
}

// Exports
module.exports = setupStart;
