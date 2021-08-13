const session = require("telegraf/session");
const Stage = require("telegraf/stage");

const { showMainMenu } = require("./mainMenu.scene");
const { sportMenu } = require("./sportMenu.scene");
const { diceGame } = require("./diceGame.scene");
const { footballGame } = require("./football.scene");
const { slotGame } = require("./slotGame.scene");
const { pvpAllGames } = require("./pvpAllGames.scene");
const { lkMenu } = require("./lkMenu.scene");
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

function setupScenes(bot) {
  const stage = new Stage([
    showMainMenu,
    sportMenu,
    diceGame,
    footballGame,
    slotGame,
    pvpAllGames,
    lkMenu,
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
