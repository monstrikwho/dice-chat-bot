const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const axios = require("axios");
const querystring = require("querystring");

axios.defaults.headers.common["User-Agent"] = "****";
axios.defaults.headers.common[
  "Authorization"
] = `Bearer ${process.env.QIWI_TOKEN}`;
axios.defaults.headers.post["Host"] = "edge.qiwi.com";

// *************************** STEP 1 *******************************************
const lkMenu = new Scene("lkMenu");
lkMenu.enter(async (ctx) => {
  return await ctx.reply(
    "Вы вошли в главное меню",
    Extra.markup(
      Markup.keyboard([
        ["Пополнить", "Вывести"],
        ["↪️ Вернуться назад"],
      ]).resize()
    )
  );
});

lkMenu.hears("Пополнить", async (ctx) => {
  await axios
    .put(
      `https://edge.qiwi.com/payment-notifier/v1/hooks?hookType=1&param=http%3A%2F%2F188.165.91.109:5000/verify_pay%2F&txnType=0`
    )
    .then((res) => console.log(res.data.hookId));
  // await axios.post(
  //   `http://188.165.91.109:5000/verify_pay`,
  //   querystring.stringify({ parseLink: "fsdfsdf" })
  // );
  // .then((res) => console.log(res.data.message));

  // const amount = 1;
  // const comment = ctx.from.id;
  // const url = `https://qiwi.com/payment/form/99?extra%5B%27account%27%5D=${process.env.QIWI_WALLET}&amountInteger=${amount}&amountFraction=0&extra%5B%27comment%27%5D=${comment}&currency=643&blocked[0]=sum&blocked[1]=account&blocked[2]=comment`;
});
lkMenu.hears("Вывести", ({ scene }) => {
  scene.enter("outMoney");
});
lkMenu.hears("↪️ Вернуться назад", ({ scene }) => {
  scene.enter("showMainMenu");
});

module.exports = { lkMenu };
