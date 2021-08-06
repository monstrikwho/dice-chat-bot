const Telegraf = require("telegraf");
// const { telegrafThrottler } = require("telegraf-throttler");

const TOKEN =
  process.env.DEV === "true" ? process.env.TOKEN_TEST : process.env.TOKEN_MAIN;

const bot = new Telegraf(TOKEN, {
  channelMode: true,
});

// const throttler = telegrafThrottler({
//   in: {
//     highWater: 0,
//     maxConcurrent: 1,
//     minTime: 300,
//   },
//   inKey: "from",
// });
// bot.use(throttler);

async function startBot() {
  await bot.telegram.callApi("getUpdates", { offset: -1 });
  await bot.startPolling();
  console.info("Bot is up and running");
}

module.exports = { bot, startBot };
