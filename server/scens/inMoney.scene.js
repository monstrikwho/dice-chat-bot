const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");
const isNumber = require("is-number");

const { bot } = require("../init/startBot");
const MainStats = require("../models/mainstats");

const inMoney = new Scene("inMoney");
inMoney.enter(async (ctx) => {
  const { minIn } = await MainStats.findOne({});

  return await ctx.reply(
    `Выберите сумму для пополнения.
Минимальная сумма для пополнения: ${minIn}₽`,
    Extra.markup(
      Markup.keyboard([
        ["50₽", "100₽", "500₽", "1000₽"],
        ["Ввести другую суммму"],
        ["↪️ Вернуться назад"],
      ]).resize()
    )
  );
});

inMoney.hears(/(?:50₽|100₽|500₽|1000₽)/, async (ctx) => {
  const amount = +ctx.update.message.text.replace(/\D+/, "").replace("₽", "");
  const comment = ctx.from.id;

  const { webhook } = await MainStats.findOne({});

  const url = `https://qiwi.com/payment/form/99?extra%5B%27account%27%5D=${webhook.qiwiWallet}&amountInteger=${amount}&amountFraction=0&extra%5B%27comment%27%5D=${comment}&currency=643&blocked[0]=sum&blocked[1]=account&blocked[2]=comment`;

  await ctx.scene.enter("lkMenu");

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
Пожалуйста, нажмите "Пополнить", чтобы перейти на страницу пополнения.`,
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

inMoney.hears("Ввести другую суммму", async ({ scene }) => {
  return await scene.enter("writeAmount");
});

inMoney.hears(/(?:↪️ Вернуться назад|↪️ Вернуться в ЛК)/, ({ scene }) => {
  scene.enter("lkMenu");
});

//

// ****************************** WRITE OTHER AMOUNT *******************************
const writeAmount = new Scene("writeAmount");
writeAmount.enter(async (ctx) => {
  return await ctx.reply(
    "Пожалуйста, введите сумму для пополнения.",
    Extra.markup(Markup.keyboard([["↪️ Вернуться назад"]]).resize())
  );
});

writeAmount.on("text", async (ctx) => {
  const msg = ctx.update.message.text;

  if (msg === "↪️ Вернуться назад") {
    return await ctx.scene.enter("inMoney");
  }

  const { minIn, webhook } = await MainStats.findOne({});

  const amount = +ctx.update.message.text.replace(/\D+/, "").trim();

  if (isNumber(amount)) {
    if (amount < minIn) {
      return await ctx.reply(`Минимальная сумма для пополнения ${minIn}₽`);
    }

    const url = `https://qiwi.com/payment/form/99?extra%5B%27account%27%5D=${webhook.qiwiWallet}&amountInteger=${amount}&amountFraction=0&extra%5B%27comment%27%5D=${ctx.from.id}&currency=643&blocked[0]=sum&blocked[1]=account&blocked[2]=comment`;

    await ctx.scene.enter("lkMenu");

    return await ctx.reply(
      `Вы собираетесь пополнить игровой баланс на сумму ${amount}₽.
Пожалуйста, нажмите "Пополнить", чтобы перейти на страницу пополнения.`,
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
  } else {
    return ctx.reply("Вы ввели некоректное число. Попробуйте еще раз.");
  }
});

module.exports = { inMoney, writeAmount };
