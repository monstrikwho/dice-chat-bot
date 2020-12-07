const { bot } = require("../init/startBot");
const User = require("../models/user");
const Order = require("../models/order");

const express = require("express");
const app = express();
app.use(express.json());

app.get("/get_users", require("../routes/getUsers.route"));
app.get("/get_payments", require("../routes/getPayments.route"));

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
        `Платеж находится в обработке. 
Вы можете связаться с поддержкой, для уточнения статуса операции. 
Поддержка: @LuckyCatGames`
      );
    } catch (error) {
      return console.log("Ошибка в платежах, waiting");
    }
  }
  if (status === "SUCCESS") {
    try {
      if (type === "IN") return inCash(sum.amount, comment);
      if (type === "OUT") {
        await bot.telegram.sendPhoto(
          "-1001131292932",
          "AgACAgIAAxkBAAICdF_OgOaB0VZhVzajzMwQtp2fJQj7AAKlsTEb68F5SoCKa9Z7Qs_uWS5EmC4AAwEAAwIAA3kAA5cRBAABHgQ"
        );
        await bot.telegram.sendMessage(
          "-1001131292932",
          `Пользователь ${comment} только что вывел выигрыш на сумму ${sum.amount} P.`
        );
        return outCash(sum.amount, comment, provider);
      }
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

async function outCash(amount, userId, provider) {
  const user = await User.findOne({ userId });
  if (!user) return;

  let commission = 0;
  if (provider === 1963 || provider === 21013) {
    commission = 50 + amount * 0.02;
  }
  if (provider === 1960 || provider === 21012) {
    commission = 100 + amount * 0.02;
  }

  await User.updateOne(
    { userId },
    { mainBalance: user.mainBalance - amount - commission }
  );
  await bot.telegram.sendMessage(
    userId,
    `С вашего баланса было списано ${amount + commission}P.
Ваш текущий баланс: ${user.mainBalance - amount - commission}`
  );
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
