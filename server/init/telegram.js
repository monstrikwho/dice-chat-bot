const { Api, TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");

const { bot } = require("./startBot");
const Banker = require("../models/banker");
const User = require("../models/user");

const apiId = 7548033;
const apiHash = "eb38dcae569b88f3ad6d6cdc9fd97038";
const stringSession = new StringSession("");

const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
});

(async function run() {
  await client.start({
    phoneNumber: async () => await input.text("Please enter your number: "),
    password: async () => await input.text("Please enter your password: "),
    phoneCode: async () =>
      await input.text("Please enter the code you received: "),
    onError: (err) => console.log(err),
  });

  client.addEventHandler(eventPrint);
  async function eventPrint(event) {
    if (event.className === "UpdateShortMessage") {
      const message = event.message;

      if (message.match(/You got/)) {
        const msgarr = await client.invoke(
          new Api.messages.GetMessages({
            channel: "BTC_CHANGE_BOT",
            id: [event.id, event.id - 1, event.id - 2, event.id - 3],
          })
        );

        const code = msgarr.messages;
        const amount = +message
          .split("(")[1]
          .split(" RUB)")[0]
          .replace(" RUB)", "")
          .replace(",", ".");

        for (let { message } of code) {
          const status = await Banker.findOne({ code: message });
          if (status) {
            await Banker.updateOne(
              { code: status.code },
              { status: "succes", amount }
            );
            const user = await User.findOne({ userId: status.userId });
            await User.updateOne(
              { userId: status.userId },
              { mainBalance: +(user.mainBalance + amount).toFixed(2) }
            );
            await bot.telegram.sendMessage(
              status.userId,
              `Чек успешно обналичен, на ваш счет было начислено ${amount} P
Ваш баланс: ${+(user.mainBalance + amount).toFixed(2)} P`
            );
          }
        }
      }
    }

    if (event.className === "UpdateNewMessage") {
      if (event.message.peerId.userId === 159405177) {
        const result = await client.invoke(
          new Api.messages.GetMessages({
            channel: "BTC_CHANGE_BOT",
            id: [
              event.message.id - 4,
              event.message.id - 3,
              event.message.id - 2,
              event.message.id - 1,
            ],
          })
        );

        const code = result.messages;
        const message = event.message.message;

        if (message.match(/This cheque has already been cashed/)) {
          for (let { message } of code) {
            const status = await Banker.findOne({ code: message });
            if (status) {
              await Banker.updateOne(
                { code: status.code },
                { status: "error" }
              );
              await bot.telegram.sendMessage(
                status.userId,
                "Этот чек уже был обналичен"
              );
            }
          }
        }
      }
    }
  }
})();

module.exports = { client, Api };
