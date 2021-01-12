const { Router } = require("express");
const router = Router();

const { bot } = require("../init/startBot");
const User = require("../models/user");
const Order = require("../models/order");

const fs = require("fs");
const nodeHtmlToImage = require("node-html-to-image");

router.post("/", async (req, res) => {
  try {
    processing(req.body);
  } catch (error) {
    console.log("Ошибка в платежах");
  }

  res.status(200).end();
});

async function processing(data) {
  // const hash = data.hash;
  // const msgId = data.messageId;
  // const signFields = data.payment.signFields;
  const account = data.payment.account;
  const txnId = data.payment.txnId; // ID транзакции в процессинге QIWI Wallet
  const date = data.payment.date; // '2020-11-27T20:17:07+03:00'
  const type = data.payment.type; // 'IN' or 'OUT'
  const status = data.payment.status; // 'WAITING', 'SUCCESS', 'ERROR'
  const comment = data.payment.comment; // '20345802785' <-- id users
  const provider = data.payment.provider; // 'WAITING', 'SUCCESS', 'ERROR'
  const amount = data.payment.sum.amount; // number

  const order = new Order({
    txnId,
    type,
    status,
    amount,
    comment,
    account,
    date,
  });
  await order.save();

  if (status === "ERROR") {
    try {
      return await bot.telegram.sendMessage(
        comment,
        `Платеж не был завершен. Пожалуйста, свяжитесь с поддержкой, для уточнения статуса операции. 
Поддержка: @LuckyCatGames`
      );
    } catch (error) {
      return console.log("Ошибка в платеже, error");
    }
  }

  if (status === "WAITING") {
    try {
      return await bot.telegram.sendMessage(
        comment,
        `Ваш платеж принят на обработку. Пожалуйста подождите.`
      );
    } catch (error) {
      return console.log("Ошибка в платежах, waiting");
    }
  }

  if (status === "SUCCESS") {
    try {
      if (type === "IN") return inCash(txnId, amount, comment);
      if (type === "OUT") return outCash(txnId, amount, comment, provider);
    } catch (error) {
      return console.log("Ошибка в платежах, success");
    }
  }
}

async function inCash(txnId, amount, userId) {
  const user = await User.findOne({ userId });
  if (!user) return;

  await User.updateOne({ userId }, { mainBalance: user.mainBalance + amount });
  await bot.telegram.sendMessage(
    userId,
    `На ваш баланс было начисленно ${amount}₽.
Ваш текущий баланс: ${user.mainBalance + amount}

Номер платежа: ${txnId}`
  );

  // Отпарвляем photo ордерa в паблик
  await nodeHtmlToImage({
    output: `../images/${txnId}.png`,
    html: `<html><head>
    <style>
      * {
        padding: 0;
        margin: 0;
      }

      html {
        width: 400px;
      }

      body {
        padding: 10px;
        padding-top: 40px;
        width: 400px;
        height: 220px;
      }

      .status {
        height: 60px;
        width: 60px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        left: calc(50% - 30px);
        top: -30px;
        font-size: 28px;
        background-color: #fff;
        border-radius: 50%;
        box-shadow: 1px 2px 32px rgba(12, 12, 12, 0.2);
      }

      .nav {
        padding-top: 40px;
        padding-bottom: 20px;
        font-size: 26px;
        text-align: center;
        background-color: #42f581;
        border-radius: 10px;
      }

      .amount {
        padding: 30px 0;
        text-align: center;
        font-size: 32px;
      }

      .desc {
        padding-right: 15px;
        padding-bottom: 5px;
        font-size: 14px;
        color: #b5acac;
        text-align: right;
      }

      .card {
        position: relative;
        border-radius: 10px;
        box-shadow: 1px 2px 32px rgba(12, 12, 12, 0.2);
      }
    </style>
    </head><body>
      <div class="card">
        <div class="status">👌</div>
        <div class="nav">
          <div class="title">Пополнение на сумму</div>
          </div>
        <div class="amount">${amount} ₽</div>
        <div class="desc">
          <div class="number-order">no: ${txnId}</div>
        </div>
      </div>
    </body></html>`,
    puppeteerArgs: {
      args: ["--no-sandbox", "--user-data-dir"],
    },
  })
    .then(async () => {
      await bot.telegram.sendPhoto("-1001352899773", {
        source: `../images/${txnId}.png`,
      });
      fs.unlinkSync(`../images/${txnId}.png`);
    })
    .catch(async (err) => {
      console.log(err.message);
    });
}

async function outCash(txnId, amount, userId, provider) {
  const user = await User.findOne({ userId });
  if (!user) return;

  let providerTxt = "Перевод на кошелек QIWI";

  // Считаем комиссию
  let commission = 0;
  if (provider === 1963 || provider === 21013) {
    commission = 50 + amount * 0.02;
    providerTxt = "Перевод на карту";
  }
  if (provider === 1960 || provider === 21012) {
    commission = 100 + amount * 0.02;
    providerTxt = "Перевод на карту";
  }

  // Обнавляем баланс в базе данных
  await User.updateOne(
    { userId },
    { mainBalance: user.mainBalance - amount - commission }
  );

  // Отправляем юзеру, что платеж был обработан
  await bot.telegram.sendMessage(
    userId,
    `С вашего баланса было списано ${amount + commission}₽.
Ваш текущий баланс: ${user.mainBalance - amount - commission}.

Номер платежа: ${txnId}`
  );

  // Отпарвляем photo ордерa в паблик
  await nodeHtmlToImage({
    output: `../images/${txnId}.png`,
    html: `<html><head>
    <style>
      * {
        padding: 0;
        margin: 0;
      }
      
      html {
        width: 400px;
      }
      
      body {
        padding: 10px;
        padding-top: 40px;
        width: 400px;
        height: 220px;
      }
      
      .status {
        height: 60px;
        width: 60px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        left: calc(50% - 30px);
        top: -30px;
        font-size: 28px;
        background-color: #fff;
        border-radius: 50%;
        box-shadow: 1px 2px 32px rgba(12, 12, 12, 0.2);
      }
      
      .nav {
        padding-top: 40px;
        padding-bottom: 20px;
        font-size: 26px;
        text-align: center;
        background-color: #42f581;
        border-radius: 10px;
      }
      
      .amount {
        padding: 30px 0;
        text-align: center;
        font-size: 32px;
      }
      
      .desc {
        padding-right: 15px;
        padding-bottom: 5px;
        font-size: 14px;
        color: #b5acac;
        text-align: right;
      }
      
      .card {
        position: relative;
        border-radius: 10px;
        box-shadow: 1px 2px 32px rgba(12, 12, 12, 0.2);
      }
    </style>
    </head><body>
      <div class="card">
        <div class="status">👌</div>
        <div class="nav">
          <div class="title">${providerTxt}</div>
          </div>
        <div class="amount">${amount} ₽</div>
        <div class="desc">
          <div class="number-order">no: ${txnId}</div>
        </div>
      </div>
    </body></html>`,
    puppeteerArgs: {
      args: ["--no-sandbox", "--user-data-dir"],
    },
  })
    .then(async () => {
      await bot.telegram.sendPhoto("-1001483381769", {
        source: `../images/${txnId}.png`,
      });
      fs.unlinkSync(`../images/${txnId}.png`);
    })
    .catch(async (err) => {
      console.log(err.message);
    });
}

module.exports = router;
