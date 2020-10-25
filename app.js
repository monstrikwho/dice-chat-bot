require("dotenv").config();
// Init
const { bot, startBot } = require("./init/startBot");
const setupMongoose = require('./init/setupMongoose')
const setupCheckRasp = require('./init/checkRaspCycle')
// Commands
const setupStart = require("./commands/start");
const setupMailing = require("./commands/mailing");

// Init
setupMongoose()
setupCheckRasp(bot)
// Commands
setupStart(bot);
setupMailing(bot)

// Let's start!
startBot();
