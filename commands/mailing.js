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
            const setting = await Setting.findOne({});
            await Setting.findOne(
              {},
              { countBlocked: setting.countBlocked + 1 }
            );
          } catch (error) {
            console.log("не удалось посчитать кол-во заблокирвоваших.");
          }
        }
      }

      await ctx.scene.enter("showMainMenu");
    }
  });
}

// Exports
module.exports = setupMailing;
