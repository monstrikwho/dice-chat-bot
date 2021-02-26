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

const Users = require("./models/user");
bot.command("checkusers", async (ctx) => {
  let count = 0;

  await ctx.reply("Checking..");

  const users = await Users.find();
  for (let { userId } of users) {
    try {
      await bot.telegram.sendChatAction(userId, "typing");
    } catch (error) {
      count++;
      await User.findOne({ userId }, { isBlocked: true });
    }
  }

  await ctx.reply("Count blocked: ", count);
});
