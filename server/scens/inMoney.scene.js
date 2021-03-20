const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const isNumber = require("is-number");

const inMoney = new Scene("inMoney");
inMoney.enter(async (ctx) => {
  return await ctx.reply(
    `Выберите сумму для пополнения.
Минимальная сумма для пополнения: ${process.env.IN_QIWI}₽`,
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
  const url = `https://qiwi.com/payment/form/99?extra%5B%27account%27%5D=${process.env.QIWI_WALLET}&amountInteger=${amount}&amountFraction=0&extra%5B%27comment%27%5D=${comment}&currency=643&blocked[0]=sum&blocked[1]=account&blocked[2]=comment`;

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

  const amount = +ctx.update.message.text.replace(/\D+/, "").trim();

  if (isNumber(amount)) {
    if (amount < process.env.IN_QIWI)
      return await ctx.reply(
        `Минимальная сумма для пополнения ${process.env.IN_QIWI}₽`
      );

    const url = `https://qiwi.com/payment/form/99?extra%5B%27account%27%5D=${process.env.QIWI_WALLET}&amountInteger=${amount}&amountFraction=0&extra%5B%27comment%27%5D=${ctx.from.id}&currency=643&blocked[0]=sum&blocked[1]=account&blocked[2]=comment`;

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
