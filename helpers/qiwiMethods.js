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
