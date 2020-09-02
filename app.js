require("dotenv").config();
// Init
const { bot, startBot } = require("./init/startBot");
// Commands
const setupStart = require("./commands/start");

// Commands
setupStart(bot);

bot.command("msg", (ctx) => {
  setInterval(function () {
    const curDate =
      new Date().getHours() +
      ":" +
      new Date().getMinutes() +
      ":" +
      new Date().getSeconds();
    bot.telegram.sendMessage(ctx.from.id, curDate);
  }, 1000);
  console.log(ctx.from.id);
});

// Let's start!
startBot();
