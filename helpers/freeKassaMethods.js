// 63 QIWI кошелек (комиссия 4.00%)
// 45 Яндекс.Деньги (комиссия 2.00%)
// 94 VISA/MASTERCARD RUB (комиссия 4.00%)

// 133 FK WALLET RUB (комиссия 0.00%)
// 123 QIWI USD (комиссия 8.00%)
// 161 QIWI EURO (комиссия 4.00%)
// 100 VISA/MASTERCARD USD (комиссия 8.00%)
// 124 VISA/MASTERCARD EUR (комиссия 5.00%)
// 114 PAYEER RUB (комиссия 5.50%)
// 115 PAYEER USD (комиссия 4.00%)
// 70	PayPal (комиссия 3.50%)

const axios = require("axios");
const querystring = require("querystring");
const md5 = require("js-md5");

const Settings = require("../models/setting");

// Пополнить баланс merchant
module.exports.donate = async (amount, cur_id) => {
  const [{ lastOrder }] = await Settings.find();
  const orderId = lastOrder + 1;
  await Settings.updateOne({ lastOrder }, { lastOrder: orderId });

  const heshKey = md5(
    `${process.env.MERCHANT_ID}:${amount}:${process.env.SECRET_WORD}:${orderId}`
  );
  return [
    `https://www.free-kassa.ru/merchant/cash.php?m=${process.env.MERCHANT_ID}&oa=${amount}&o=${orderId}&s=${heshKey}&i=${cur_id}`,
    orderId,
  ];
};

// Проверка заказа
module.exports.checkOrder = async (order_id) => {
  const data = {
    merchant_id: process.env.MERCHANT_ID,
    s: md5(`${process.env.MERCHANT_ID}${process.env.SECRET_WORD}`),
    order_id,
    action: "check_order_status",
  };
  return await axios
    .post(`https://www.free-kassa.ru/api.php`, querystring.stringify(data))
    .then((res) => {
      const data = res.data;

      const desc = data.split("<desc>")[1].split("</desc>")[0];
      if (desc === "Order not found") return { status: false };
      if (desc === "too fast, wait 10sec until next request")
        return { status: "fast" };

      const status = data.split("<status>")[1].split("</status>")[0];
      const amount = data.split("<amount>")[1].split("</amount>")[0];

      if (status === "completed") {
        return {
          status: true,
          amount,
        };
      }
      if (status === "new") {
        return {
          status: "new",
        };
      }
      return { status: false };
    });
};

// Transfer money out merchant to wallet
module.exports.outToFkw = async (amount) => {
  const data = {
    merchant_id: process.env.MERCHANT_ID,
    currency: "fkw",
    amount,
    s: md5(`${process.env.MERCHANT_ID}${process.env.SECRET_WORD}`),
    action: "payment",
  };
  return await axios
    .post(`https://www.free-kassa.ru/api.php`, querystring.stringify(data))
    .then((res) => res.data);
};

// Получить баланс кошелька
module.exports.getBalance = async () => {
  const data = {
    wallet_id: process.env.FREEKASSA_WALLET,
    sign: md5(`${process.env.FREEKASSA_WALLET}${process.env.FREEKASSA_APIKEY}`),
    action: "get_balance",
  };
  return await axios
    .post(`https://www.fkwallet.ru/api_v1.php`, querystring.stringify(data))
    .then((res) => res.data.data.RUR);
};

// Вывод средств из кошелька
module.exports.outMoney = async (purse, amount, desc, currency) => {
  const data = {
    wallet_id: process.env.FREEKASSA_WALLET,
    purse: purse,
    amount: amount,
    desc: desc,
    currency: currency,
    sign: md5(
      `${process.env.FREEKASSA_WALLET}${currency}${amount}${purse}${process.env.FREEKASSA_APIKEY}`
    ),
    action: "cashout",
  };
  return await axios
    .post(`https://www.fkwallet.ru/api_v1.php`, querystring.stringify(data))
    .then((res) => console.log(res.data));
};
