const setupSingupScenes = require("../scens/singupSetup");

function setupStart(bot) {
  // Setup scens
  setupSingupScenes(bot);

  // Start command
  bot.start(async (ctx) => {
    await ctx.scene.enter("step1");
  });
}

// Exports
module.exports = setupStart;
