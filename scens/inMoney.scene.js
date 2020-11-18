const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const { donate } = require("../helpers/freeKassaMethods");
const checkOrder = require("../init/checkOrder");

// *************************** CUR PAY ***********************************
const curPay = new Scene("curPay");
curPay.enter(async (ctx) => {
  return await ctx.reply(
    "Пожалуйста, выберите способ оплаты",
    Extra.markup(
      Markup.keyboard([
        ["MC/Visa", "Яндекс", "Qiwi"],
        ["↪️ Вернуться назад"],
      ]).resize()
    )
  );
});

curPay.hears(/(?:↪️ Вернуться назад)/, async ({ scene }) => {
  return await scene.enter("lkMenu");
});

curPay.hears(/./, async (ctx) => {
  const msg = ctx.update.message.text;
  if (msg === "MC/Visa") ctx.session.state = { cur_id: 160 };
  if (msg === "Яндекс") ctx.session.state = { cur_id: 45 };
  if (msg === "Qiwi") ctx.session.state = { cur_id: 63 };
  return await ctx.scene.enter("inMoney");
});

//

//

const replyMsg = (
  amount,
  url
) => `Пополнение игрового баланса на сумму  💰 ${amount}₽. 
Пожалуйста, нажмите кнопку ниже, чтобы перейти к оплате.
🔗 <a href="${url}">Перейти на страницу оплаты</a>

🟢Проверьте платеж вручную, чтобы начислить средства, нажав на кнопку ниже "Проверить платеж".

⚠️Пожалуйста, не покидайте это меню, пока не проверите платеж.
⚠️Если покинули его, войдите назад и нажмите кнопку "Проверить платеж".`;

// 

// ********************************* IN MONEY ***********************************
const inMoney = new Scene("inMoney");
inMoney.enter(async (ctx) => {
  return await ctx.reply(
    "Выберите сумму для пополнения",
    Extra.markup(
      Markup.keyboard([
        ["15₽", "30₽", "50₽", "100₽", "500₽"],
        ["Ввести другую суммму"],
        ["↪️ Вернуться назад"],
      ]).resize()
    )
  );
});

inMoney.hears(/(?:15₽|30₽|50₽|100₽|500₽)/, async (ctx) => {
  const amount = +ctx.update.message.text.replace(/\D+/, "").replace("₽", "");
  const cur_id = ctx.session.state.cur_id;
  const [url, orderId] = await donate(amount, cur_id);
  await ctx.replyWithHTML(
    replyMsg(amount, url),
    Extra.markup((m) =>
      m.inlineKeyboard([
        [m.callbackButton(`Проверить платеж №${orderId}`, `${orderId}`)],
      ])
    )
  );
});

inMoney.hears("Ввести другую суммму", async ({ scene }) => {
  return await scene.enter("writeAmount");
});

inMoney.hears(/(?:↪️ Вернуться назад)/, async ({ scene }) => {
  return await scene.enter("curPay");
});

// 

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

  const amount = ctx.update.message.text.replace(/\D+/, "");
  if (Number(amount) && amount >= 15) {
    const cur_id = ctx.session.state.cur_id;
    const [url, orderId] = await donate(amount, cur_id);

    return await ctx.replyWithHTML(
      replyMsg(amount, url),
      Extra.markup((m) =>
        m.inlineKeyboard([
          [m.callbackButton(`Проверить платеж №${orderId}`, `${orderId}`)],
        ])
      )
    );
  } else {
    if (amount < 15)
      return await ctx.reply("Минимальная сумма пополнения 15р.");
    return ctx.reply("Вы ввели некоректное число. Попробуйте еще раз.");
  }
});

// **************************** INIT ACTIONS *******************************
checkOrder(inMoney);
checkOrder(writeAmount);

module.exports = { curPay, inMoney, writeAmount };
