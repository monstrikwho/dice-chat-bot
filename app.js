require("dotenv").config();
// Init
const { bot, startBot } = require("./init/startBot");
const setupMongoose = require('./init/setupMongoose')
const checkRasp = require('./init/checkRaspCycle')
// Commands
const setupStart = require("./commands/start");
const setupMailing = require("./commands/mailing");

// Init
setupMongoose()
try {
  checkRasp(bot)
} catch (error) {
  console.log(error)
}
// Commands
setupStart(bot);
setupMailing(bot)

// Let's start!
startBot();
