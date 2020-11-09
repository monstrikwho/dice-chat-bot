const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");
const axios = require("axios");
const FormData = require("form-data");

axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common["Accept"] = "application/json";
axios.defaults.headers.common[
  "Authorization"
] = `Bearer ${process.env.QIWI_TOKEN}`;
axios.defaults.headers.post["Host"] = "edge.qiwi.com";

// *************************** STEP 1 *******************************************
const showMainMenu = new Scene("showMainMenu");
showMainMenu.enter(async (ctx) => {
  return await ctx.reply(
    "Вы вошли в главное меню",
    Extra.markup(
      Markup.keyboard([
        ["Играть", "Демо"],
        ["Личный кабинет",],
      ]).resize()
    )
  );
});

showMainMenu.hears("Играть", async (ctx) => {
  // const obj = {
  //   id: "79327035297502945397234",
  //   sum: {
  //     amount: 1,
  //     currency: "643",
  //   },
  //   paymentMethod: {
  //     type: "Account",
  //     accountId: "643",
  //   },
  //   fields: {
  //     account: "4255190103543289",
  //     rec_address: "Уборевича 18",
  //     rec_city: "Барановичи",
  //     rec_country: "Беларусь",
  //     reg_name: "Алексндр",
  //     reg_name_f: "Петров",
  //     rem_name: "Никита",
  //     rem_name_f: "Концевич",
  //   },
  // };

  // await axios
  //   .post(`https://edge.qiwi.com/sinap/api/v2/terms/1960/payments`, obj)
  //   .then((res) => console.log(res.data.message));

  // const form = new FormData();
  // form.append("phone", "375297835128");

  // const id = await axios
  //   .post(`https://qiwi.com/mobile/detect.action`, form, {
  //     headers: form.getHeaders(),
  //   })
  //   .then((res) => res.data.message)

  // await axios.post(`https://edge.qiwi.com/sinap/api/v2/terms/${id}/payments`, {
  //   id: "2750517430572340753",
  //   sum: {
  //     amount: 2,
  //     currency: "643",
  //   },
  //   paymentMethod: {
  //     type: "Account",
  //     accountId: "643",
  //   },
  //   fields: {
  //     account: "375297835128",
  //   },
  // })

  // const id = await axios.post(`https://edge.qiwi.com/sinap/api/v2/terms/99/payments`, {
  //   id: "41684129646051640124386",
  //   sum: {
  //     amount: 1,
  //     currency: "643",
  //   },
  //   paymentMethod: {
  //     type: "Account",
  //     accountId: "643",
  //   },
  //   comment: "test",
  //   fields: {
  //     account: "+375297835128",
  //   },
  // });

  ctx.reply("Раздел еще в разработке");
});
showMainMenu.hears("Демо", async (ctx) => {
  ctx.scene.enter("demoGame");
});
showMainMenu.hears("Личный кабинет", async (ctx) => {
  ctx.scene.enter('lkMenu')
});
showMainMenu.hears("Инфо", async (ctx) => {
  // const balance = await axios
  //   .get(
  //     `https://edge.qiwi.com/funding-sources/v2/persons/${process.env.QIWI_WALLET}/accounts`
  //   )
  //   .then((res) => res.data.accounts[0].balance.amount);
  // ctx.reply(`Общий капитал: ${balance}`);
});

module.exports = { showMainMenu };

//4255190103543289

// перевод на карту другого банка 2% + 50р
