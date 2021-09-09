const session = require("telegraf/session");
const Stage = require("telegraf/stage");

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
  editDocument,
  editMessage,
} = require("./sendMailing.scene");

function setupScenes(bot) {
  const stage = new Stage([
    sportMenu,
    diceGame,
    footballGame,
    slotGame,
    pvpAllGames,
    lkMenu,
    sendMailing,
    editPhoto,
    editVideo,
    editDocument,
    editMessage,
  ]);
  bot.use(session());
  bot.use(stage.middleware());
}

module.exports = setupScenes;
