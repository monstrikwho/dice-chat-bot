require("dotenv").config();

// Init
const { bot, startBot } = require("./init/startBot");
const { app, startRoutes } = require("./init/startRoutes");
const setupMongoose = require("./init/setupMongoose");
// const { footballStat } = require("./init/takeStat");

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

const {
  deleteActiveHook,
  setWebHook,
  testWebHook,
} = require("./helpers/qiwiMethods");
bot.command("1", async (ctx) => {
  await myTestHook()
});
