const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");

async function setupMailing(bot) {
  const users = await User.find();

  bot.command("replyAllMsg", async (ctx) => {
    for (let { userId } of users) {
      bot.telegram.sendMessage(
        userId,
        'Для тех, кто не написал /start (сервер был перезапущен)',
        Extra.markup(Markup.keyboard([["🔄 Update"]]).resize())
      );
    }
  });
  // 364984576
}

// Exports
module.exports = setupMailing;
