const Telegraf = require("telegraf");
const Error = require("../models/errors");

const bot = new Telegraf(process.env.TOKEN, {
  channelMode: true,
});

// Start bot
async function startBot() {
  try {
    await bot.telegram.callApi("getUpdates", { offset: -1 });
    await bot.startPolling();
    console.info("Bot is up and running");
  } catch (error) {
    const err = new Error({
      message: error.message,
      err: error,
    });
    await err.save();
  }
}

// Export bot
module.exports = { bot, startBot };
