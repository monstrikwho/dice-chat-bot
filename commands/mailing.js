const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");
const Setting = require("../models/setting");

async function setupMailing(bot) {
  const users = await User.find();

  let arrUsersId = users.map((item) => item.userId);

  bot.command("replyMsg", async (ctx) => {
    if (ctx.chat.id === 364984576) {
      const msg = ctx.update.message.text.replace("/replyMsg ", "");

      let countBlocked = 0;

      for (let userId of arrUsersId) {
        try {
          await bot.telegram.sendMessage(
            userId,
            msg,
            Extra.markup(Markup.keyboard([["/start"]]).resize())
          );
        } catch (err) {
          countBlocked++;
          await User.updateOne({ userId }, { isBlocked: true });
        }
      }

      await Setting.updateOne({}, { countBlocked });

      return await ctx.reply(`Кол-во заблокировавших бот: ${countBlocked}`);
    }
  });
}

// Exports
module.exports = setupMailing;
