const Telegraf = require("telegraf");

const bot = new Telegraf(process.env.TOKEN, {
  channelMode: true,
});

// Start bot
async function startBot() {
  await bot.startPolling();
  console.info("Bot is up and running");
}

// Export bot
module.exports = { bot, startBot };
