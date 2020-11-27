const { bot } = require("../init/startBot");
const User = require("../models/user");
const Order = require("../models/order");
const Cardorders = require("../models/cardOrder");

const express = require("express");
const app = express();
app.use(express.json());

app.post("/notify_pay_orders", (req, res) => {
  try {
    processing(req.body);
  } catch (error) {
    console.log("Ошибка в платежах");
  }

  res.status(200).end();
});

async function processing(data) {
  const hash = data.hash;
  const msgId = data.messageId;
  const account = data.payment.account;
  const comment = data.payment.comment;
  const signFields = data.payment.signFields;
  const status = data.payment.status; // 'WAITING', 'SUCCESS', 'ERROR'
  const provider = data.payment.provider; // 'WAITING', 'SUCCESS', 'ERROR'
  const sum = data.payment.sum; // {amount: 12, currency: 643}
  const txnId = data.payment.txnId; // ID транзакции в процессинге QIWI Wallet
  const type = data.payment.type; // 'IN' or 'OUT'

  const toHashStr = `${sum.currency}|${sum.amount}|${type}|${account}|${txnId}`;

  const order = new Order({ orderId: txnId, data });
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
        `Платеж находится в обработке. Пожалуйста, свяжитесь с поддержкой, для уточнения статуса операции. 
  Поддержка: @LuckyCatGames`
      );
    } catch (error) {
      return console.log("Ошибка в платежах, waiting");
    }
  }
  if (status === "SUCCESS") {
    try {
      if (type === "IN") return inCash(sum.amount, comment);
      // if (type === "OUT") return outCash(sum.amount, account, provider);
    } catch (error) {
      return console.log("Ошибка в платежах, success");
    }
  }
}

async function inCash(amount, userId) {
  const user = await User.findOne({ userId });
  if (!user) return;

  await User.updateOne({ userId }, { mainBalance: user.mainBalance + amount });
  await bot.telegram.sendMessage(
    userId,
    `На ваш баланс было начисленно ${amount}P.
Ваш текущий баланс: ${user.mainBalance + amount}`
  );
}

async function outCash(amountInfo, account, provider) {
  const card4 = account.split("").slice(12, 16).join('')
  console.log(card4);
  const card = await Cardorders.findOne({ card: card4 });
  const { userId, amount, idProvider } = await User.findOne({ userId });

  if (card && amount === amountInfo && provider === idProvider) {
    console.log("rtwd");
    const user = await User.findOne({ userId });
    await User.updateOne(
      { userId },
      { mainBalance: user.mainBalance - amount }
    );
    await bot.telegram.sendMessage(
      userId,
      `С вашего баланса было списано ${amount}P.
  Ваш текущий баланс: ${user.mainBalance - amount}`
    );
  }
}

async function startRoutes() {
  try {
    app.listen(process.env.PORT, () =>
      console.log(`Express has been started on port ${process.env.PORT}...`)
    );
  } catch (e) {
    console.log("Server Error", e.message);
    process.exit(1);
  }
}

module.exports = { app, startRoutes };
