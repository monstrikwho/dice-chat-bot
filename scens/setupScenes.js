const session = require("telegraf/session");
const Stage = require("telegraf/stage");

const { step1, step2, step3, step4 } = require("./singup.scene");
const { showMainMenu } = require("./mainMenu.scene");
const { showSettingsMenu } = require("./settingsMenu.scene");
const { weekMenu } = require("./weekMenu.scene");
const { autobusMenu } = require("./autobusMenu.scene");
const { takeAutobus, takePlaces } = require("./autobus.scene");

function setupScenes(bot) {
  const stage = new Stage([
    step1,
    step2,
    step3,
    step4,
    showMainMenu,
    showSettingsMenu,
    weekMenu,
    autobusMenu,
    takeAutobus, 
    takePlaces
  ]);
  bot.use(session());
  bot.use(stage.middleware());
}

module.exports = setupScenes;
