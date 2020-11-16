const session = require("telegraf/session");
const Stage = require("telegraf/stage");

const { showMainMenu } = require("./mainMenu.scene");
const { diceGame } = require("./diceGame.scene");
const { lkMenu } = require("./lkMenu.scene");
// const { outMoney } = require("./outMoney.scene");
// const { inMoney, writeAmount } = require("./inMoney.scene");
// const { outQiwi } = require("./outMoney/qiwi");
// const { visaOther } = require("./outMoney/visaOther");
// const { mcOther } = require("./outMoney/mcOther");
// const { visaRu } = require("./outMoney/visaRu");
// const { mcRu } = require("./outMoney/mcRu");

function setupScenes(bot) {
  const stage = new Stage([
    showMainMenu,
    diceGame,
    lkMenu,
    // outMoney,
    // inMoney,
    // writeAmount,
    // outQiwi,
    // visaOther,
    // mcOther,
    // visaRu,
    // mcRu,
  ]);
  bot.use(session());
  bot.use(stage.middleware());
}

module.exports = setupScenes;
