const axios = require("axios");
const querystring = require("querystring");
const { bot } = require("../init/startBot");

axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common["Accept"] = "application/json";
axios.defaults.headers.common[
  "Authorization"
] = `Bearer ${process.env.QIWI_TOKEN}`;
axios.defaults.headers.post["User-Agent"] = "Android v3.2.0 MKT";

module.exports.getProfileInfo = async () => {
  await axios
    .get(`https://edge.qiwi.com/person-profile/v1/profile/current`)
    .then((res) => console.log(res.data))
    .catch((err) => console.log(err.message));
};

module.exports.getProfileBalance = async () => {
  return await axios
    .get(
      `https://edge.qiwi.com/funding-sources/v2/persons/${process.env.QIWI_WALLET}/accounts`
    )
    .then((res) => res.data.accounts[0].balance.amount)
    .catch((err) => console.log(err.message));
};

module.exports.testWebHook = async () => {
  // Тестовое уведомление
  await axios
    .get(`https://edge.qiwi.com/payment-notifier/v1/hooks/test`)
    .then((res) => console.log(res.data.response));
};

module.exports.keyWebHook = async () => {
  // Ключ вебхука
  await axios
    .get(
      `https://edge.qiwi.com/payment-notifier/v1/hooks/${process.env.HOOK_ID}/key`
    )
    .then((res) => console.log(res.data.key));
};

module.exports.infoActiveHook = async () => {
  // Показать инфу активного хука
  await axios
    .get(`https://edge.qiwi.com/payment-notifier/v1/hooks/active`)
    .then((res) => console.log(res.data));
};

module.exports.setWebHook = async () => {
  // Активировать вебхук
  await axios
    .put(
      `https://edge.qiwi.com/payment-notifier/v1/hooks?hookType=1&param=https%3A%2F%2Fdice-bots.ru/${process.env.HOOK_URL}%2F&txnType=2`
    )
    .then((res) => console.log(res.data));
};

module.exports.deleteActiveHook = async () => {
  // Удалить вебхук
  await axios
    .delete(
      `https://edge.qiwi.com/payment-notifier/v1/hooks/${process.env.HOOK_ID}`
    )
    .then((res) => console.log(res.data));
};

module.exports.checkCommission = async () => {
  // Посмотреть комиссию перевода
  await axios
    .post(`https://edge.qiwi.com/sinap/providers/1960/onlineCommission`, {
      account: process.env.QIWI_WALLET,
      paymentMethod: {
        type: "Account",
        accountId: "643",
      },
      purchaseTotals: {
        total: {
          amount: 1000,
          currency: "643",
        },
      },
    })
    .then((res) => console.log(res.data.qwCommission.amount))
    .catch((err) => console.log(err.message));
};

// Получить массив с объектами пополнений
// await axios
// .get(
//   `https://edge.qiwi.com/payment-history/v2/persons/${process.env.QIWI_WALLET}/payments?rows=5&operation=IN`
// )
// .then((res) => console.log(res.data))
// .catch((err) => console.log(err.message));

module.exports.outMoney = async (
  amount,
  wallet,
  userId,
  idProvider,
  userInfo
) => {
  // Перевод на кошелек киви
  const obj = {
    id: Math.round(new Date().getTime() / 1000).toString(), // макс длина 20 цифр. идшник должен быть разным
    sum: {
      amount,
      currency: "643",
    },
    paymentMethod: {
      type: "Account",
      accountId: "643",
    },
    fields: {
      account: wallet,
    },
  };

  if (idProvider === 1960 || idProvider === 21012) {
    obj.fields["rem_name"] = "Никита";
    obj.fields["rem_name_f"] = "Ворожейкин";
    obj.fields["rec_address"] = "Ленинина 78";
    obj.fields["rec_city"] = "Москва";
    obj.fields["rec_country"] = "Россия";
    obj.fields["reg_name"] = userInfo[0];
    obj.fields["reg_name_f"] = userInfo[1];
  }

  obj["comment"] = userId.toString();

  await axios
    .post(
      `https://edge.qiwi.com/sinap/api/v2/terms/${idProvider}/payments`,
      obj
    )
    // .then((res) => console.log(res.data))
    .catch(async (err) => {
      console.log(err.message);
      return await bot.telegram.sendMessage(
        userId,
        `Проверьте правильность введенных данных или напишите в поддержку для разъяснения ситуации.
Поддержка: @LuckyCatGames`
      );
    });
};

module.exports.myTestHook = async () => {
  // Мой запрос сервер-сервер
  try {
    await axios.post(
      `https://dice-bots.ru/verify_pay/`,
      querystring.stringify({ sdfds: "sdfds" })
    );
  } catch (error) {
    console.log(error);
  }
};
