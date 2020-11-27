require("dotenv").config();

// Init
const { bot, startBot } = require("./init/startBot");
const { app, startRoutes } = require("./init/startRoutes");
const setupMongoose = require("./init/setupMongoose");
const { footballStat } = require("./init/takeStat");

// Commands
const setupStart = require("./commands/start");

// Init
startBot();
startRoutes();
setupMongoose();

// Commands
setupStart(bot);
