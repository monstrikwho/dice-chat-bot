require("dotenv").config();

// Init
const { bot, startBot } = require("./init/startBot");
const setupMongoose = require("./init/setupMongoose");

require("./init/setupServer");
// require("./helpers/checkRates");
// require("./helpers/parseTopMatches");
// require("./helpers/parseSoccer");
// require("./helpers/parseTennis");
// require("./helpers/parseBasketball");
require("./helpers/checkBlockedUsers")(bot);
require("./helpers/updatePvpStats")();

require("./scens/setupScenes")(bot);

// Commands
const { setupStart } = require("./commands/start");
const { mainMenuActions } = require("./scens/mainMenu.scene");

// Init
startBot();
setupMongoose();

// Commands
setupStart(bot);
mainMenuActions(bot);
