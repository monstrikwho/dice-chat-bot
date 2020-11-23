const { bot } = require("../init/startBot");
const User = require("../models/user");
const Extra = require("telegraf/extra");

const extraBoard = require("./footballExtra");

let message = ({ balance }) => `Делайте ваши ставки.
Ваш баланс: ${balance} ₽`;

module.exports = (game) => {
  game.action("Очистить ставки", async (ctx) => {
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
    state.valueRate = 1;
    state.countRate = 0;
    state.balance = state.activeGame === "mainGame" ? mainBalance : demoBalance;
    ctx.session.state = state; // Save in session

    // Чистим активный board
    await bot.telegram.editMessageText(
      ctx.from.id,
      state.activeBoard.message_id,
      null,
      message(state),
      extraBoard(state)
    );
  });

  game.action(/Забил/, async (ctx) => {
    let state = ctx.session.state;

    // Изеняем стейт
    if (state.balance - state.valueRate < 0) {
      return await ctx.answerCbQuery(
        "У вас недостаточно средств на балансе",
        true
      );
    } else {
      state.balance -= state.valueRate;
    }
    state.rate["goal"] += state.valueRate;
    state.countRate += 1;
    ctx.session.state = state; // Save in session

    // Изменяем активный board
    await bot.telegram.editMessageText(
      ctx.from.id,
      state.activeBoard.message_id,
      null,
      message(state),
      extraBoard(state)
    );
  });

  game.action(/Промах/, async (ctx) => {
    let state = ctx.session.state;

    // Изеняем стейт
    if (state.balance - state.valueRate < 0) {
      return await ctx.answerCbQuery(
        "У вас недостаточно средств на балансе",
        true
      );
    } else {
      state.balance -= state.valueRate;
    }
    state.rate["out"] += state.valueRate;
    state.countRate += 1;
    ctx.session.state = state; // Save in session

    // Изменяем активный board
    await bot.telegram.editMessageText(
      ctx.from.id,
      state.activeBoard.message_id,
      null,
      message(state),
      extraBoard(state)
    );
  });

  game.action(/(?:1₽|5₽|10₽|50₽|100₽|500₽)/, async (ctx) => {
    const value = ctx.update.callback_query.data
      .replace(/\D+/, "")
      .replace("₽", "");
    let state = ctx.session.state;

    if (state.valueRate === +value)
      return await ctx.answerCbQuery("Размер ставки уже выбран", true);

    // Изеняем стейт
    state.valueRate = +value;
    ctx.session.state = state; // Save in session

    // Изменяем активный board
    await bot.telegram.editMessageText(
      ctx.from.id,
      state.activeBoard.message_id,
      null,
      message(state),
      extraBoard(state)
    );
  });

  game.action("Ударить по воротам ⚽️", async (ctx) => {
    const state = ctx.session.state;

    if (state.countRate === 0) {
      return ctx.answerCbQuery(
        "Вы не сделали ставку. Пожалуйста сделайте ставку, чтобы ударить мяч.",
        true
      );
    }

    await ctx.deleteMessage(ctx.session.state.activeBoard.message_id);

    const diceMsg = await bot.telegram.sendDice(ctx.from.id, { emoji: "⚽️" });
    const value = diceMsg.dice.value;

    let winSum = 0;

    if (value === 3 || value === 5) {
      winSum += state.rate["goal"] * 2.25;
    }

    if (value === 1 || value === 2 || value === 4) {
      winSum += state.rate["out"] * 1.5;
    }

    ctx.session.state.balance += winSum;

    if (state.activeGame === "mainGame") {
      await User.updateOne(
        { userId: ctx.from.id },
        { mainBalance: ctx.session.state.balance }
      );
    } else {
      await User.updateOne(
        { userId: ctx.from.id },
        { demoBalance: ctx.session.state.balance }
      );
    }

    ctx.session.state.activeBoard = await ctx.reply(
      `Ваш выигрыш: ${winSum}`,
      Extra.markup((m) =>
        m.inlineKeyboard([
          [
            m.callbackButton(
              "Сделать еще одну ставку",
              "Сделать еще одну ставку"
            ),
          ],
        ])
      )
    );
  });

  bot.action(/Сделать еще одну ставку/, async (ctx) => {
    let state = ctx.session.state;

    // Удаляем сообщение "Сделать еще одну ставку"
    await ctx.deleteMessage(state.activeBoard.message_id);

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

    ctx.session.state.activeBoard = await ctx.reply(
      message(state),
      extraBoard(state)
    );
  });
};
