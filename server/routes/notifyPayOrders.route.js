const { Router } = require("express");
const router = Router();
const { bot } = require("../init/startBot");

const User = require("../models/user");
const Order = require("../models/order");
const MainStats = require("../models/mainstats");

const fs = require("fs");
const moment = require("moment");
const nodeHtmlToImage = require("node-html-to-image");

router.post("/", async (req, res) => {
  try {
    processing(req.body);
  } catch (error) {}
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

  if (status === "ERROR") {
    try {
      await bot.telegram.sendMessage(
        comment,
        `Платеж №${txnId} не был завершен. Пожалуйста, свяжитесь с поддержкой, для уточнения статуса операции. 
Поддержка: @LuckyCatGames`
      );
      await Users.updateOne({ comment }, { $inc: { mainBalance: amount } });
      await bot.telegram.sendMessage(
        comment,
        `Возврат удержанной суммы: ${amount}P`
      );
    } catch (error) {
      console.log("Ошибка в платеже, error");
    }
    return;
  }

  if (status === "WAITING") {
    try {
      await bot.telegram.sendMessage(
        comment,
        `Ваш платеж №${txnId} принят на обработку. Пожалуйста подождите.`
      );
    } catch (error) {
      console.log("Ошибка в платежах, waiting");
    }
    return;
  }

  if (status === "SUCCESS") {
    // Сохраняем нужную о платеже в БД
    const order = new Order({
      txnId,
      type,
      amount,
      comment,
      account,
      date,
    });
    await order.save();
    try {
      if (type === "IN") return inCash(txnId, amount, comment);
      if (type === "OUT") return outCash(txnId, amount, comment, provider);
    } catch (error) {
      console.log("Ошибка в платежах, success");
    }
  }
}

//

// ************************ IN ********************************
async function inCash(txnId, amount, userId) {
  const user = await User.findOne({ userId });
  if (!user) return;

  const { bonusRefPercent, usersStats } = await MainStats.findOne({});

  await MainStats.updateOne(
    {},
    {
      $inc: {
        "orderStats.amountInMoney": amount,
        "orderStats.countInOrder": 1,
      },
      "usersStats.donaters":
        usersStats.donaters.indexOf(userId.toString()) === -1
          ? [...usersStats.donaters, userId]
          : usersStats.donaters,
    }
  );

  if (user.isRef !== 0) {
    // Начисляем процент пополениня пригласившему реферала
    await User.updateOne(
      { userId: user.isRef },
      {
        $inc: {
          mainBalance: +((amount * bonusRefPercent) / 100).toFixed(2),
          refCash: +((amount * bonusRefPercent) / 100).toFixed(2),
        },
      }
    );
    // Отправляем сообщение пригласившему
    try {
      await bot.telegram.sendMessage(
        user.isRef,
        `На ваш ОСНОВНОЙ счет было зачисленно ${(
          (amount * bonusRefPercent) /
          100
        ).toFixed(2)}₽ за приглашенного вами реферала.
Номер платежа: ${txnId}`
      );
    } catch (error) {}
  }

  // Начисляем сумму для пользователя
  await User.updateOne({ userId }, { $inc: { mainBalance: amount } });
  try {
    await bot.telegram.sendMessage(
      userId,
      `На ваш баланс было зачисленно ${amount}₽.
Ваш текущий баланс: ${user.mainBalance + amount}

Номер платежа: ${txnId}`
    );
  } catch (error) {}

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
      await bot.telegram.sendPhoto(
        "-1001352899773",
        {
          source: `./images/${txnId}.png`,
        },
        { caption: `UID: ${userId}` }
      );
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

  await MainStats.updateOne(
    {},
    {
      "orderStats.lastNumberOrder": txnId,
      $inc: {
        "orderStats.amountOutMoney": amount,
        "orderStats.countOutOrder": 1,
      },
    }
  );

  // Отправляем юзеру, что платеж был обработан
  await bot.telegram.sendMessage(
    userId,
    `Платеж был успешно обработан.
Ваш текущий баланс: ${user.mainBalance}.

Номер платежа: ${txnId}`
  );

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
        <div class="number-order">
          <div class="name">UID:</div>
          <div class="no">${userId}</div>
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
