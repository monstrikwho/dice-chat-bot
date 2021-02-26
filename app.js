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

const User = require("./models/user");

bot.command("a", async (ctx) => {
  const users = await User.find();
  for (let { userId } of users) {
    await User.updateOne(
      { userId },
      {
        demoBalance: 10000,
        mainBalance: 0,
        status: "user",
        $unset: {
          isRef: 1,
        },
      }
    );
  }
});
