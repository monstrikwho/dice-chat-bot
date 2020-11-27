const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");

async function setupMailing(bot) {
  const users = await User.find();

  let arrUsersId = users.map((item) => item.userId);

  bot.command("replyMsg", async (ctx) => {
    const msg = ctx.update.message.text.replace("/replyMsg ", "");

    if (ctx.chat.id === 364984576) {
      for (let userId of arrUsersId) {
        try {
          await bot.telegram.sendMessage(
            userId,
            msg,
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
