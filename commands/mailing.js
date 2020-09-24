const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");

async function setupMailing(bot) {
  const users = await User.find();

  try {
    bot.command("replyUpdate", async (ctx) => {
      if (ctx.chat.id === 364984576) {
        for (let { userId } of users) {
          bot.telegram.sendMessage(
            userId,
            `Сервер был перезапущен`,
            Extra.markup(Markup.keyboard([["🔄 Update"]]).resize())
          );
        }

        bot.hears("🔄 Update", (ctx) => {
          ctx.scene.enter("showMainMenu");
        });
      }
    });
  } catch (e) {
    console.log('Сообщение не было доставлено. Пользователь заблокировал бота.')
  }

  // 364984576
}

// Exports
module.exports = setupMailing;
