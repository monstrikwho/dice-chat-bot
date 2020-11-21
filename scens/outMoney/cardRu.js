const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const { outMoney } = require("../../helpers/qiwiMethods");

const outCardRu = new Scene("outCardRu");
outCardRu.enter(async (ctx) => {
  return await ctx.reply(
    `Минималка на вывод 50р + коммисия 2% + 50P. Введите сумму.`,
    Extra.markup(Markup.keyboard([["↪️ Вернуться назад"]]).resize())
  );
});

outCardRu.on("text", async (ctx) => {
  const msg = ctx.update.message.text;

  if (msg === "↪️ Вернуться назад") {
    return await ctx.scene.enter("outMoney");
  }

  if (!ctx.session.state.amount) {
    const amount = +msg.trim();
    const balance = ctx.session.state.mainBalance;
    const prizeFound = ctx.session.state.prizeFound;
    if (!Boolean(amount))
      return await ctx.reply("Пожалуйста, введите только цифры.");
    if (amount < 50) return await ctx.reply("Минимальный вывода 50р.");
    if (amount + 50 + amount * 0.02 > balance)
      return await ctx.reply("У вас недостаточно средств на балансе.");
    if ((amount > prizeFound))
      return await ctx.reply("Не хватает призового фонда");

    ctx.session.state = {
      ...ctx.session.state,
      amount,
    };
    return await ctx.reply("Пожалуйста, введите номер карты.");
  }

  if (!Boolean(+msg.trim()))
    return await ctx.reply("Пожалуйста, введите только цифры.");

  ctx.session.state = {
    ...ctx.session.state,
    wallet: msg,
  };

  return await ctx.reply(
    `Вы собираетесь вывести сумму ${ctx.session.state.amount}P на номер карты ${msg}.
C вашего баланса спишеться: ${
      ctx.session.state.amount + 50 + ctx.session.state.amount * 0.02
    }
Нажмите "Подтвердить", чтобы произвести выплату.`,
    Extra.markup((m) =>
      m.inlineKeyboard([[m.callbackButton("Подтвердить", "Подтвердить")]])
    )
  );

  // const wallet = "4100116057553711"
});

outCardRu.action("Подтвердить", async (ctx) => {
  const amount = ctx.session.state.amount;
  const wallet = ctx.session.state.wallet;
  const idProvider = ctx.session.state.idProvider;
  return await outMoney(amount, wallet, ctx.from.id, idProvider);
});

module.exports = { outCardRu };
