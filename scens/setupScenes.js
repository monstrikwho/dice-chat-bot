const session = require("telegraf/session");
const Stage = require("telegraf/stage");

const { step1, step2, step3, step4 } = require("./singup.scene");
const { showMainMenu } = require("./mainMenu.scene");
const { showSettingsMenu } = require("./settingsMenu.scene");
const { weekMenu } = require("./weekMenu.scene");
const { autobusMenu } = require("./autobusMenu.scene");
const { nearestAutobus } = require("./nearestAutobus.scene");
const { otherAutobus } = require("./otherAutobus.scene");
const { yourAutobus } = require("./yourAutobus.scene");
const {
  takeAutobus,
  takePlaces,
  changeAutobus,
  deleteAutobus,
} = require("./autobus.scene");
const { raspTeachers, setupDay } = require("./raspTeachers.scene");

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
    takePlaces,
    nearestAutobus,
    otherAutobus,
    yourAutobus,
    changeAutobus,
    deleteAutobus,
    raspTeachers,
    setupDay,
  ]);
  bot.use(session());
  bot.use(stage.middleware());
}

module.exports = setupScenes;
