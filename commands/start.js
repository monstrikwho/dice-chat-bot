const setupScenes = require("../scens/setupScenes");
const User = require("../models/user");

function setupStart(bot) {
  // Setup scens
  setupScenes(bot);

  // Start command
  bot.start(async (ctx) => {
    const selectUser = await User.findOne({ userId: ctx.from.id });

    if(selectUser) {
      ctx.reply('Вы уже зарегистрированы.')
      await ctx.scene.enter("showMainMenu");
      return
    }

    await ctx.scene.enter("step1");
  });
}

// Exports
module.exports = setupStart;
