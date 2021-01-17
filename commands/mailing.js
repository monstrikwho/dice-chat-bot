const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");

async function setupMailing(bot) {
  bot.command("replyMsg", async (ctx) => {
    if (ctx.chat.id === 364984576) {
      const msg = ctx.update.message.text.replace("/replyMsg ", "");

      const users = await User.find({ isBlocked: false });
      let arrUsersId = users.map((item) => item.userId);

      await ctx.reply(
        `Рассылка началась. Пожлауйста подождите, пока она завершится. (Вам придет сообщение.)`
      );

      for (let userId of arrUsersId) {
        try {
          await bot.telegram.sendMessage(
            userId,
            msg,
            Extra.markup(Markup.keyboard([["/start"]]).resize())
          );
        } catch (err) {}
      }

      return await ctx.reply(`Рассылка завершена.`);
    }
  });
}

// Exports
module.exports = setupMailing;
