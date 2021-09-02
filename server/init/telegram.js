const { Api, TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");

const { bot } = require("./startBot");
const Banker = require("../models/banker");
const User = require("../models/user");

const apiId = 7548033;
const apiHash = "eb38dcae569b88f3ad6d6cdc9fd97038";
const stringSession = new StringSession(
  "1AQAOMTQ5LjE1NC4xNjcuNTEAUF3T4erW+NsMWeAPcbE4tKMyzPRiaco+WXLBZ06LyMzzUANxrQ0eCgqH4AlHH2NcwgXcAT0mpH/g8zDoRyIWJmdg0Ff6U0tmyGS5amunCQ6lV0zFeEWNWKNLIpSwRUpnV4K6jPIMLav0ey0ojM1d9viPARs/1AVtkfoFa21NNAxGaC7TE/OO0JivlU30sjvIoocvPKs7EOPfwp7dcTDXVQrVZHhAEnVgLbxkTGmaCuQ0k7iDstrsO5pqz/Oqt+6t+ZJTtLOcdp9zYY2Dehf8646y6fyi6lp/3v8fF/EydiXFBrd8S/7GA7v2344geh2FjMpLIHU31oBxSSpALoqffAQ="
);

const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
});

(async function run() {
  await client.connect();

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
