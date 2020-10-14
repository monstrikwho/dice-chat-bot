const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");

async function setupMailing(bot) {
  const users = await User.find();

  bot.command("replyUpdate", async (ctx) => {
    if (ctx.chat.id === 364984576) {
      for (let { userId } of users) {
        try {
          await bot.telegram.sendMessage(
            userId,
            `Теперь расписание на следующую неделю приходит корректно`,
            Extra.markup(Markup.keyboard([["🔄 Update"]]).resize())
          );
        } catch (e) {
          console.log(
            "Сообщение не было доставлено. Пользователь заблокировал бота.",
            userId
          );
          await User.findOneAndRemove({userId})
        }
      }

      bot.hears("🔄 Update", async (ctx) => {
        await ctx.scene.enter("showMainMenu");
      });
    }
  });

  // 364984576🌵
  // 727186107
}

// Exports
module.exports = setupMailing;
