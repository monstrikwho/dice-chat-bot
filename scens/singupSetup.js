const session = require("telegraf/session");
const Stage = require("telegraf/stage");

const { step1, step2, step3, step4 } = require("./singup.scene");

function setupSingupScenes(bot) {
  const stage = new Stage([step1, step2, step3, step4]);
  bot.use(session());
  bot.use(stage.middleware());
}

module.exports = setupSingupScenes;
