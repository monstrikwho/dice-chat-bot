const Telegraf = require("telegraf");

const bot = new Telegraf(process.env.TOKEN, {
  channelMode: true,
});

async function startBot() {
  try {
    await bot.telegram.callApi("getUpdates", { offset: -1 });
    await bot.startPolling();
    console.info("Bot is up and running");
  } catch (error) {}
}

module.exports = { bot, startBot };
