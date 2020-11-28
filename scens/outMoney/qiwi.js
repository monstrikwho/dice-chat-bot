const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const isNumber = require("is-number");
const { outMoney } = require("../../helpers/qiwiMethods");

const outQiwi = new Scene("outQiwi");
outQiwi.enter(async (ctx) => {
  return await ctx.reply(
    `Минимальная сумма вывода: ${process.env.OUT_QIWI}p
Коммиссия: 0%. 
Пожалуйста, введите сумму.`,
    Extra.markup(Markup.keyboard([["↪️ Вернуться назад"]]).resize())
  );
});

outQiwi.on("text", async (ctx) => {
  const msg = ctx.update.message.text;

  if (ctx.session.state.payFlag) return;

  if (msg === "↪️ Вернуться назад") {
    ctx.session.state = {};
    if (ctx.session.state.activeMsg) {
      await ctx.deleteMessage(ctx.session.state.activeMsg.message_id);
    }
    return await ctx.scene.enter("outMoney");
  }

  // Если не ввели сумму
  if (!ctx.session.state.amount) {
    const amount = +msg.trim();
    const balance = ctx.session.state.mainBalance;
    const prizeFound = ctx.session.state.prizeFound;
    if (!isNumber(amount))
      return await ctx.reply("Пожалуйста, введите только цифры.");
    if (amount < process.env.OUT_QIWI)
      return await ctx.reply(
        `Минимальная сумма вывода ${process.env.OUT_QIWI}р. Пожалуйста, введите другую сумму.`
      );
    if (amount > balance)
      return await ctx.reply("У вас недостаточно средств на балансе.");
    if (amount > prizeFound)
      return await ctx.reply(
        "На данный момент мы столкнулись с проблемой автоматического вывода. Пожалуйста, напишите в поддержку для вывода в ручном режиме. @LuckyCatGames"
      );

    ctx.session.state = {
      ...ctx.session.state,
      amount,
    };
    return await ctx.reply("Пожалуйста, введите номер QIWI кошелька.");
  }

  // Если не ввели номер кошелька
  if (!isNumber(+msg.trim()))
    return await ctx.reply("Пожалуйста, введите только цифры.");

  ctx.session.state = {
    ...ctx.session.state,
    wallet: msg,
    activeMsg: await ctx.reply(
      `Вы собираетесь вывести сумму ${ctx.session.state.amount}P на номер кошелька +${msg}.
C вашего баланса спишеться: ${ctx.session.state.amount}
Нажмите "Подтвердить", чтобы произвести выплату.`,
      Extra.markup((m) =>
        m.inlineKeyboard([[m.callbackButton("Подтвердить", "Подтвердить")]])
      )
    ),
  };
});

outQiwi.action("Подтвердить", async (ctx) => {
  if (ctx.session.state.payFlag) return;
  ctx.session.state = {
    ...ctx.session.state,
    payFlag: true,
  };
  await ctx.deleteMessage(ctx.session.state.activeMsg.message_id);
  const amount = ctx.session.state.amount;
  const wallet = ctx.session.state.wallet;
  return await outMoney(amount, `+${wallet}`, ctx.from.id, 99);
});

module.exports = { outQiwi };
