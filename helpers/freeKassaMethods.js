// 133 FK WALLET RUB (комиссия 0.00%)
// 63 QIWI кошелек (комиссия 4.00%)
// 123 QIWI USD (комиссия 8.00%)
// 161 QIWI EURO (комиссия 4.00%)
// 45 Яндекс.Деньги (комиссия 2.00%)
// 94 VISA/MASTERCARD RUB (комиссия 4.00%)
// 100 VISA/MASTERCARD USD (комиссия 8.00%)
// 124 VISA/MASTERCARD EUR (комиссия 5.00%)
// 114 PAYEER RUB (комиссия 5.50%)
// 115 PAYEER USD (комиссия 4.00%)
// 70	PayPal (комиссия 3.50%)

const axios = require("axios");
const querystring = require("querystring");
const md5 = require("js-md5");

// Пополнить баланс
module.exports.donateUrl = (orderId, amount) => {
  const heshKey = md5(
    `${process.env.MERCHANT_ID}:${amount}:${process.env.SECRET_WORD}:${orderId}`
  );
  return `https://www.free-kassa.ru/merchant/cash.php?m=${MERCHANT_ID}&oa=${amount}&o=${orderId}&s=${heshKey}`;
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
