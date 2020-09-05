// Dependencies
const Telegraf = require("telegraf");
const { v4: uuid } = require("uuid");

const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");

// Create bot
const bot = new Telegraf(process.env.TOKEN, {
  channelMode: true,
});
bot.webhookReply = false;
// Get bot's username
bot.telegram
  .getMe()
  .then((info) => {
    bot.options.username = info.username;
  })
  .catch(console.info);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.MONGO_PORT || 5000;

// Start bot
async function startBot() {
  // Start bot
  if (process.env.USE_WEBHOOK === "true") {
    const domain = process.env.WEBHOOK_DOMAIN;
    await bot.telegram
      .deleteWebhook()
      .then(async () => {
        const secretPath = uuid();
        await bot.startWebhook(`/${secretPath}`, undefined, 5000);
        await bot.telegram.setWebhook(
          `https://${domain}/${secretPath}`,
          undefined,
          100
        );
        const webhookInfo = await bot.telegram.getWebhookInfo();
        console.info("Bot is up and running with webhooks", webhookInfo);
      })
      .catch((err) => console.info("Bot launch error", err));
  } else {
    await bot.telegram
      .deleteWebhook()
      .then(async () => {
        await bot.startPolling();
        console.info("Bot is up and running");
      })
      .catch((err) => console.info("Bot launch error", err));
  }

  // Start mongo server
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
  app.listen(PORT, () =>
    console.log(
      `\x1b[32m`,
      `App has been started on port ${PORT}...`,
      `\x1b[0m`
    )
  );
}

// Export bot
module.exports = { bot, startBot };
