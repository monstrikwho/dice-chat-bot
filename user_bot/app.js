require("dotenv").config();

const { Api, TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");
const random = require("random-bigint");
const isNumber = require("is-number");

require("./init/setupMongoose");
const Banker = require("./models/banker");

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

  let order = await Banker.findOne({ status: "pending" });

  const peerSelf = new Api.InputPeerSelf();
  console.log(peerSelf)
  setInterval(async () => {
    if (!order) return;

    const { status, code } = await Banker.findOne({ code: order.code });
    if (status === "pending") {
      const peerSelf = new Api.InputPeerSelf();
      await client.invoke(
        new Api.messages.StartBot({
          bot: "BTC_CHANGE_BOT",
          peer: peerSelf,
          randomId: random(128),
          startParam: code,
        })
      );
    }

    if (status !== "pending") {
      order = await Banker.findOne({ status: "pending" });
    }
  }, 10000);

  client.addEventHandler(eventPrint);
  async function eventPrint(event) {
    if (event.className === "UpdateNewMessage") {
      if (event.message.peerId.userId === 159405177) {
        const message = event.message.message;

        if (message.match(/This cheque has already been cashed/)) {
          await Banker.updateOne({ code: order.code }, { status: "error" });
          console.log(message);
        }
        if (
          message.indexOf("You got") !== -1 &&
          message.indexOf("RUB) from") !== -1
        ) {
          const amount = +message.split("(")[1].split(" RUB)")[0];
          await Banker.updateOne(
            { code: order.code },
            { status: "succes", amount }
          );
          console.log(message);
        }
      }
    }
  }
})();
