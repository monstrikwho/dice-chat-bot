const moment = require("moment");
const isNumber = require("is-number");
const Extra = require("telegraf/extra");

const { bot } = require("../init/startBot");
const { mainMenuActions } = require("../scens/mainMenu.scene");

const User = require("../models/user");
const MainStats = require("../models/mainstats");

const { saveGames } = require("./saveData");
const extraBoard = require("./footballExtra");

module.exports = async (game) => {
  mainMenuActions(game);

  game.leave(async (ctx) => {
    const activeBoard = ctx.session.state.activeBoard;
    try {
      await ctx.deleteMessage(activeBoard.message_id);
    } catch (error) {}
  });

  game.action("🗑 Очистить ставки", async (ctx) => {
    let state = ctx.session.state;

    if (state.countRate === 0) {
      return await ctx.answerCbQuery("Ставко не было", true);
    }

    const { mainBalance, demoBalance } = await User.findOne({
      userId: ctx.from.id,
    });

    // Записываем в стейт начальный стейт и баланс игрока
    ctx.session.state = {
      ...state,
      rate: {
        goal: 0,
        out: 0,
      },
      countRate: 0,
      mainBalance,
      demoBalance,
    };

    const extra = await extraBoard(ctx.session.state);

    // Чистим активный board
    try {
      await bot.telegram.editMessageReplyMarkup(
        ctx.from.id,
        state.activeBoard.message_id,
        null,
        extra
      );
    } catch (error) {}
  });

  game.action(/Забил/, async (ctx) => {
    const state = ctx.session.state;
    const { valueRate, typeBalance } = state;

    if (state[typeBalance] - valueRate < 0) {
      return await ctx.answerCbQuery(
        "У вас недостаточно средств на балансе",
        true
      );
    }

    state[typeBalance] = +(state[typeBalance] - valueRate).toFixed(2);
    state.rate["goal"] = +(state.rate["goal"] + valueRate).toFixed(2);
    state.countRate += 1;
    ctx.session.state = { ...state };

    const extra = await extraBoard(ctx.session.state);

    // Изменяем активный board
    try {
      await bot.telegram.editMessageReplyMarkup(
        ctx.from.id,
        state.activeBoard.message_id,
        null,
        extra
      );
    } catch (error) {}
  });

  game.action(/Промах/, async (ctx) => {
    const state = ctx.session.state;
    const { valueRate, typeBalance } = state;

    if (state[typeBalance] - valueRate < 0) {
      return await ctx.answerCbQuery(
        "У вас недостаточно средств на балансе",
        true
      );
    }

    state[typeBalance] = +(state[typeBalance] - valueRate).toFixed(2);
    state.rate["out"] = +(state.rate["out"] + valueRate).toFixed(2);
    state.countRate += 1;
    ctx.session.state = state;

    const extra = await extraBoard(ctx.session.state);

    // Изменяем активный board
    try {
      await bot.telegram.editMessageReplyMarkup(
        ctx.from.id,
        state.activeBoard.message_id,
        null,
        extra
      );
    } catch (error) {}
  });

  game.action(/(?:10₽|50₽|100₽|500₽|1000₽)/, async (ctx) => {
    const state = ctx.session.state;
    const value = +ctx.update.callback_query.data.match(/\d+/g)[0];

    if (state.valueRate === value) {
      if (ctx.update.callback_query) {
        await ctx.answerCbQuery();
      }
      return;
    }

    ctx.session.state.valueRate = value;

    const extra = await extraBoard(ctx.session.state);

    // Изменяем активный board
    try {
      await bot.telegram.editMessageReplyMarkup(
        ctx.from.id,
        state.activeBoard.message_id,
        null,
        extra
      );
    } catch (error) {}
  });

  game.action(/(?:\[Main]|\[Demo])/, async (ctx) => {
    const state = ctx.session.state;

    const value = ctx.update.callback_query.data.match(/(?:Main|Demo)/)[0];
    const type = value === "Main" ? "mainBalance" : "demoBalance";

    if (state.typeBalance === type) {
      if (ctx.update.callback_query) {
        await ctx.answerCbQuery();
      }
      return;
    }

    const { mainBalance, demoBalance } = await User.findOne({
      userId: ctx.from.id,
    });

    ctx.session.state = {
      ...state,
      rate: {
        goal: 0,
        out: 0,
      },
      countRate: 0,
      demoBalance,
      mainBalance,
      typeBalance: type,
    };

    const extra = await extraBoard(ctx.session.state);

    // Изменяем активный board
    try {
      await bot.telegram.editMessageReplyMarkup(
        ctx.from.id,
        state.activeBoard.message_id,
        null,
        extra
      );
    } catch (error) {}
  });

  game.on("text", async (ctx) => {
    const state = ctx.session.state;
    const msg = +ctx.update.message.text;

    if (!isNumber(msg)) {
      try {
        await ctx.reply(
          "Пожалуйста, введите только положительные цифры цифры."
        );
      } catch (error) {}
      return;
    }

    const rate = +msg.toFixed(2);

    if (state[state.typeBalance] < rate) {
      return await ctx.reply(
        "Вы не можете выбрать размер ставки превышающий ваш игровой баланс."
      );
    }

    const { minGameRate } = await MainStats.findOne();

    if (rate < minGameRate) {
      try {
        await ctx.reply(`Минимальная сумма ставки составляет ${minGameRate}₽`);
      } catch (error) {}
      return;
    }

    ctx.session.state.valueRate = rate;

    try {
      await ctx.reply(`Вы успешно выбрали размер ставки: ${rate}₽`);
    } catch (error) {}

    try {
      await ctx.deleteMessage(state.activeBoard.message_id);
    } catch (error) {}

    const extra = await extraBoard(ctx.session.state);

    // Изменяем активный board
    if (process.env.DEV !== "true") {
      try {
        ctx.session.state.activeBoard = await bot.telegram.sendPhoto(
          ctx.from.id,
          "AgACAgIAAxkBAAELz75hDPFbFqOoq19HcyfQRZxetgYazAACyrUxG9FSaEhnM091tDxpEwEAAwIAA3MAAyAE",
          {
            caption: `⚽️ SOLOGAME`,
            reply_markup: extra,
          }
        );
      } catch (error) {}
    } else {
      try {
        ctx.session.state.activeBoard = await bot.telegram.sendPhoto(
          ctx.from.id,
          "AgACAgIAAxkBAAJGiGEKjSkKqf8KXfroKBeNfKzvJO9kAAJJtDEbwjVRSJSFOM7nIvVTAQADAgADcwADIAQ",
          {
            caption: `⚽️ SOLOGAME`,
            reply_markup: extra,
          }
        );
      } catch (error) {}
    }
  });

  game.action("Ударить по воротам ⚽️", async (ctx) => {
    try {
      const state = ctx.session.state;

      if (state.countRate === 0) {
        return ctx.answerCbQuery(
          "Вы не сделали ставку. Пожалуйста сделайте ставку, чтобы ударить мяч.",
          true
        );
      }

      if (state.gameStatus) return;
      ctx.session.state.gameStatus = true;
      ctx.session.state.rateMenu = false;

      const { footballCoef } = await MainStats.findOne();
      const amountRate = +(state.rate["out"] + state.rate["goal"]).toFixed(2);

      try {
        await ctx.deleteMessage(state.activeBoard.message_id);
      } catch (error) {}

      const diceMsg = await bot.telegram.sendDice(ctx.from.id, {
        emoji: "⚽️",
      });
      const value = diceMsg.dice.value;

      let winSum = 0;
      let resMsg = "Вы были близко! Не сдавайесь, в следующий раз повезет!";

      if (value === 3 || value === 4 || value === 5) {
        winSum += state.rate["goal"] * footballCoef.goal;
      }

      if (value === 1 || value === 2) {
        winSum += state.rate["out"] * footballCoef.out;
      }

      if (winSum > 0) {
        resMsg = "Поздравляем! Вы выиграли 🎉";
      }

      ctx.session.state[state.typeBalance] = +(
        state[state.typeBalance] + winSum
      ).toFixed(2);

      setTimeout(async () => {
        ctx.session.state.activeBoard = await ctx.reply(
          `${resMsg}
            
Ваш выигрыш - ${winSum.toFixed(2)} P
Ваш баланс - ${state[state.typeBalance]} P`,
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
        ctx.session.state.gameStatus = false;
      }, 4000);

      if (state.typeBalance === "mainBalance") {
        await User.updateOne(
          { userId: ctx.from.id },
          { mainBalance: state.mainBalance }
        );
      }
      if (state.typeBalance === "demoBalance") {
        await User.updateOne(
          { userId: ctx.from.id },
          { demoBalance: state.demoBalance }
        );
      }

      saveGames({
        typeGame: "football",
        typeBalance: state.typeBalance,
        result: winSum > 0 ? "win" : "lose",
        rateAmount: amountRate,
        rateWinAmount: +winSum.toFixed(2),
        rateValue: value,
        rate: state.rate,
        userId: ctx.from.id,
        date: moment().format("YYYY-MM-DD HH:mm:ss"),
      });
    } catch (error) {}
  });

  game.action(/Сделать другую ставку/, async (ctx) => {
    const state = ctx.session.state;

    try {
      await ctx.deleteMessage(state.activeBoard.message_id);
    } catch (error) {}

    const { mainBalance, demoBalance } = await User.findOne({
      userId: ctx.from.id,
    });

    ctx.session.state = {
      ...state,
      rate: {
        goal: 0,
        out: 0,
      },
      countRate: 0,
      rateMenu: true,
      mainBalance,
      demoBalance,
    };

    const extra = await extraBoard(ctx.session.state);

    if (process.env.DEV !== "true") {
      try {
        ctx.session.state.activeBoard = await bot.telegram.sendPhoto(
          ctx.from.id,
          "AgACAgIAAxkBAAELz75hDPFbFqOoq19HcyfQRZxetgYazAACyrUxG9FSaEhnM091tDxpEwEAAwIAA3MAAyAE",
          {
            caption: `⚽️ SOLOGAME`,
            reply_markup: extra,
          }
        );
      } catch (error) {}
    } else {
      try {
        ctx.session.state.activeBoard = await bot.telegram.sendPhoto(
          ctx.from.id,
          "AgACAgIAAxkBAAJGiGEKjSkKqf8KXfroKBeNfKzvJO9kAAJJtDEbwjVRSJSFOM7nIvVTAQADAgADcwADIAQ",
          {
            caption: `⚽️ SOLOGAME`,
            reply_markup: extra,
          }
        );
      } catch (error) {}
    }
  });

  game.action(/Ударить еще раз/, async (ctx) => {
    const state = ctx.session.state;

    if (state.gameStatus) return;
    ctx.session.state.gameStatus = true;
    ctx.session.state.rateMenu = false;

    const { footballCoef } = await MainStats.findOne();
    const amountRate = +(state.rate["out"] + state.rate["goal"]).toFixed(2);

    if (state[state.typeBalance] - amountRate < 0) {
      return ctx.answerCbQuery(
        "У вас недостаточно средств на счету. Пожалуйста, пополните баланс, либо сделайте другую ставку.",
        true
      );
    }

    try {
      await ctx.deleteMessage(state.activeBoard.message_id);
    } catch (error) {}

    const diceMsg = await bot.telegram.sendDice(ctx.from.id, {
      emoji: "⚽️",
    });
    const value = diceMsg.dice.value;

    let winSum = 0;
    let resMsg = "Вы были близко! Не сдавайесь, в следующий раз повезет!";

    if (value === 3 || value === 4 || value === 5) {
      winSum += state.rate["goal"] * footballCoef.goal;
    }

    if (value === 1 || value === 2) {
      winSum += state.rate["out"] * footballCoef.out;
    }

    if (winSum > 0) resMsg = "Поздравляем! Вы выиграли 🎉";

    ctx.session.state[state.typeBalance] = +(
      state[state.typeBalance] -
      amountRate +
      winSum
    ).toFixed(2);

    setTimeout(async () => {
      ctx.session.state.activeBoard = await ctx.reply(
        `${resMsg}
          
Ваш выигрыш - ${winSum.toFixed(2)} P
Ваш баланс - ${state[state.typeBalance]} P`,
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
      ctx.session.state.gameStatus = false;
    }, 4000);

    if (state.typeBalance === "mainBalance") {
      await User.updateOne(
        { userId: ctx.from.id },
        { mainBalance: state.mainBalance }
      );
    }
    if (state.typeBalance === "demoBalance") {
      await User.updateOne(
        { userId: ctx.from.id },
        { demoBalance: state.demoBalance }
      );
    }

    saveGames({
      typeGame: "football",
      typeBalance: state.typeBalance,
      result: winSum > 0 ? "win" : "lose",
      rateAmount: amountRate,
      rateWinAmount: +winSum.toFixed(2),
      rateValue: value,
      rate: state.rate,
      userId: ctx.from.id,
      date: moment().format("YYYY-MM-DD HH:mm:ss"),
    });
  });

  game.on("dice", async (ctx) => {
    if (ctx.update.message.forward_date) return;

    const dice = ctx.update.message.dice;
    if (dice.emoji !== "⚽") return;

    const state = ctx.session.state;

    if (state.gameStatus) return;
    ctx.session.state.gameStatus = true;

    const value = dice.value;
    const amountRate = +(state.rate["out"] + state.rate["goal"]).toFixed(2);

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
      if (state[state.typeBalance] - amountRate < 0) {
        return ctx.reply(
          "У вас недостаточно средств на счету. Пожалуйста, пополните баланс, либо сделайте ставку меньшим размером."
        );
      }
      ctx.session.state[state.typeBalance] =
        state[state.typeBalance] - amountRate;
    }

    const { footballCoef } = await MainStats.findOne();

    try {
      await ctx.deleteMessage(state.activeBoard.message_id);
    } catch (error) {}

    let winSum = 0;
    let resMsg = "Вы были близко! Не сдавайесь, в следующий раз повезет!";

    if (value === 3 || value === 4 || value === 5) {
      winSum += state.rate["goal"] * footballCoef.goal;
    }

    if (value === 1 || value === 2) {
      winSum += state.rate["out"] * footballCoef.out;
    }

    if (winSum > 0) {
      resMsg = "Поздравляем! Вы выиграли 🎉";
    }

    ctx.session.state[state.typeBalance] = +(
      state[state.typeBalance] + winSum
    ).toFixed(2);

    setTimeout(async () => {
      ctx.session.state.activeBoard = await ctx.reply(
        `${resMsg}
          
Ваш выигрыш - ${winSum.toFixed(2)} P
Ваш баланс - ${state[state.typeBalance]} P`,
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
      ctx.session.state.gameStatus = false;
    }, 4000);

    if (state.typeBalance === "mainBalance") {
      await User.updateOne(
        { userId: ctx.from.id },
        { mainBalance: state.mainBalance }
      );
    }
    if (state.typeBalance === "demoBalance") {
      await User.updateOne(
        { userId: ctx.from.id },
        { demoBalance: state.demoBalance }
      );
    }

    saveGames({
      typeGame: "football",
      typeBalance: state.typeBalance,
      result: winSum > 0 ? "win" : "lose",
      rateAmount: amountRate,
      rateWinAmount: +winSum.toFixed(2),
      rateValue: value,
      rate: state.rate,
      userId: ctx.from.id,
      date: moment().format("YYYY-MM-DD HH:mm:ss"),
    });
  });
};
