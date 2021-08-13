require("dotenv").config();

// Init
require("./init/setupServer");
// require("./helpers/updateSportData");
const { bot, startBot } = require("./init/startBot");
const setupMongoose = require("./init/setupMongoose");

// Commands
const setupStart = require("./commands/start");
const setupStats = require("./helpers/checkBlockedUsers");
const updatePvpStats = require("./helpers/updatePvpStats");

// Init
startBot();
setupMongoose();

// Commands
setupStart(bot);
setupStats(bot);
updatePvpStats();
