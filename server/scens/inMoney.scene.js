const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");
const isNumber = require("is-number");
const axios = require("axios");

const MainStats = require("../models/mainstats");

const inMoney = new Scene("inMoney");
inMoney.enter(async (ctx) => {
  const { minIn } = await MainStats.findOne({});

  return await ctx.reply(
    `Выберите либо введите в чат сумму пополнения
Минимальная сумма для пополнения: ${minIn}₽`,
    Extra.markup(
      Markup.keyboard([
        ["50₽", "100₽", "500₽", "1000₽"],
        ["↪️ Вернуться назад"],
      ]).resize()
    )
  );
});

inMoney.hears(/(?:50₽|100₽|500₽|1000₽)/, async (ctx) => {
  const amount = +ctx.update.message.text.replace(/\D+/, "").replace("₽", "");
  const comment = ctx.from.id;

  const { webhook } = await MainStats.findOne({});

  const urlQiwi = `https://qiwi.com/payment/form/99?extra%5B%27account%27%5D=${webhook.qiwiWallet}&amountInteger=${amount}&amountFraction=0&extra%5B%27comment%27%5D=${comment}&currency=643&blocked[0]=sum&blocked[1]=account&blocked[2]=comment`;

  // const data = JSON.stringify({
  //   account: "P1051197168",
  //   apiId: 1407343849,
  //   apiPass: "1234",
  //   action: "invoiceCreate",
  //   m_shop: 1405684803,
  //   m_orderid: 14234,
  //   m_amount: 20,
  //   m_curr: "RUB",
  //   m_desc: 23442,
  // });

  // const request = require("request");
  // let urlPayeer = null;

  // function req(data) {
  //   return new Promise((resolve) => {
  //     request(
  //       {
  //         method: "POST",
  //         url: "https://payeer.com/ajax/api/api.php?invoiceCreate",
  //         headers: {
  //           "Content-Type": "application/x-www-form-urlencoded",
  //         },
  //         body: "account=P1051197168&apiId=1407343849&apiPass=1234&action=invoiceCreate&m_shop=1405684803&m_orderid=test&m_amount=10&m_curr=USD&m_desc=Test%20Invoice",
  //       },
  //       function (error, response, body) {
  //         const data = JSON.parse(body);
  //         urlPayeer = data.url;
  //         resolve();
  //       }
  //     );
  //   });
  // }

  // await req(data);

  // await bot.telegram.sendInvoice(ctx.from.id, {
  //   title: `Пополнение баланса #2332422`,
  //   description: "212",
  //   payload: "123",
  //   provider_token: "381764678:TEST:25075",
  //   currency: "RUB",
  //   prices: [{ label: "Пополнение баланса", amount: 7500 }],
  // });

  // bot.on("pre_checkout_query", (res) => {
  //   const data = res.update.pre_checkout_query;
  //   res.answerPreCheckoutQuery(true);
  //   // await bot.telegram.answerPreCheckoutQuery()
  //   console.log(data);
  // });

  return await ctx.reply(
    `Вы собираетесь пополнить игровой баланс на сумму ${amount}₽.
Пожалуйста, нажмите "Пополнить", чтобы перейти на страницу пополнения.

Что бы пополнить баланс бота совершите рублёвый перевод на желанную сумму по указанным реквизитам ниже с указанием заданного коментария:
▪️ Кошелёк: +${webhook.qiwiWallet}
▪️ Комментарий к переводу: ${comment}`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Пополнить QIWI",
              url: urlQiwi,
            },
            // {
            //   text: "Пополнить PAYEER",
            //   url: urlPayeer,
            // },
          ],
        ],
      },
    }
  );
});

inMoney.on("text", async (ctx) => {
  const msg = ctx.update.message.text;

  if (msg === "↪️ Вернуться назад") {
    return await ctx.scene.enter("lkMenu");
  }

  const amount = +ctx.update.message.text.replace(/\D+/, "").trim();

  if (!isNumber(amount)) {
    return ctx.reply("Вы ввели некоректное число. Попробуйте еще раз.");
  }

  const { minIn, webhook } = await MainStats.findOne({});

  if (amount < minIn) {
    return await ctx.reply(`Минимальная сумма для пополнения ${minIn}₽`);
  }

  const url = `https://qiwi.com/payment/form/99?extra%5B%27account%27%5D=${webhook.qiwiWallet}&amountInteger=${amount}&amountFraction=0&extra%5B%27comment%27%5D=${ctx.from.id}&currency=643&blocked[0]=sum&blocked[1]=account&blocked[2]=comment`;

  return await ctx.reply(
    `Вы собираетесь пополнить игровой баланс на сумму ${amount}₽.
Пожалуйста, нажмите "Пополнить", чтобы перейти на страницу пополнения.

Что бы пополнить баланс бота совершите рублёвый перевод на желанную сумму по указанным реквизитам ниже с указанием заданного коментария:
▪️ Кошелёк: +${webhook.qiwiWallet}
▪️ Комментарий к переводу: ${ctx.from.id}`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Пополнить",
              url: url,
            },
          ],
        ],
      },
    }
  );
});

module.exports = { inMoney };
