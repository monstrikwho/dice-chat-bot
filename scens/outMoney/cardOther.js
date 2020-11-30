const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const isNumber = require("is-number");
const { outMoney } = require("../../helpers/qiwiMethods");

const outCardOther = new Scene("outCardOther");
outCardOther.enter(async (ctx) => {
  return await ctx.reply(
    `Минимальная сумма вывода: ${process.env.OUT_CARD}р. 
Коммисия: 2% + 100р. 
Пожалуйста, введите сумму.`,
    Extra.markup(Markup.keyboard([["↪️ Вернуться назад"]]).resize())
  );
});

outCardOther.on("text", async (ctx) => {
  const msg = ctx.update.message.text;

  if (msg === "↪️ Вернуться назад") {
    return await ctx.scene.enter("outMoney");
  }

  if (ctx.session.state.payFlag) return;

  // Если не ввели сумму для вывода
  if (!ctx.session.state.amount) {
    const amount = +msg.trim();
    const balance = ctx.session.state.mainBalance;
    const prizeFound = ctx.session.state.prizeFound;
    if (!isNumber(amount))
      return await ctx.reply("Пожалуйста, введите только цифры.");
    if (amount < process.env.OUT_CARD)
      return await ctx.reply(
        `Минимальная сумма вывода ${process.env.OUT_CARD}р. Пожалуйста, введите другую сумму.`
      );
    if (amount * 1.02 + 100 > balance)
      return await ctx.reply("У вас недостаточно средств на балансе.");
    if (amount > prizeFound)
      return await ctx.reply(
        "На данный момент мы столкнулись с проблемой автоматического вывода. Пожалуйста, напишите в поддержку для вывода в ручном режиме. @LuckyCatGames"
      );

    ctx.session.state = {
      ...ctx.session.state,
      amount,
    };
    return await ctx.reply("Пожалуйста, введите номер карты.");
  }

  // Если не ввели номер карточки
  if (!ctx.session.state.wallet) {
    if (!isNumber(+msg.trim()))
      return await ctx.reply("Пожалуйста, введите только цифры.");

    ctx.session.state = {
      ...ctx.session.state,
      wallet: +msg.trim(),
    };
    return await ctx.reply(
      `Пожалуйста, введите "Имя Фамилия" держателя карты.
Требуется платежной системой QIWI.`
    );
  }

  // Ввели данные юзера
  ctx.session.state = {
    ...ctx.session.state,
    userInfo: msg.trim().split(" ", 2), // max two value
    activeMsg: await ctx.reply(
      `Вы собираетесь вывести сумму ${
        ctx.session.state.amount
      }P на номер карты ${ctx.session.state.wallet}.
Получатель: ${msg}.
C вашего баланса спишется: ${ctx.session.state.amount * 1.02 + 100}
Нажмите "Подтвердить", чтобы произвести выплату.`,
      Extra.markup((m) =>
        m.inlineKeyboard([[m.callbackButton("Подтвердить", "Подтвердить")]])
      )
    ),
  };
});

outCardOther.action("Подтвердить", async (ctx) => {
  if (!ctx.session.state.activeMsg) return;
  if (ctx.session.state.payFlag) return;
  ctx.session.state = {
    ...ctx.session.state,
    payFlag: true,
  };
  try {
    await ctx.deleteMessage(ctx.session.state.activeMsg.message_id);
    await ctx.scene.enter('lkMenu')
  } catch (error) {
    console.log(error.message);
  }
  const amount = ctx.session.state.amount;
  const wallet = ctx.session.state.wallet;
  const idProvider = ctx.session.state.idProvider;
  const userInfo = ctx.session.state.userInfo;
  return await outMoney(amount, `${wallet}`, ctx.from.id, idProvider, userInfo);
});

module.exports = { outCardOther };
