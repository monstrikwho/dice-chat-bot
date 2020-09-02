const session = require("telegraf/session");
const Stage = require("telegraf/stage");

const { step1, step2, step3, step4 } = require("./singup.scene");
const { showMainMenu } = require("./mainMenu.scene");
const { showSettingsMenu } = require("./settingsMenu.scene");
const { weekMenu } = require("./weekMenu.scene");

function setupScenes(bot) {
  const stage = new Stage([
    step1,
    step2,
    step3,
    step4,
    showMainMenu,
    showSettingsMenu,
    weekMenu,
  ]);
  bot.use(session());
  bot.use(stage.middleware());
}

module.exports = setupScenes;
