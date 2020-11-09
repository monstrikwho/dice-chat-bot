const session = require("telegraf/session");
const Stage = require("telegraf/stage");

const { showMainMenu } = require("./mainMenu.scene");
const { demoGame } = require("./demoGame.scene");
const { lkMenu } = require("./lkMenu.scene");
const { outMoney } = require("./outMoney.scene");

function setupScenes(bot) {
  const stage = new Stage([showMainMenu, demoGame, lkMenu, outMoney]);
  bot.use(session());
  bot.use(stage.middleware());
}

module.exports = setupScenes;
