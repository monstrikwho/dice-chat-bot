const Telegraf = require("telegraf");

const token = !Boolean(+process.env.DEV)
  ? process.env.TOKEN_MAIN
  : process.env.TOKEN_TEST;

const bot = new Telegraf(token, {
  channelMode: true,
});

async function startBot() {
  try {
    await bot.telegram.callApi("getUpdates", {
      offset: -1,
    });
    await bot.telegram.callApi("getUpdates", {
      allowed_updates: [
        "update_id",
        "message",
        "edited_message",
        "channel_post",
        "edited_channel_post",
        "inline_query",
        "chosen_inline_result",
        "callback_query",
        "shipping_query",
        "pre_checkout_query",
        "poll",
        "poll_answer",
        "my_chat_member",
        "chat_member",
      ],
    });
    await bot.startPolling();
    console.info("Bot is up and running");
  } catch (error) {}
}

module.exports = { bot, startBot };
