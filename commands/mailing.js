const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");

async function setupMailing(bot) {
  const users = await User.find();

  bot.command("replyUpdate", async (ctx) => {
    if (ctx.chat.id === 364984576) {
      for (let { userId } of users) {
        bot.telegram.sendMessage(
          userId,
          `Теперь можно:
- Посмотреть расписание преподавателя;
- Посмотерть расписание другой группы;
- Сменить группу, если ошибся в начале.

Всем хорошего дня 🌵

Для тех, кто не написал /start (сервер был перезапущен)`,
          Extra.markup(Markup.keyboard([["🔄 Update"]]).resize())
        );
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
