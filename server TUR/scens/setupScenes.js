const session = require("telegraf/session");
const Stage = require("telegraf/stage");

const { showMainMenu } = require("./mainMenu.scene");
const { moderMenu } = require("./moderMenu.scene");
const { diceGame } = require("./diceGame.scene");
const { footballGame } = require("./football.scene");
const { slotGame } = require("./slotGame.scene");
const { pvpDiceGame } = require("./pvpDiceGame.scene");
const { pvpFootballGame } = require("./pvpFootballGame.scene");
const { pvpBoulingGame } = require("./pvpBoulingGame.scene");
const { lkMenu } = require("./lkMenu.scene");
const { addBalance } = require("./addBalance.scene");
const { infoBlock } = require("./infoBlock.scene");
const { outMoney } = require("./outMoney.scene");
const {
  sendMailing,
  editPhoto,
  editVideo,
  editAnimation,
  editAudio,
  editVoice,
  editDocument,
  editMessage,
} = require("./sendMailing.scene");
const { inMoney } = require("./inMoney.scene");

function setupScenes(bot) {
  const stage = new Stage([
    showMainMenu,
    moderMenu,
    diceGame,
    footballGame,
    slotGame,
    pvpDiceGame,
    pvpFootballGame,
    pvpBoulingGame,
    lkMenu,
    infoBlock,
    outMoney,
    inMoney,
    addBalance,
    sendMailing,
    editPhoto,
    editVideo,
    editAnimation,
    editAudio,
    editVoice,
    editDocument,
    editMessage,
  ]);
  bot.use(session());
  bot.use(stage.middleware());
}

module.exports = setupScenes;
