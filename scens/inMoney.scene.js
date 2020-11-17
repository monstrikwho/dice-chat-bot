const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const { donateUrl } = require("../helpers/freeKassaMethods");

const inMoney = new Scene("inMoney");
inMoney.enter(async (ctx) => {
  return await ctx.reply(
    "Выберите сумму для пополнения",
    Extra.markup(
      Markup.keyboard([
        ["10₽", "20₽", "50₽", "100₽", "500₽"],
        ["Ввести другую суммму"],
        ["↪️ Вернуться назад"],
      ]).resize()
    )
  );
});

inMoney.hears(/(?:10₽|20₽|50₽|100₽|500₽)/, async (ctx) => {
  const amount = +ctx.update.message.text.replace(/\D+/, "").replace("₽", "");
  const url = donateUrl(ctx.from.id, amount);
  await ctx.replyWithHTML(
    `Вы собираетесь пополнить игровой баланс на сумму ${amount}₽. Пожалуйста, нажмите "Подтвердить", чтобы перейти на страницу пополнения.
<a href="${url}">Подтвердить</a>`,
    Extra.markup(Markup.keyboard([["↪️ Вернуться в ЛК"]]).resize())
  );
});

inMoney.hears("Ввести другую суммму", async ({ scene }) => {
  return await scene.enter("writeAmount");
});

inMoney.hears(/(?:↪️ Вернуться назад|↪️ Вернуться в ЛК)/, async ({ scene }) => {
  // scene.enter("lkMenu");
  const axios = require("axios");
  const querystring = require("querystring");
  const https = require('https')

  return await axios
    .post(
      `https://dice-bots.ru/verify_pay`,
      querystring.stringify({ sdfds: "sdfds" }),
      // {
      //   // httpAgent: new http.Agent({ keepAlive: true }),
      //   httpsAgent: new https.Agent({ keepAlive: true }),
      //   proxy: {
      //     host: "188.165.91.109",
      //     port: 5000,
      //   },
      // }
    )
    .then((res) => res.data);
});

//

// ****************************** WRITE OTHER AMOUNT *******************************
const writeAmount = new Scene("writeAmount");
writeAmount.enter(async (ctx) => {
  return await ctx.reply(
    "Пожалуйста, введите сумму для пополнения.",
    Extra.markup(Markup.keyboard([["↪️ Вернуться в ЛК"]]).resize())
  );
});

writeAmount.on("text", async (ctx) => {
  const msg = ctx.update.message.text;

  if (msg === "↪️ Вернуться в ЛК") {
    return await ctx.scene.enter("lkMenu");
  }

  const amount = ctx.update.message.text.replace(/\D+/, "");
  console.log(Number(amount));
  if (Number(amount)) {
    const comment = ctx.from.id;
    const url = `https://qiwi.com/payment/form/99?extra%5B%27account%27%5D=${process.env.QIWI_WALLET}&amountInteger=${amount}&amountFraction=0&extra%5B%27comment%27%5D=${comment}&currency=643&blocked[0]=sum&blocked[1]=account&blocked[2]=comment`;

    return await ctx.replyWithHTML(
      `Вы собираетесь пополнить игровой баланс на сумму ${amount}₽. Пожалуйста, нажмите "Подтвердить", чтобы перейти на страницу пополнения.
<a href="${url}">Подтвердить</a>`
    );
  } else {
    return ctx.reply("Вы ввели некоректное число. Попробуйте еще раз.");
  }
});

module.exports = { inMoney, writeAmount };
