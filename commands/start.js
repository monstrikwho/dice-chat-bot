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
          demoBalance: 15000,
          mainBalance: 500,
        });
        await user.save();
      }
      ctx.reply("приветственное письмо");
      return await ctx.scene.enter("showMainMenu");
    } catch (err) {
      console.log("Не удалось пройти регистрацию", err.message);
    }
  });
}

// Exports
module.exports = setupStart;
