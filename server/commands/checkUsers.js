const User = require("../models/user");

async function checkUsers(bot) {
  bot.command("checkusers", async (ctx) => {
    const { userRights } = await User.find({ userId: ctx.from.id });
    if (userRights !== "admin") return;

    let count = 0;

    await ctx.reply("Checking..");

    const users = await User.find();
    for (let { userId } of users) {
      try {
        await bot.telegram.sendChatAction(userId, "typing");
      } catch (error) {
        count++;
        await User.findOne({ userId }, { isBlocked: true });
      }
    }

    await ctx.reply(`Count blocked: ${count}`);
  });
}

// Exports
module.exports = checkUsers;
