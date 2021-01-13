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

bot.command('bot', ctx => {
  const f = '2342.5'
  console.log(+f+10)
})
