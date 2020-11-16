// axios.defaults.headers.common["Content-Type"] = "application/json";
// axios.defaults.headers.common["Accept"] = "application/json";
// axios.defaults.headers.common[
//   "Authorization"
// ] = `Bearer ${process.env.QIWI_TOKEN}`;
// axios.defaults.headers.post["User-Agent"] = "Android v3.2.0 MKT";

// Тестовое уведомление
// await axios
//   .get(
//     `https://edge.qiwi.com/payment-notifier/v1/hooks/test`
//   )
//   .then((res) => console.log(res.data.response));

// Ключ вебхука
// await axios
//   .get(
//     `https://edge.qiwi.com/payment-notifier/v1/hooks/${process.env.HOOK_ID}/key`
//   )
//   .then((res) => console.log(res.data.key));

// Показать инфу активного хука
// await axios
//   .get(
//     `https://edge.qiwi.com/payment-notifier/v1/hooks/active`
//   )
//   .then((res) => console.log(res.data));

// Активировать вебхук
// await axios
//   .put(
//     `https://edge.qiwi.com/payment-notifier/v1/hooks?hookType=1&param=https%3A%2F%2F188.165.91.109:${process.env.PORT}/verify_pay%2F&txnType=2`
//   )
//   .then((res) => console.log(res.data));

// Удалить вебхук
// await axios
//   .delete(
//     `https://edge.qiwi.com/payment-notifier/v1/hooks/${process.env.HOOK_ID}`
//   )
//   .then((res) => console.log(res.data));

// Посмотреть комиссию перевода
// await axios
//     .post(`https://edge.qiwi.com/sinap/providers/99/onlineCommission`, {
//       account: "79206020622",
//       paymentMethod: {
//         type: "Account",
//         accountId: "643",
//       },
//       purchaseTotals: {
//         total: {
//           amount: 1,
//           currency: "643",
//         },
//       },
//     })
//     .then((res) => console.log(res.data.qwCommission.amount))
//     .catch((err) => console.log(err.message));

// Получить массив с объектами пополнений
// await axios
// .get(
//   `https://edge.qiwi.com/payment-history/v2/persons/${process.env.QIWI_WALLET}/payments?rows=5&operation=IN`
// )
// .then((res) => console.log(res.data))
// .catch((err) => console.log(err.message));

// Перевод на кошелек киви
// const obj = {
//   id: "732095792752052", // макс длина 19 символов. идшник должен быть разным
//   sum: {
//     amount: 1,
//     currency: "643",
//   },
//   paymentMethod: {
//     type: "Account",
//     accountId: "643",
//   },
//   comment: "sdfsdf",
//   fields: {
//     account: "+79206020622",
//   },
// };

// await axios
//   .post(`https://edge.qiwi.com/sinap/api/v2/terms/99/payments`, obj)
//   .then((res) => console.log(res));
// .catch((err) => console.log(err.message));

// Мой запрос сервер-сервер
// await axios
//     .post(
//       `http://188.165.91.109:5000/verify_pay/`,
//       // `http://dice-bots.ru/verify_pay/`,
//       querystring.stringify({ sdfds: "sdfds" }),
//       {
//         httpAgent: new http.Agent({ keepAlive: true }),
//         // httpsAgent: new https.Agent({ keepAlive: true }),
//         proxy: {
//           host: "188.165.91.109",
//           port: 5000,
//         },
//       }
//     )
//     .then((res) => console.log(res.data.message));