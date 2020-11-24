const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const { outMoney } = require("../../helpers/qiwiMethods");

const outQiwi = new Scene("outQiwi");
outQiwi.enter(async (ctx) => {
  return await ctx.reply(
    `Коммиссия 2%. Введите сумму.`,
    Extra.markup(Markup.keyboard([["↪️ Вернуться назад"]]).resize())
  );
});

outQiwi.on("text", async (ctx) => {
  const msg = ctx.update.message.text;

  if (msg === "↪️ Вернуться назад") {
    ctx.session.state = {};
    return await ctx.scene.enter("outMoney");
  }

  if (!ctx.session.state.amount) {
    const amount = +msg.trim().replace("+", "");
    const balance = ctx.session.state.mainBalance;
    const prizeFound = ctx.session.state.prizeFound;
    if (!Boolean(amount))
      return await ctx.reply("Пожалуйста, введите только цифры.");
    if (amount < 0) return await ctx.reply("Минимальный вывода 10р.");
    if (amount + amount * 0.02 > balance)
      return await ctx.reply("У вас недостаточно средств на балансе.");
    if (amount > prizeFound)
      return await ctx.reply("Не хватает призового фонда");

    ctx.session.state = {
      ...ctx.session.state,
      amount: amount + amount * 0.02,
    };
    return await ctx.reply("Пожалуйста, введите номер qiwi кошелька.");
  }

  if (!Boolean(+msg.trim()))
    return await ctx.reply("Пожалуйста, введите только цифры.");

  ctx.session.state = {
    ...ctx.session.state,
    wallet: msg,
  };

  return await ctx.reply(
    `Вы собираетесь вывести сумму ${
      ctx.session.state.amount - ctx.session.state.amount * 0.02
    }P на номер кошелька +${msg}.
C вашего баланса спишеться: ${ctx.session.state.amount}
Нажмите "Подтвердить", чтобы произвести выплату.`,
    Extra.markup((m) =>
      m.inlineKeyboard([[m.callbackButton("Подтвердить", "Подтвердить")]])
    )
  );
});

outQiwi.action("Подтвердить", async (ctx) => {
  const amount = ctx.session.state.amount;
  const wallet = ctx.session.state.wallet;

  return await outMoney(amount, `+${wallet}`, ctx.from.id, 99);
});

module.exports = { outQiwi };
