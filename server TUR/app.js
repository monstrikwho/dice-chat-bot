require("dotenv").config();

// Init
require("./init/setupServer");
const { bot, startBot } = require("./init/startBot");
const setupMongoose = require("./init/setupMongoose");

// Commands
require("./commands/newChatMember");
const setupStart = require("./commands/start");
const setupStats = require("./helpers/checkBlockedUsers");
const updatePvpStats = require("./helpers/updatePvpStats");
const updateCurrency = require("./helpers/updateCurrency");

// Init
startBot();
setupMongoose();

// Commands
setupStart(bot);
setupStats(bot);
updatePvpStats();
updateCurrency();

// Обработка колбеков (общая)
require("./commands/cbInMoney");

bot.on("video", (ctx) => {
  console.log(ctx.update);
});
