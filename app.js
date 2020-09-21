require("dotenv").config();
// Init
const { bot, startBot } = require("./init/startBot");
const setupMongoose = require('./init/setupMongoose')
// Commands
const setupStart = require("./commands/start");
const setupMailing = require("./commands/mailing");

// Init
setupMongoose()
// Commands
setupStart(bot);
setupMailing(bot)

// Let's start!
startBot();
