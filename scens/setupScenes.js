const session = require("telegraf/session");
const Stage = require("telegraf/stage");

const { showMainMenu } = require("./mainMenu.scene");
const { diceGame } = require("./diceGame.scene");
const { footballGame } = require("./football.scene");
const { slotGame } = require("./slotGame.scene");
const { lkMenu } = require("./lkMenu.scene");
const { infoBlock } = require("./infoBlock.scene");
const { outMoney } = require("./outMoney.scene");
const { sendMailing } = require("./sendMailing.scene");
const { inMoney, writeAmount } = require("./inMoney.scene");
const { outQiwi } = require("./outMoney/qiwi");
const { outCardRu } = require("./outMoney/cardRu");
const { outCardOther } = require("./outMoney/cardOther");
const { refScene } = require("./referals.scene");

function setupScenes(bot) {
  const stage = new Stage([
    showMainMenu,
    diceGame,
    footballGame,
    slotGame,
    lkMenu,
    infoBlock,
    outMoney,
    inMoney,
    sendMailing,
    writeAmount,
    outQiwi,
    outCardRu,
    outCardOther,
    refScene,
  ]);
  bot.use(session());
  bot.use(stage.middleware());
}

module.exports = setupScenes;
