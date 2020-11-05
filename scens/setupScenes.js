const session = require("telegraf/session");
const Stage = require("telegraf/stage");

const { showMainMenu } = require("./mainMenu.scene");
const { demoGame } = require("./demoGame.scene");

function setupScenes(bot) {
  const stage = new Stage([showMainMenu, demoGame]);
  bot.use(session());
  bot.use(stage.middleware());
}

module.exports = setupScenes;
