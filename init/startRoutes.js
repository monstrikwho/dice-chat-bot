const express = require("express");
const { bot } = require("../init/startBot");

const app = express();
app.use(express.json());

app.post("/verify_pay", (req, res) => {
  processing(req.body);
  res.status(200).end();
});

function processing(data) {
  const hash = data.hash;
  const msgId = data.messageId;
  const account = data.payment.account;
  const comment = data.payment.comment;
  const signFields = data.payment.signFields;
  const status = data.payment.status; // 'WAITING', 'SUCCESS', 'ERROR'
  const sum = data.payment.sum; // {amount: 12, currency: 643}
  const txnId = data.payment.txnId; // ID транзакции в процессинге QIWI Wallet
  const type = data.payment.type; // 'IN' or 'OUT'

  const toHashStr = `${sum.currency}|${sum.amount}|${type}|${account}|${txnId}`;

  // if(hash === myHash) {
  //   console.log(true)
  // }

  if (type === "IN") return inCash(sum.amount, comment);
  if (type === "OUT") return outCash(sum.amount, comment);

  console.log(data);
}

const User = require("../models/user");

async function inCash(amount, userId) {
  const user = await User.findOne({ userId });
  await User.updateOne({ userId }, { mainBalance: user.mainBalance + amount });
  await bot.telegram.sendMessage(
    userId,
    `На ваш баланс было начисленно ${amount}P.
Ваш текущий баланс: ${user.mainBalance + amount}`
  );
}

async function outCash(amount, userId) {
  const user = await User.findOne({ userId });
  await User.updateOne({ userId }, { mainBalance: user.mainBalance - amount });
  await bot.telegram.sendMessage(userId, `С вашего баланса было списано ${amount}P.
Ваш текущий баланс: ${user.mainBalance - amount}`)
}

// {"hash": "a56ed0090fa3fd2fd0b002ed80f85a120037a6a85f840938888275e1631da96f",
//  "hookId": "8c79f60d-0272-476b-b120-6e7629467328",
//  "messageId": "bba24947-ab5f-4b33-881b-738fc3a4c9e1",
//  "payment": {"account": "79042426915",
//              "comment": "Order i_4769798 Счет №65361451. Пополнение аккаунта "
//                         "P11689160 (garik3315@gmail.com) в платежной системе "
//                         "Payeer. Внимание! Не меняйте сумму, валюту и "
//                         "комментарий к переводу, не делайте повторный перевод, "
//                         "в ином случае Ваш платеж зачислен НЕ будет!",
//              "commission": {"amount": 0.0, "currency": 643},
//              "date": "2018-03-25T13:16:48+03:00",
//              "errorCode": "0",
//              "personId": 79645265240,
//              "provider": 7,
//              "signFields": "sum.currency,sum.amount,type,account,txnId",
//              "status": "SUCCESS",
//              "sum": {"amount": 1.09, "currency": 643},
//              "total": {"amount": 1.09, "currency": 643},
//              "txnId": "12565018935",
//              "type": "IN"},
//  "test": false,
//  "version": "1.0.0"}

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
