const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const axios = require("axios");
const querystring = require("querystring");

axios.defaults.headers.common["Accept"] = "application/json";
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
    .get(
      `https://edge.qiwi.com/payment-notifier/v1/hooks/test`
    )
    .then((res) => console.log(res.data.response));
  await axios
    .get(
      `https://edge.qiwi.com/payment-notifier/v1/hooks/${process.env.HOOK_ID}/key`
    )
    .then((res) => console.log(res.data.key));

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
