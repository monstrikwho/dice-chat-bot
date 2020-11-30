const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");
const Setting = require("../models/setting");

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
          await User.findOne({ userId: ctx.from.id }, { isBlocked: false });
        } catch (err) {
          try {
            await User.findOne({ userId: ctx.from.id }, { isBlocked: true });
            await Setting.findOne({}, { $inc: { countBlocked: 1 } });
          } catch (error) {
            console.log("не удалось посчитать кол-во заблокирвоваших.");
          }
        }
      }
    }
  });
}

// Exports
module.exports = setupMailing;
