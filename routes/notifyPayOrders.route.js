const { Router } = require("express");
const router = Router();

const { bot } = require("../init/startBot");
const User = require("../models/user");
const Order = require("../models/order");

const fs = require("fs");
const axios = require("axios");
const moment = require("moment");
const nodeHtmlToImage = require("node-html-to-image");

router.post("/", async (req, res) => {
  try {
    processing(req.body);
  } catch (error) {
    console.log("Ошибка в платежах");
  }
  res.status(200).end();
});

// Обработка уведомления
async function processing(data) {
  // const hash = data.hash;
  // const msgId = data.messageId;
  // const signFields = data.payment.signFields;
  const account = data.payment.account;
  const txnId = data.payment.txnId; // ID транзакции в процессинге QIWI Wallet
  const date = moment().format("YYYY-MM-DD"); // '2021-01-16'
  const type = data.payment.type; // 'IN' or 'OUT'
  const status = data.payment.status; // 'WAITING', 'SUCCESS', 'ERROR'
  const comment = data.payment.comment; // '20345802785' <-- id users
  const provider = data.payment.provider; // 'WAITING', 'SUCCESS', 'ERROR'
  const amount = data.payment.sum.amount; // number

  // Сохраняем нужную о платеже в БД
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
        `Платеж №${txnId} не был завершен. Пожалуйста, свяжитесь с поддержкой, для уточнения статуса операции. 
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
        `Ваш платеж №${txnId} принят на обработку. Пожалуйста подождите.`
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

//

// ************************ IN ********************************

// CONSTANT
const firstPercent = 7;
const lastPercent = 5;
//

async function inCash(txnId, amount, userId) {
  const user = await User.findOne({ userId });
  if (!user) return;

  let percent = lastPercent;

  if (user.isRef !== 1) {
    // Проверяем первый ли платеж и меняем процент, если он первый
    const statusFirstPay = await Order.findOne({ comment: userId });
    if (!statusFirstPay) percent = firstPercent;

    // Начисляем процент пополениня пригласившему реферала
    await User.updateOne(
      { userId: user.isRef },
      {
        $inc: {
          mainBalance: Math.floor(((amount * percent) / 100) * 100) / 100,
        },
      }
    );

    // Отправляем сообщение пригласившему
    await bot.telegram.sendMessage(
      user.isRef,
      `На ваш баланс было начисленно ${
        (amount * percent) / 100
      }₽ за приглашенного вами реферала.
Номер платежа: ${txnId}`
    );
  }

  // Начисляем сумму для пользователя
  await User.updateOne({ userId }, { $inc: { mainBalance: amount } });
  await bot.telegram.sendMessage(
    userId,
    `На ваш баланс было начисленно ${amount}₽.
Ваш текущий баланс: ${user.mainBalance + amount}

Номер платежа: ${txnId}`
  );

  // Send stats
  await axios
    .post("https://dice-bots.ru/api/post_stats", {
      type: "payments",
      data: {
        amount,
        typeOrder: "IN",
        txnId,
        date: moment().format("YYYY-MM-DD"),
      },
    })
    .then((res) => console.log(res))
    .catch((e) => console.log(e));

  // Отпарвляем photo ордерa в паблик
  await nodeHtmlToImage({
    output: `./images/${txnId}.png`,
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
        padding-top: 20px;
        width: 400px;
        height: 220px;
      }

      .card {
        position: relative;
        border-radius: 10px;
        box-shadow: 1px 2px 32px rgba(12, 12, 12, 0.2);
        background-color: #1c1c1e;
        color: #fff;
      }
      
      .title {
        padding: 10px;
        font-size: 18px;
        text-align: center;
        background-color: #2c2c2e;
        border-radius: 10px 10px 0 0;
        color: #2dbf65;
      }
      
      .date {
        padding: 10px;
        display: flex;
        justify-content: space-between;
      }
      
      .number-order {
        padding: 10px;
        display: flex;
        justify-content: space-between;
      }
      
      .amount {
        padding: 30px 0;
        text-align: center;
        font-size: 32px;
      }
    </style>
    </head>
    <body>
      <div class="card">
        <div class="title">Операция проведена успешно</div>
        <div class="date">
          <div class="name">Дата</div>
          <div class="time">${moment().format("HH:mm DD.MM.YYYY")}</div>
        </div>
        <div class="number-order">
          <div class="name">Номер транзакции:</div>
          <div class="no">${txnId}</div>
        </div>
        <div class="amount">${amount}P</div>
      </div>
    </body>
    </html>`,
    puppeteerArgs: {
      args: ["--no-sandbox", "--user-data-dir"],
    },
  })
    .then(async () => {
      await bot.telegram.sendPhoto("-1001352899773", {
        source: `./images/${txnId}.png`,
      });
      fs.unlinkSync(`./images/${txnId}.png`);
    })
    .catch(async (err) => {
      console.log(err.message);
    });
}

//

// ***************************** OUT ***************************************

async function outCash(txnId, amount, userId, provider) {
  const user = await User.findOne({ userId });
  if (!user) return;

  // Считаем комиссию
  let commission = 0;
  if (provider === 1963 || provider === 21013) {
    commission = 50 + amount * 0.02;
  }
  if (provider === 1960 || provider === 21012) {
    commission = 100 + amount * 0.02;
  }

  // Обнавляем баланс в базе данных
  await User.updateOne(
    { userId },
    {
      mainBalance:
        Math.floor((user.mainBalance - amount - commission) * 100) / 100,
    }
  );

  // Отправляем юзеру, что платеж был обработан
  await bot.telegram.sendMessage(
    userId,
    `С вашего баланса было списано ${amount + commission}₽.
Ваш текущий баланс: ${
      Math.floor((user.mainBalance - amount - commission) * 100) / 100
    }.

Номер платежа: ${txnId}`
  );

  // Send stats
  await axios
    .post("https://dice-bots.ru/api/post_stats", {
      type: "payments",
      data: {
        amount: amount + commission,
        typeOrder: "OUT",
        txnId,
        date: moment().format("YYYY-MM-DD"),
      },
    })
    .then((res) => console.log(res))
    .catch((e) => console.log(e));

  // Отпарвляем photo ордерa в паблик
  await nodeHtmlToImage({
    output: `./images/${txnId}.png`,
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
        padding-top: 20px;
        width: 400px;
        height: 220px;
      }

      .card {
        position: relative;
        border-radius: 10px;
        box-shadow: 1px 2px 32px rgba(12, 12, 12, 0.2);
        background-color: #1c1c1e;
        color: #fff;
      }
      
      .title {
        padding: 10px;
        font-size: 18px;
        text-align: center;
        background-color: #2c2c2e;
        border-radius: 10px 10px 0 0;
        color: #2dbf65;
      }
      
      .date {
        padding: 10px;
        display: flex;
        justify-content: space-between;
      }
      
      .number-order {
        padding: 10px;
        display: flex;
        justify-content: space-between;
      }
      
      .amount {
        padding: 30px 0;
        text-align: center;
        font-size: 32px;
      }
    </style>
    </head>
    <body>
      <div class="card">
        <div class="title">Операция проведена успешно</div>
        <div class="date">
          <div class="name">Дата</div>
          <div class="time">${moment().format("HH:mm DD.MM.YYYY")}</div>
        </div>
        <div class="number-order">
          <div class="name">Номер транзакции:</div>
          <div class="no">${txnId}</div>
        </div>
        <div class="amount">${amount}P</div>
      </div>
    </body>
    </html>`,
    puppeteerArgs: {
      args: ["--no-sandbox", "--user-data-dir"],
    },
  })
    .then(async () => {
      await bot.telegram.sendPhoto("-1001483381769", {
        source: `./images/${txnId}.png`,
      });
      fs.unlinkSync(`./images/${txnId}.png`);
    })
    .catch(async (err) => {
      console.log(err.message);
    });
}

module.exports = router;
