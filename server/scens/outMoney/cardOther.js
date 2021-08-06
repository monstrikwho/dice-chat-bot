const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const isNumber = require("is-number");
const { outMoney } = require("../../helpers/qiwiMethods");
const MainStats = require("../../models/mainstats");

const outCardOther = new Scene("outCardOther");
outCardOther.enter(async (ctx) => {
  const { minOut, outPercent } = await MainStats.findOne({});

  try {
    await ctx.reply(
      `Минимальная сумма вывода: ${minOut.card} P. 
 Коммисия: ${2 + outPercent}% + 100р. 
 Пожалуйста, введите сумму.`,
      Extra.markup(Markup.keyboard([["↪️ Вернуться назад"]]).resize())
    );
  } catch (error) {}
});

outCardOther.on("text", async (ctx) => {
  const msg = ctx.update.message.text;

  if (msg === "↪️ Вернуться назад") {
    return await ctx.scene.enter("outMoney");
  }

  const { minOut, outPercent } = await MainStats.findOne({});

  if (ctx.session.state.payFlag) return;

  if (msg === "Подтвердить") {
    if (!ctx.session.state.activeMsg) return;
    ctx.session.state = {
      ...ctx.session.state,
      payFlag: true,
    };
    try {
      await ctx.deleteMessage(ctx.session.state.activeMsg.message_id);
    } catch (error) {}

    await ctx.scene.enter("lkMenu");

    const amount = ctx.session.state.amount;
    const wallet = ctx.session.state.wallet;
    const idProvider = ctx.session.state.idProvider;
    const userInfo = ctx.session.state.userInfo;

    // Отправляем запрос на вывод
    return await outMoney(
      amount,
      `${wallet}`,
      ctx.from.id,
      idProvider,
      userInfo
    );
  }

  if (ctx.session.state.activeMsg) {
    try {
      await ctx.reply(
        'Пожалуйста, напишите в чат слово "Подтвердить", чтобы произвести операцию.'
      );
    } catch (error) {}
    return;
  }

  // Если не ввели сумму для вывода
  if (!ctx.session.state.amount) {
    const amount = +msg.trim();
    const balance = ctx.session.state.mainBalance;
    const prizeFound = ctx.session.state.prizeFound;
    if (!isNumber(amount)) {
      try {
        await ctx.reply("Пожалуйста, введите только цифры.");
      } catch (error) {}
      return;
    }
    if (amount < minOut.card) {
      try {
        await ctx.reply(
          `Минимальная сумма вывода ${minOut.card} P. Пожалуйста, введите другую сумму.`
        );
      } catch (error) {}
      return;
    }
    if (amount * (1.02 + outPercent / 100) + 100 > balance) {
      try {
        await ctx.reply("У вас недостаточно средств на балансе.");
      } catch (error) {}
      return;
    }
    if (amount > prizeFound) {
      try {
        await ctx.reply(
          "На данный момент мы столкнулись с проблемой автоматического вывода. Пожалуйста, напишите в поддержку для вывода в ручном режиме. @LuckyCatGames"
        );
      } catch (error) {}
      return;
    }

    try {
      await ctx.reply("Пожалуйста, введите номер карты.");
    } catch (error) {}

    ctx.session.state = {
      ...ctx.session.state,
      amount,
    };
  }

  // Если не ввели номер карточки
  if (!ctx.session.state.wallet) {
    if (!isNumber(+msg.trim())) {
      try {
        await ctx.reply("Пожалуйста, введите только цифры.");
      } catch (error) {}
      return;
    }

    ctx.session.state = {
      ...ctx.session.state,
      wallet: +msg.trim(),
    };

    try {
      await ctx.reply(
        `Пожалуйста, введите "Имя Фамилия" держателя карты.
(Требуется платежной системой QIWI)`
      );
    } catch (error) {}
    return;
  }

  let activeMsg = null;
  try {
    activeMsg = await ctx.reply(
      `Вы собираетесь вывести сумму ${
        ctx.session.state.amount
      }P на номер карты ${ctx.session.state.wallet}.
Получатель: ${msg}.
C вашего баланса спишется: ${
        ctx.session.state.amount * (1.02 + outPercent / 100) + 100
      }
❕ Пожалуйста, напишите в чат "Подтвердить", чтобы произвести выплату.`
    );
  } catch (error) {}

  // Ввели данные юзера
  ctx.session.state = {
    ...ctx.session.state,
    userInfo: msg.trim().split(" ", 2), // max two value
    activeMsg,
  };
});

module.exports = { outCardOther };
