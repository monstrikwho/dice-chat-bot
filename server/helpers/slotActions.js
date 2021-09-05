const moment = require("moment");
const isNumber = require("is-number");
const Extra = require("telegraf/extra");

const { bot } = require("../init/startBot");
const { mainMenuActions } = require("../scens/mainMenu.scene");

const User = require("../models/user");
const MainStats = require("../models/mainstats");

const { saveGames } = require("./saveData");
const extraBoard = require("./slotExtra");

module.exports = async (game) => {
  mainMenuActions(game);

  game.leave(async (ctx) => {
    const activeBoard = ctx.session.state.activeBoard;
    try {
      await ctx.deleteMessage(activeBoard.message_id);
    } catch (error) {}
  });

  game.action("🗑 Очистить ставки", async (ctx) => {
    const state = ctx.session.state;

    if (state.countRate === 0) {
      return await ctx.answerCbQuery("Ставок не было", true);
    }

    const { mainBalance, demoBalance } = await User.findOne({
      userId: ctx.from.id,
    });

    // Записываем в стейт начальный стейт и баланс игрока
    ctx.session.state = {
      ...state,
      rate: {
        jek: 0,
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

  game.action(/Поставить/, async (ctx) => {
    const state = ctx.session.state;
    const { valueRate, typeBalance } = state;

    if (state[typeBalance] - valueRate < 0) {
      return await ctx.answerCbQuery(
        "У вас недостаточно средств на балансе",
        true
      );
    }

    state[typeBalance] = +(state[typeBalance] - valueRate).toFixed(2);
    state.rate["jek"] = +(state.rate["jek"] + valueRate).toFixed(2);
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
        jek: 0,
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
      try {
        await ctx.reply(
          "Вы не можете выбрать размер ставки превышающий ваш игровой баланс."
        );
      } catch (error) {}
      return;
    }

    const { minGameRate, slotCoef } = await MainStats.findOne();

    if (rate < minGameRate) {
      try {
        await ctx.reply(`Минимальная сумма ставки составляет ${minGameRate} ₽`);
      } catch (error) {}
      return;
    }

    ctx.session.state.valueRate = rate;

    try {
      await ctx.reply(`Вы успешно выбрали размер ставки: ${rate} ₽`);
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
          "AgACAgIAAxkBAAELz8BhDPHr5BzdYkeMyS3w27Z_jbb7NwAC0LUxG9FSaEiPNb0zl31QeAEAAwIAA3MAAyAE",
          {
            caption: `🎰 Автоматы
Выигрышные комбинации:
- 777 [x${slotCoef.x3_7}]
- 3 в ряд [x${slotCoef.x3}]
- 2 в ряд [x${slotCoef.x2}]`,
            reply_markup: extra,
          }
        );
      } catch (error) {}
    } else {
      try {
        ctx.session.state.activeBoard = await bot.telegram.sendPhoto(
          ctx.from.id,
          "AgACAgIAAxkBAAJGP2EKgoiW-VUkZVWZioc6VzBl3sgvAAKmtDEbwjVRSB0Lf_qKVpvAAQADAgADcwADIAQ",
          {
            caption: `🎰 Автоматы
Выигрышные комбинации:
- 777 [x${slotCoef.x3_7}]
- 3 в ряд [x${slotCoef.x3}]
- 2 в ряд [x${slotCoef.x2}]`,
            reply_markup: extra,
          }
        );
      } catch (error) {}
    }
  });

  game.action("Крутить барабан 🎰", async (ctx) => {
    try {
      const state = ctx.session.state;

      if (state.countRate === 0) {
        return ctx.answerCbQuery(
          "Вы не сделали ставку. Пожалуйста сделайте ставку, чтобы крутить барабан.",
          true
        );
      }

      if (state.gameStatus) return;
      ctx.session.state.gameStatus = true;
      ctx.session.state.rateMenu = false;

      const { slotCoef } = await MainStats.findOne();
      const amountRate = state.rate["jek"];

      try {
        await ctx.deleteMessage(state.activeBoard.message_id);
      } catch (error) {}

      const diceMsg = await bot.telegram.sendDice(ctx.from.id, { emoji: "🎰" });
      const value = diceMsg.dice.value;

      let winSum = 0;
      let resMsg = "Вы были близко! Не сдавайтесь, в следующий раз повезет!";

      if (value === 64) {
        winSum = amountRate * slotCoef.x3_7;
        resMsg = "Поздравляем! Вы выиграли 🎉";
      }

      if (value === 1 || value === 22 || value === 43) {
        winSum = amountRate * slotCoef.x3;
        resMsg = "Поздравляем! Вы выиграли 🎉";
      }

      const value_x2 = [
        2, 3, 4, 6, 11, 16, 17, 21, 23, 24, 27, 32, 33, 38, 41, 42, 44, 48, 49,
        54, 59, 61, 62, 63,
      ];

      if (value_x2.indexOf(value) !== -1) {
        winSum = amountRate * slotCoef.x2;
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
                m.callbackButton("Крутить еще раз", "Крутить еще раз"),
              ],
            ])
          )
        );
        ctx.session.state.gameStatus = false;
      }, 2000);

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
        typeGame: "slot",
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

  game.action("Крутить фриспин", async (ctx) => {
    try {
      const state = ctx.session.state;

      if (state.gameStatus) return;
      ctx.session.state.gameStatus = true;
      ctx.session.state.spins = 0;

      const { slotCoef } = await MainStats.findOne();
      const { spins, mainBalance } = await User.findOne({
        userId: ctx.from.id,
      });
      const amountRate = spins;

      try {
        await ctx.deleteMessage(state.activeBoard.message_id);
      } catch (error) {}

      const diceMsg = await bot.telegram.sendDice(ctx.from.id, { emoji: "🎰" });
      const value = diceMsg.dice.value;

      let winSum = 0;
      let resMsg = "Вы были близко! Не сдавайтесь, в следующий раз повезет!";

      if (value === 64) {
        winSum = amountRate * slotCoef.x3_7;
        resMsg = "Поздравляем! Вы выиграли 🎉";
      }

      if (value === 1 || value === 22 || value === 43) {
        winSum = amountRate * slotCoef.x3;
        resMsg = "Поздравляем! Вы выиграли 🎉";
      }

      const value_x2 = [
        2, 3, 4, 6, 11, 16, 17, 21, 23, 24, 27, 32, 33, 38, 41, 42, 44, 48, 49,
        54, 59, 61, 62, 63,
      ];

      if (value_x2.indexOf(value) !== -1) {
        winSum = amountRate * slotCoef.x2;
        resMsg = "Поздравляем! Вы выиграли 🎉";
      }

      setTimeout(async () => {
        ctx.session.state.activeBoard = await ctx.reply(
          `${resMsg}
        
Ваш выигрыш - ${winSum.toFixed(2)} P
Ваш баланс - ${+(mainBalance + winSum).toFixed(2)} P`,
          Extra.markup((m) =>
            m.inlineKeyboard([
              [
                m.callbackButton(
                  "Сделать новую ставку",
                  "Сделать другую ставку"
                ),
              ],
            ])
          )
        );
        ctx.session.state.gameStatus = false;
      }, 2000);

      await User.updateOne(
        { userId: ctx.from.id },
        { mainBalance: +(mainBalance + winSum).toFixed(2), spins: 0 }
      );

      saveGames({
        typeGame: "slot",
        typeBalance: "mainBalance",
        result: winSum > 0 ? "win" : "lose",
        rateAmount: spins,
        rateWinAmount: +winSum.toFixed(2),
        rateValue: spins,
        rate: { jek: spins },
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
    const { slotCoef } = await MainStats.findOne();

    ctx.session.state = {
      ...state,
      rate: {
        jek: 0,
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
          "AgACAgIAAxkBAAELz8BhDPHr5BzdYkeMyS3w27Z_jbb7NwAC0LUxG9FSaEiPNb0zl31QeAEAAwIAA3MAAyAE",
          {
            caption: `🎰 Автоматы
Выигрышные комбинации:
- 777 [x${slotCoef.x3_7}]
- 3 в ряд [x${slotCoef.x3}]
- 2 в ряд [x${slotCoef.x2}]`,
            reply_markup: extra,
          }
        );
      } catch (error) {}
    } else {
      try {
        ctx.session.state.activeBoard = await bot.telegram.sendPhoto(
          ctx.from.id,
          "AgACAgIAAxkBAAJGP2EKgoiW-VUkZVWZioc6VzBl3sgvAAKmtDEbwjVRSB0Lf_qKVpvAAQADAgADcwADIAQ",
          {
            caption: `🎰 Автоматы
Выигрышные комбинации:
- 777 [x${slotCoef.x3_7}]
- 3 в ряд [x${slotCoef.x3}]
- 2 в ряд [x${slotCoef.x2}]`,
            reply_markup: extra,
          }
        );
      } catch (error) {}
    }
  });

  game.action(/Крутить еще раз/, async (ctx) => {
    try {
      const state = ctx.session.state;

      if (state.gameStatus) return;
      ctx.session.state.gameStatus = true;
      ctx.session.state.rateMenu = false;

      const { slotCoef } = await MainStats.findOne();

      const amountRate = state.rate["jek"];

      if (state[state.typeBalance] - amountRate < 0) {
        return ctx.answerCbQuery(
          "У вас недостаточно средств на счету. Пожалуйста, пополните баланс, либо сделайте другую ставку.",
          true
        );
      }

      try {
        await ctx.deleteMessage(state.activeBoard.message_id);
      } catch (error) {}

      const diceMsg = await bot.telegram.sendDice(ctx.from.id, { emoji: "🎰" });
      const value = diceMsg.dice.value;

      let winSum = 0;
      let resMsg = "Вы были близко! Не сдавайтесь, в следующий раз повезет!";

      if (value === 64) {
        winSum = amountRate * slotCoef.x3_7;
        resMsg = "Поздравляем! Вы выиграли 🎉";
      }

      if (value === 1 || value === 22 || value === 43) {
        winSum = amountRate * slotCoef.x3;
        resMsg = "Поздравляем! Вы выиграли 🎉";
      }

      const value_x2 = [
        2, 3, 4, 6, 11, 16, 17, 21, 23, 24, 27, 32, 33, 38, 41, 42, 44, 48, 49,
        54, 59, 61, 62, 63,
      ];

      if (value_x2.indexOf(value) !== -1) {
        winSum = amountRate * slotCoef.x2;
        resMsg = "Поздравляем! Вы выиграли 🎉";
      }

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
                m.callbackButton("Крутить еще раз", "Крутить еще раз"),
              ],
            ])
          )
        );
        ctx.session.state.gameStatus = false;
      }, 2000);

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
        typeGame: "slot",
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

  game.on("dice", async (ctx) => {
    try {
      if (ctx.update.message.forward_date) return;

      const dice = ctx.update.message.dice;
      if (dice.emoji !== "🎰") return;

      const state = ctx.session.state;

      if (state.gameStatus) return;
      ctx.session.state.gameStatus = true;

      const value = dice.value;
      const amountRate = state.rate["jek"];

      if (state.rateMenu) {
        // Если бросаем после ставки
        if (state.countRate === 0) {
          return ctx.reply(
            "Вы не сделали ставку. Пожалуйста сделайте ставку, чтобы крутить барабан."
          );
        }
        ctx.session.state.rateMenu = false;
      } else {
        // Если хотим бросить еще раз с той же Ставокй
        if (state[state.typeBalance] - amountRate < 0) {
          return ctx.reply(
            "У вас недостаточно средств на счету. Пожалуйста, пополните баланс, либо сделайте ставку меньшим размером."
          );
        }
        ctx.session.state[state.typeBalance] =
          state[state.typeBalance] - amountRate;
      }

      const { slotCoef } = await MainStats.findOne();

      try {
        await ctx.deleteMessage(state.activeBoard.message_id);
      } catch (error) {}

      let winSum = 0;
      let resMsg = "Вы были близко! Не сдавайтесь, в следующий раз повезет!";

      if (value === 64) {
        winSum = amountRate * slotCoef.x3_7;
        resMsg = "Поздравляем! Вы выиграли 🎉";
      }

      if (value === 1 || value === 22 || value === 43) {
        winSum = amountRate * slotCoef.x3;
        resMsg = "Поздравляем! Вы выиграли 🎉";
      }

      const value_x2 = [
        2, 3, 4, 6, 11, 16, 17, 21, 23, 24, 27, 32, 33, 38, 41, 42, 44, 48, 49,
        54, 59, 61, 62, 63,
      ];

      if (value_x2.indexOf(value) !== -1) {
        winSum = amountRate * slotCoef.x2;
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
                m.callbackButton("Крутить еще раз", "Крутить еще раз"),
              ],
            ])
          )
        );
        ctx.session.state.gameStatus = false;
      }, 2000);

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
        typeGame: "slot",
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
};
