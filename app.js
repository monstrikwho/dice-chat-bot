require("dotenv").config();

// Init
const { bot, startBot } = require("./init/startBot");
// Commands
const setupStart = require("./commands/start");

// Commands
setupStart(bot);

// Let's start!
startBot();
