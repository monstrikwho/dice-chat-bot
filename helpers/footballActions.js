const { bot } = require("../init/startBot");
const User = require("../models/user");
const Extra = require("telegraf/extra");

const isNumber = require("is-number");

const extraBoard = require("./footballExtra");

let message = ({ balance }) => `Делайте ваши ставки.
Ваш баланс: ${balance} ₽`;

module.exports = (game) => {
  game.action("🗑 Очистить ставки", async (ctx) => {
    let state = ctx.session.state;

    // Если ставок не было сделано, выбрасываем уведомление
    if (state.countRate === 0)
      return await ctx.answerCbQuery("Ставко не было", true);

    const { mainBalance, demoBalance } = await User.findOne({
      userId: ctx.from.id,
    });

    // Записываем в стейт начальный стейт и баланс игрока
    state.rate = {
      goal: 0,
      out: 0,
    };
    state.countRate = 0;
    state.balance = state.activeGame === "mainGame" ? mainBalance : demoBalance;
    ctx.session.state = state; // Save in session

    // Чистим активный board
    try {
      await bot.telegram.editMessageText(
        ctx.from.id,
        state.activeBoard.message_id,
        null,
        message(state),
        extraBoard(state)
      );
    } catch (error) {
      console.log(error.message);
    }
  });

  game.action(/Забил/, async (ctx) => {
    let state = ctx.session.state;

    const amountRate = state.otherRateActive
      ? +state.otherRate
      : +state.valueRate;

    // Изеняем стейт
    if (state.balance - amountRate < 0) {
      return await ctx.answerCbQuery(
        "У вас недостаточно средств на балансе",
        true
      );
    }

    if (amountRate === 0) {
      return await ctx.answerCbQuery("Вы не можете поставить ставку 0₽", true);
    }

    state.balance = Math.floor((state.balance - amountRate) * 100) / 100;
    state.rate["goal"] += amountRate;
    state.countRate += 1;
    ctx.session.state = state; // Save in session

    // Изменяем активный board
    try {
      await bot.telegram.editMessageText(
        ctx.from.id,
        state.activeBoard.message_id,
        null,
        message(state),
        extraBoard(state)
      );
    } catch (error) {
      console.log(error.message);
    }
  });

  game.action(/Промах/, async (ctx) => {
    let state = ctx.session.state;

    const amountRate = state.otherRateActive
      ? +state.otherRate
      : +state.valueRate;

    // Изеняем стейт
    if (state.balance - amountRate < 0) {
      return await ctx.answerCbQuery(
        "У вас недостаточно средств на балансе",
        true
      );
    }

    if (amountRate === 0) {
      return await ctx.answerCbQuery("Вы не можете поставить ставку 0₽", true);
    }

    state.balance = Math.floor((state.balance - amountRate) * 100) / 100;
    state.rate["out"] += amountRate;
    state.countRate += 1;
    ctx.session.state = state; // Save in session

    // Изменяем активный board
    try {
      await bot.telegram.editMessageText(
        ctx.from.id,
        state.activeBoard.message_id,
        null,
        message(state),
        extraBoard(state)
      );
    } catch (error) {
      console.log(error.message);
    }
  });

  game.action(/(?:10₽|50₽|100₽|500₽|1000₽)/, async (ctx) => {
    const value = ctx.update.callback_query.data
      .replace(/\D+/, "")
      .replace("₽", "");
    let state = ctx.session.state;

    if (state.valueRate === +value)
      return await ctx.answerCbQuery("Размер ставки уже выбран", true);

    // Изеняем стейт
    state.valueRate = +value;
    state.otherRateActive = false;
    ctx.session.state = state; // Save in session

    // Изменяем активный board
    try {
      await bot.telegram.editMessageText(
        ctx.from.id,
        state.activeBoard.message_id,
        null,
        message(state),
        extraBoard(state)
      );
    } catch (error) {
      console.log(error.message);
    }
  });

  game.action(/Другая сумма/, async (ctx) => {
    if (ctx.session.state.otherRateActive && ctx.session.state.otherRate < 1) {
      return await ctx.answerCbQuery(
        "Вы не написали в чат размер ставки.",
        true
      );
    }

    ctx.session.state = {
      ...ctx.session.state,
      valueRate: 0,
      otherRate: 0,
      otherRateActive: true,
    };

    const state = ctx.session.state;

    await ctx.answerCbQuery(
      "Пожалуйста, напишите в чат размер ставки, чтобы изменить ее.",
      true
    );

    // Изменяем активный board
    try {
      await bot.telegram.editMessageText(
        ctx.from.id,
        state.activeBoard.message_id,
        null,
        message(state),
        extraBoard(state)
      );
    } catch (error) {
      console.log(error.message);
    }
  });

  game.on("text", async (ctx) => {
    const msg = ctx.update.message.text.replace(/-/, "");

    if (!ctx.session.state.otherRateActive) return;

    if (!isNumber(msg))
      return await ctx.reply("Пожалуйста, введите только положительные цифры.");

    if (ctx.session.state.balance < msg)
      return await ctx.reply(
        "Вы не можете выбрать размер ставки превышающий ваш игровой баланс."
      );

    if (+msg < +process.env.MIN_RATE) {
      return await ctx.reply(
        `Минимальная сумма ставки составляет ${process.env.MIN_RATE}₽`
      );
    }

    ctx.session.state = {
      ...ctx.session.state,
      valueRate: 0,
      otherRate: msg,
    };

    await ctx.reply(`Вы успешно выбрали размер ставки: ${msg}₽`);

    const state = ctx.session.state;

    // Удаляем сообщение "Сделать еще одну ставку"
    try {
      await ctx.deleteMessage(state.activeBoard.message_id);
    } catch (error) {
      console.log(error.message);
    }

    // Изменяем активный board
    try {
      ctx.session.state.activeBoard = await bot.telegram.sendMessage(
        ctx.from.id,
        message(state),
        extraBoard(state)
      );
    } catch (error) {
      console.log(error.message);
    }
  });

  game.action("Ударить по воротам ⚽️", async (ctx) => {
    const state = ctx.session.state;
    const sumRate = state.rate["out"] + state.rate["goal"];

    if (state.countRate === 0) {
      return ctx.answerCbQuery(
        "Вы не сделали ставку. Пожалуйста сделайте ставку, чтобы ударить мяч.",
        true
      );
    }

    try {
      await ctx.deleteMessage(ctx.session.state.activeBoard.message_id);
    } catch (error) {
      console.log(error.message);
    }

    const diceMsg = await bot.telegram.sendDice(ctx.from.id, { emoji: "⚽️" });
    const value = diceMsg.dice.value;

    let winSum = 0;
    let resMsg = "Вы были близко! Не сдавайесь, в следующий раз повезет!";

    if (value === 3 || value === 4 || value === 5) {
      winSum += state.rate["goal"] * 1.4;
    }

    if (value === 1 || value === 2) {
      winSum += state.rate["out"] * 2.1;
    }

    if (winSum > 0) resMsg = "Поздравляем! Вы выиграли 🎉";

    ctx.session.state.balance += winSum;
    ctx.session.state.rateMenu = false;

    if (state.activeGame === "mainGame") {
      await User.updateOne(
        { userId: ctx.from.id },
        { mainBalance: Math.floor(ctx.session.state.balance * 100) / 100 }
      );
    } else {
      await User.updateOne(
        { userId: ctx.from.id },
        { demoBalance: Math.floor(ctx.session.state.balance * 100) / 100 }
      );
    }

    setTimeout(async () => {
      ctx.session.state.activeBoard = await ctx.reply(
        `${resMsg}
        
  Ваша общая ставка - ${sumRate}
  Ваш выигрыш - ${Math.floor(winSum * 100) / 100}
  Ваш баланс - ${Math.floor(ctx.session.state.balance * 100) / 100}`,
        Extra.markup((m) =>
          m.inlineKeyboard([
            [
              m.callbackButton(
                "Сделать другую ставку",
                "Сделать другую ставку"
              ),
              m.callbackButton("Ударить еще раз", "Ударить еще раз"),
            ],
          ])
        )
      );
    }, 4000);
  });

  game.action(/Сделать другую ставку/, async (ctx) => {
    let state = ctx.session.state;

    // Удаляем сообщение "Сделать еще одну ставку"
    try {
      await ctx.deleteMessage(state.activeBoard.message_id);
    } catch (error) {
      console.log(error.message);
    }

    const { mainBalance, demoBalance } = await User.findOne({
      userId: ctx.from.id,
    });

    state.rate = {
      goal: 0,
      out: 0,
    };
    state.countRate = 0;
    state.balance = state.activeGame === "mainGame" ? mainBalance : demoBalance;
    ctx.session.state = state;
    ctx.session.state.rateMenu = true;

    ctx.session.state.activeBoard = await ctx.reply(
      message(state),
      extraBoard(state)
    );
  });

  game.action(/Ударить еще раз/, async (ctx) => {
    let state = ctx.session.state;
    const sumRate = state.rate["out"] + state.rate["goal"];

    if (state.balance - sumRate < 0) {
      return ctx.answerCbQuery(
        "У вас недостаточно средств на счету. Пожалуйста, пополните баланс, либо сделайте ставку меньшим размером.",
        true
      );
    }

    // Удаляем сообщение "Сделать еще одну ставку"
    try {
      await ctx.deleteMessage(state.activeBoard.message_id);
    } catch (error) {
      console.log(error.message);
    }

    const diceMsg = await bot.telegram.sendDice(ctx.from.id, { emoji: "⚽️" });
    const value = diceMsg.dice.value;

    state.balance -= sumRate;
    ctx.session.state = state;

    let winSum = 0;
    let resMsg = "Вы были близко! Не сдавайесь, в следующий раз повезет!";

    if (value === 3 || value === 4 || value === 5) {
      winSum += state.rate["goal"] * 1.4;
    }

    if (value === 1 || value === 2) {
      winSum += state.rate["out"] * 2.1;
    }

    if (winSum > 0) resMsg = "Поздравляем! Вы выиграли 🎉";

    ctx.session.state.balance += winSum;

    if (state.activeGame === "mainGame") {
      await User.updateOne(
        { userId: ctx.from.id },
        { mainBalance: Math.floor(ctx.session.state.balance * 100) / 100 }
      );
    } else {
      await User.updateOne(
        { userId: ctx.from.id },
        { demoBalance: Math.floor(ctx.session.state.balance * 100) / 100 }
      );
    }

    setTimeout(async () => {
      ctx.session.state.activeBoard = await ctx.reply(
        `${resMsg}
        
  Ваша общая ставка - ${sumRate}
  Ваш выигрыш - ${Math.floor(winSum * 100) / 100}
  Ваш баланс - ${Math.floor(ctx.session.state.balance * 100) / 100}`,
        Extra.markup((m) =>
          m.inlineKeyboard([
            [
              m.callbackButton(
                "Сделать другую ставку",
                "Сделать другую ставку"
              ),
              m.callbackButton("Ударить еще раз", "Ударить еще раз"),
            ],
          ])
        )
      );
    }, 4000);
  });

  game.on("dice", async (ctx) => {
    if (ctx.update.message.forward_date) return;

    const dice = ctx.update.message.dice;

    if (dice.emoji !== "⚽") return;

    const value = dice.value;
    const state = ctx.session.state;
    const amountRate = state.rate["out"] + state.rate["goal"];

    if (state.rateMenu) {
      // Если бросаем после ставки
      if (state.countRate === 0) {
        return ctx.reply(
          "Вы не сделали ставку. Пожалуйста сделайте ставку, чтобы ударить мяч."
        );
      }
      ctx.session.state.rateMenu = false;
    } else {
      // Если хотим бросить еще раз с той же ставкой
      if (state.balance - amountRate < 0) {
        return ctx.reply(
          "У вас недостаточно средств на счету. Пожалуйста, пополните баланс, либо сделайте ставку меньшим размером."
        );
      }
      ctx.session.state.balance -= amountRate;
    }

    try {
      await ctx.deleteMessage(ctx.session.state.activeBoard.message_id);
    } catch (error) {
      console.log(error.message);
    }

    let winSum = 0;
    let resMsg =
      "Вы были близко! Вы были близко! Не сдавайесь, в следующий раз повезет!";

    if (value === 3 || value === 4 || value === 5) {
      winSum += state.rate["goal"] * 1.4;
    }

    if (value === 1 || value === 2) {
      winSum += state.rate["out"] * 2.1;
    }

    if (winSum > 0) resMsg = "Поздравляем! Вы выиграли 🎉";

    ctx.session.state.balance += winSum;

    if (state.activeGame === "mainGame") {
      await User.updateOne(
        { userId: ctx.from.id },
        { mainBalance: Math.floor(ctx.session.state.balance * 100) / 100 }
      );
    } else {
      await User.updateOne(
        { userId: ctx.from.id },
        { demoBalance: Math.floor(ctx.session.state.balance * 100) / 100 }
      );
    }

    setTimeout(async () => {
      ctx.session.state.activeBoard = await ctx.reply(
        `${resMsg}
        
  Ваша общая ставка - ${amountRate}
  Ваш выигрыш - ${Math.floor(winSum * 100) / 100}
  Ваш баланс - ${Math.floor(ctx.session.state.balance * 100) / 100}`,
        Extra.markup((m) =>
          m.inlineKeyboard([
            [
              m.callbackButton(
                "Сделать другую ставку",
                "Сделать другую ставку"
              ),
              m.callbackButton("Ударить еще раз", "Ударить еще раз"),
            ],
          ])
        )
      );
    }, 4000);
  });
};
