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
      await Users.findOne({ userId }, { isBlocked: true });
    }
  }

  await ctx.reply(`Count blocked: ${count}`);
});

bot.command("addBalance", async (ctx) => {
  if (ctx.from.id !== 364984576) return;

  const msg = ctx.update.message.text.replace("/addBalance ", "");
  const type = msg.split("]")[0].replace("[", "");
  const userId = msg.split("] ")[1].split("-")[0];
  const amount = msg.split("] ")[1].split("-")[1];

  if (type === "main") {
    await Users.updateOne({ userId }, { $inc: { mainBalance: amount } });
    await bot.telegram.sendMessage(
      userId,
      `На ваш основной баланс было начислено ${amount}P.`
    );
  }
  if (type === "demo") {
    await Users.updateOne({ userId }, { $inc: { demoBalance: amount } });
    await bot.telegram.sendMessage(
      userId,
      `На ваш демо баланс было начислено ${amount}P.`
    );
  }
});
