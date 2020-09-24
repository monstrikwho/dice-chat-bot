const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");

async function setupMailing(bot) {
  const users = await User.find();

  bot.command("replyUpdate", async (ctx) => {
    if (ctx.chat.id === 364984576) {
      for (let { userId } of users) {
        try {
          bot.telegram.sendMessage(
            userId,
            `Сервер был перезапущен`,
            Extra.markup(Markup.keyboard([["🔄 Update"]]).resize())
          );
        } catch (e) {
          console.log(
            "Сообщение не было доставлено. Пользователь заблокировал бота.", userId
          );
        }
      }

      bot.hears("🔄 Update", (ctx) => {
        ctx.scene.enter("showMainMenu");
      });
    }
  });

  // 364984576
}

// Exports
module.exports = setupMailing;
