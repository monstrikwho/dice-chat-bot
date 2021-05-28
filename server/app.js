require("dotenv").config({ path: "../.env" });

// Init
const { bot, startBot } = require("./init/startBot");
const setupMongoose = require("./init/setupMongoose");
const server = require("./init/setupServer");

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