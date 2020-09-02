const setupScenes = require("../scens/setupScenes");

function setupStart(bot) {
  // Setup scens
  setupScenes(bot);

  // Start command
  bot.start(async (ctx) => {
    await ctx.scene.enter("step1");
  });
}

// Exports
module.exports = setupStart;
