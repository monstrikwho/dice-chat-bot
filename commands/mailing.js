const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");
const User2 = require("../models/userSingUp");

async function setupMailing(bot) {
  const users = await User.find();
  const users2 = await User2.find();

  let arrId1 = users.map((item) => item.userId);
  let arrId2 = users2.map((item) => item.userId);

  bot.command("replyMsg", async (ctx) => {
    if (ctx.chat.id === 364984576) {
      for (let userId of arrId1) {
        try {
          await bot.telegram.sendMessage(
            userId,
            "Вот сейчас, вроде бы, должно прийти сообщение об выходе расписание на следующую неделю. Также исправлены некоторые ошибки.",
            Extra.markup(Markup.keyboard([["/start"]]).resize())
          );
        } catch (err) {
          console.log("Cообщение не было доставлено");
        }
      }
    }
  });

  bot.command("replyUpdate", async (ctx) => {
    if (ctx.chat.id === 364984576) {
      const uniq = [...new Set(arrId2)];
      const mapList = {};
      const notStart = [];

      console.log(uniq.length);

      for (let userId of uniq) {
        mapList[userId] = userId;
      }

      for (let userId of arrId1) {
        if (mapList[userId]) {
          delete mapList[userId];
        }
      }

      for (const [key, value] of Object.entries(mapList)) {
        notStart.push(key);
      }

      for (let userId of notStart) {
        try {
          await bot.telegram.sendMessage(
            userId,
            "Привет. Вы думали что бот перестал работать? А вот и нет. Вы должны понимать, что это исследовательская работа, и я все ошибки не могу отловить сразу. Поэтому мне приходится выпускать новые функции с ошибками, которые вы потом находите, которые я потом решаю и после вы получаете сообщение о перезапуске сервера. Только так этот бот уже стал почти завершенным проектом. Всем спасибо, обнял 🌵",
            Extra.markup(Markup.keyboard([["/start"]]).resize())
          );
        } catch (err) {
          console.log("Cообщение не было доставлено");
        }
      }
    }
  });

  // 364984576🌵
  // 727186107
}

// Exports
module.exports = setupMailing;
