const axios = require("axios");
const querystring = require("querystring");
const { bot } = require("../init/startBot");

const MainStats = require("../models/mainstats");
const Users = require("../models/user");

axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common["Accept"] = "application/json";

module.exports.getProfileInfo = async () => {
  const { webhook } = await MainStats.findOne({});

  axios.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${webhook.qiwiToken}`;

  await axios
    .get(`https://edge.qiwi.com/person-profile/v1/profile/current`)
    .then((res) => console.log(res.data))
    .catch((err) => console.log(err.message));
};

module.exports.getProfileBalance = async () => {
  const { webhook } = await MainStats.findOne({});

  axios.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${webhook.qiwiToken}`;

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
  const { webhook, outPercent } = await MainStats.findOne({});

  axios.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${webhook.qiwiToken}`;

  // Считаем комиссию
  let commission = 0;
  if (idProvider === 1963 || idProvider === 21013) {
    commission = 50 + amount * (0.02 + outPercent / 100);
  }
  if (idProvider === 1960 || idProvider === 21012) {
    commission = 100 + amount * (0.02 + outPercent / 100);
  }

  const { mainBalance } = await Users.findOne({ userId });

  await Users.updateOne(
    { userId },
    { mainBalance: +(mainBalance - (amount + commission)).toFixed(2) }
  );
  await bot.telegram.sendMessage(
    userId,
    `С вашего баланса была удержана сумма: ${amount + commission}P`
  );

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
    .then((res) => res.data)
    .catch(async (err) => {
      const { mainBalance } = await Users.findOne({ userId });
      await Users.updateOne(
        { userId },
        { mainBalance: +(mainBalance + amount + commission).toFixed(2) }
      );
      await bot.telegram.sendMessage(
        userId,
        `Возврат удержанной суммы: ${amount + commission}P`
      );

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
