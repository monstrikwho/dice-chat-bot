require("dotenv").config();

// Init
const { bot, startBot } = require("./init/startBot");
// Commands
const setupStart = require("./commands/start");

// Commands
setupStart(bot);

// const { parseTeachers } = require("./helpers/parseData");
// bot.command("parse", parseTeachers());

// Let's start!
startBot();
