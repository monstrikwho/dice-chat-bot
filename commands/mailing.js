const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");

async function setupMailing(bot) {
  const users = await User.find();

  bot.command("replyUpdate", async (ctx) => {
    if (ctx.chat.id === 364984576) {
      for (let { userId } of users) {
        try {
          const selectUser = await User.findOne({ userId: ctx.from.id });

          if (selectUser) {
            return await bot.telegram.sendMessage(
              userId,
              `Обработана еще одна ошибка вылета.`,
              Extra.markup(Markup.keyboard([["/start"]]).resize())
            );
          } 
        } catch (e) {
          console.log(
            "Сообщение не было доставлено. Пользователь заблокировал бота.",
            userId
          );
        }
      }
    }
  });

  // 364984576🌵
  // 727186107
}

// Exports
module.exports = setupMailing;
