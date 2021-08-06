const session = require("telegraf/session");
const Stage = require("telegraf/stage");

const { showMainMenu } = require("./mainMenu.scene");
const { sportMenu } = require("./sportMenu.scene");
const { diceGame } = require("./diceGame.scene");
const { footballGame } = require("./football.scene");
const { slotGame } = require("./slotGame.scene");
const { pvpAllGames } = require("./pvpAllGames.scene");
const { lkMenu } = require("./lkMenu.scene");
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
const { outQiwi } = require("./outMoney/qiwi");
const { outCardRu } = require("./outMoney/cardRu");
const { outCardOther } = require("./outMoney/cardOther");

function setupScenes(bot) {
  const stage = new Stage([
    showMainMenu,
    sportMenu,
    diceGame,
    footballGame,
    slotGame,
    pvpAllGames,
    lkMenu,
    outMoney,
    inMoney,
    sendMailing,
    editPhoto,
    editVideo,
    editAnimation,
    editAudio,
    editVoice,
    editDocument,
    editMessage,
    outQiwi,
    outCardRu,
    outCardOther,
  ]);
  bot.use(session());
  bot.use(stage.middleware());
}

module.exports = setupScenes;
