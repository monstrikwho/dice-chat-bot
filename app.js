require("dotenv").config();

// Init
const { bot, startBot } = require("./init/startBot");
const { app, startRoutes } = require("./init/startRoutes");
const setupMongoose = require("./init/setupMongoose");

// Helpers
// const fakeOrders = require("./helpers/fakeOrders");

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

// Helpers
// fakeOrders(bot)