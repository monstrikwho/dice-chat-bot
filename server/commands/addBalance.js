const User = require("../models/user");

async function addBalance(bot) {
  bot.command("addBalance", async (ctx) => {
    const { userRights } = await User.findOne({ userId: ctx.from.id });
    if (userRights !== "admin") return;

    const msg = ctx.update.message.text.replace("/addBalance ", "");

    let type = null;
    let userId = null;
    let amount = null;

    try {
      type = msg.split("]")[0].replace("[", "");
    } catch (error) {}
    if (!type) return;

    try {
      userId = msg.split("] ")[1].split("-")[0];
    } catch (error) {}
    if (!userId) return;

    try {
      amount = msg.split("] ")[1].split("-")[1];
    } catch (error) {}
    if (!amount) return;

    if (type === "main") {
      await User.updateOne({ userId }, { $inc: { mainBalance: amount } });
      await bot.telegram.sendMessage(
        userId,
        `На ваш основной баланс было начислено ${amount}P.`
      );
      await ctx.reply("Баланс успешно пополнен.");
    }
    if (type === "demo") {
      await User.updateOne({ userId }, { $inc: { demoBalance: amount } });
      await bot.telegram.sendMessage(
        userId,
        `На ваш демо баланс было начислено ${amount}P.`
      );
      await ctx.reply("Баланс успешно пополнен.");
    }
  });
}

// Exports
module.exports = addBalance;
