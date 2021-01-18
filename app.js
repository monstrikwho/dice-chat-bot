require("dotenv").config();

// Init
const { bot, startBot } = require("./init/startBot");
const { startRoutes } = require("./init/startRoutes");
const setupMongoose = require("./init/setupMongoose");

// Commands
const setupStart = require("./commands/start");
const mailing = require("./commands/mailing");

// Init
startBot();
startRoutes();
setupMongoose();

// Commands
setupStart(bot);
mailing(bot);

