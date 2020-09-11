require("dotenv").config();
// Init
const { bot, startBot } = require("./init/startBot");
const setupMongoose = require('./init/setupMongoose')
// Commands
const setupStart = require("./commands/start");

// Init
setupMongoose()
// Commands
setupStart(bot);

// Let's start!
startBot();
