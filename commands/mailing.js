const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");

async function setupMailing(bot) {
  const users = await User.find()
  
  bot.command('replyAllMsg', async ctx => {
    for(let {userId} of users) {
      bot.telegram.sendMessage(userId, 'Были исправлены кнопки "Сеогдня" и "Завтра".')
      ctx.scene.enter('showMainMenu')
    }
  })
}

// Exports
module.exports = setupMailing;
