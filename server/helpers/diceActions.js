const moment = require("moment");
const isNumber = require("is-number");
const Extra = require("telegraf/extra");

const { bot } = require("../init/startBot");
const { mainMenuActions } = require("../scens/mainMenu.scene");

const User = require("../models/user");
const MainStats = require("../models/mainstats");

const extraBoard = require("./diceExtra");
const { saveGames } = require("./saveData");

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

    // Если ставок не было сделано, выбрасываем уведомление
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
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        "1-2": 0,
        "3-4": 0,
        "5-6": 0,
        even: 0,
        odd: 0,
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

  game.action(/1️⃣.*2️⃣|2️⃣.*1️⃣/, async (ctx) => {
    const state = ctx.session.state;
    const { valueRate, typeBalance } = ctx.session.state;

    if (state[typeBalance] - valueRate < 0) {
      return await ctx.answerCbQuery(
        "У вас недостаточно средств на балансе",
        true
      );
    }

    state[typeBalance] = +(state[typeBalance] - valueRate).toFixed(2);
    state.rate["1-2"] = +(state.rate["1-2"] + valueRate).toFixed(2);
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

  game.action(/3️⃣.*4️⃣|4️⃣.*3️⃣/, async (ctx) => {
    const state = ctx.session.state;
    const { valueRate, typeBalance } = ctx.session.state;

    if (state[typeBalance] - valueRate < 0) {
      return await ctx.answerCbQuery(
        "У вас недостаточно средств на балансе",
        true
      );
    }

    state[typeBalance] = +(state[typeBalance] - valueRate).toFixed(2);
    state.rate["3-4"] = +(state.rate["3-4"] + valueRate).toFixed(2);
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

  game.action(/5️⃣.*6️⃣|6️⃣.*5️⃣/, async (ctx) => {
    const { valueRate, typeBalance } = ctx.session.state;
    const state = ctx.session.state;

    if (state[typeBalance] - valueRate < 0) {
      return await ctx.answerCbQuery(
        "У вас недостаточно средств на балансе",
        true
      );
    }

    state[typeBalance] = +(state[typeBalance] - valueRate).toFixed(2);
    state.rate["5-6"] = +(state.rate["5-6"] + valueRate).toFixed(2);
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

  game.action(/1️⃣/, async (ctx) => {
    const state = ctx.session.state;
    const { valueRate, typeBalance } = ctx.session.state;

    if (state[typeBalance] - valueRate < 0) {
      return await ctx.answerCbQuery(
        "У вас недостаточно средств на балансе",
        true
      );
    }

    state[typeBalance] = +(state[typeBalance] - valueRate).toFixed(2);
    state.rate[1] = +(state.rate[1] + valueRate).toFixed(2);
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

  game.action(/2️⃣/, async (ctx) => {
    const state = ctx.session.state;
    const { valueRate, typeBalance } = ctx.session.state;

    if (state[typeBalance] - valueRate < 0) {
      return await ctx.answerCbQuery(
        "У вас недостаточно средств на балансе",
        true
      );
    }

    state[typeBalance] = +(state[typeBalance] - valueRate).toFixed(2);
    state.rate[2] = +(state.rate[2] + valueRate).toFixed(2);
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

  game.action(/3️⃣/, async (ctx) => {
    const state = ctx.session.state;
    const { valueRate, typeBalance } = ctx.session.state;

    if (state[typeBalance] - valueRate < 0) {
      return await ctx.answerCbQuery(
        "У вас недостаточно средств на балансе",
        true
      );
    }

    state[typeBalance] = +(state[typeBalance] - valueRate).toFixed(2);
    state.rate[3] = +(state.rate[3] + valueRate).toFixed(2);
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

  game.action(/4️⃣/, async (ctx) => {
    const state = ctx.session.state;
    const { valueRate, typeBalance } = ctx.session.state;

    if (state[typeBalance] - valueRate < 0) {
      return await ctx.answerCbQuery(
        "У вас недостаточно средств на балансе",
        true
      );
    }

    state[typeBalance] = +(state[typeBalance] - valueRate).toFixed(2);
    state.rate[4] = +(state.rate[4] + valueRate).toFixed(2);
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

  game.action(/5️⃣/, async (ctx) => {
    const state = ctx.session.state;
    const { valueRate, typeBalance } = ctx.session.state;

    if (state[typeBalance] - valueRate < 0) {
      return await ctx.answerCbQuery(
        "У вас недостаточно средств на балансе",
        true
      );
    }

    state[typeBalance] = +(state[typeBalance] - valueRate).toFixed(2);
    state.rate[5] = +(state.rate[5] + valueRate).toFixed(2);
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

  game.action(/6️⃣/, async (ctx) => {
    const state = ctx.session.state;
    const { valueRate, typeBalance } = ctx.session.state;

    if (state[typeBalance] - valueRate < 0) {
      return await ctx.answerCbQuery(
        "У вас недостаточно средств на балансе",
        true
      );
    }

    state[typeBalance] = +(state[typeBalance] - valueRate).toFixed(2);
    state.rate[6] = +(state.rate[6] + valueRate).toFixed(2);
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

  game.action(/Нечетное/, async (ctx) => {
    const state = ctx.session.state;
    const { valueRate, typeBalance } = ctx.session.state;

    if (state[typeBalance] - valueRate < 0) {
      return await ctx.answerCbQuery(
        "У вас недостаточно средств на балансе",
        true
      );
    }

    state[typeBalance] = +(state[typeBalance] - valueRate).toFixed(2);
    state.rate["odd"] = +(state.rate["odd"] + valueRate).toFixed(2);
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

  game.action(/Четное/, async (ctx) => {
    const state = ctx.session.state;
    const { valueRate, typeBalance } = ctx.session.state;

    if (state[typeBalance] - valueRate < 0) {
      return await ctx.answerCbQuery(
        "У вас недостаточно средств на балансе",
        true
      );
    }

    state[typeBalance] = +(state[typeBalance] - valueRate).toFixed(2);
    state.rate["even"] = +(state.rate["even"] + valueRate).toFixed(2);
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
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        "1-2": 0,
        "3-4": 0,
        "5-6": 0,
        even: 0,
        odd: 0,
      },
      countRate: 0,
      mainBalance,
      demoBalance,
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
        await ctx.reply("Пожалуйста, введите только положительные цифры.");
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

    const { minGameRate } = await MainStats.findOne();

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

    if (process.env.DEV !== "true") {
      try {
        ctx.session.state.activeBoard = await bot.telegram.sendPhoto(
          ctx.from.id,
          "AgACAgIAAxkBAANTYTdzkFGEw1O88AS-e2u8EBLI800AAn-_MRv4AAG4SSPCrwtbiQAB8AEAAwIAA3MAAyAE",
          {
            caption: `🎲 Кости`,
            reply_markup: extra,
          }
        );
      } catch (error) {}
    } else {
      try {
        ctx.session.state.activeBoard = await bot.telegram.sendPhoto(
          ctx.from.id,
          "AgACAgIAAxkBAAJFQmEKQEnKpAhODrELdR9KrJyUK3E5AAJCtDEbwjVRSGX1h1IAAfjqPwEAAwIAA3MAAyAE",
          {
            caption: `🎲 Кости`,
            reply_markup: extra,
          }
        );
      } catch (error) {}
    }
  });

  game.action("Бросить кости 🎲", async (ctx) => {
    try {
      const state = ctx.session.state;

      if (state.countRate === 0) {
        return ctx.answerCbQuery(
          "Вы не сделали ставку. Пожалуйста сделайте ставку, чтобы бросить кости.",
          true
        );
      }

      if (state.gameStatus) return;
      ctx.session.state.gameStatus = true;
      ctx.session.state.rateMenu = false;

      const { diceCoef } = await MainStats.findOne();

      const amountRate =
        state.rate[1] +
        state.rate[2] +
        state.rate[3] +
        state.rate[4] +
        state.rate[5] +
        state.rate[6] +
        state.rate["1-2"] +
        state.rate["3-4"] +
        state.rate["5-6"] +
        state.rate["odd"] +
        state.rate["even"];

      try {
        await ctx.deleteMessage(state.activeBoard.message_id);
      } catch (error) {}

      const diceMsg = await bot.telegram.sendDice(ctx.from.id, { emoji: "🎲" });
      const value = diceMsg.dice.value;

      let winSum = 0;
      let resMsg = "Вы были близко! Не сдавайтесь, в следующий раз повезет!";

      if (value === 1) {
        winSum +=
          state.rate[1] * diceCoef.one +
          state.rate["1-2"] * diceCoef.two +
          state.rate["odd"] * diceCoef.evenodd;
      }
      if (value === 2) {
        winSum +=
          state.rate[2] * diceCoef.one +
          state.rate["1-2"] * diceCoef.two +
          state.rate["even"] * diceCoef.evenodd;
      }
      if (value === 3) {
        winSum +=
          state.rate[3] * diceCoef.one +
          state.rate["3-4"] * diceCoef.two +
          state.rate["odd"] * diceCoef.evenodd;
      }
      if (value === 4) {
        winSum +=
          state.rate[4] * diceCoef.one +
          state.rate["3-4"] * diceCoef.two +
          state.rate["even"] * diceCoef.evenodd;
      }
      if (value === 5) {
        winSum +=
          state.rate[5] * diceCoef.one +
          state.rate["5-6"] * diceCoef.two +
          state.rate["odd"] * diceCoef.evenodd;
      }
      if (value === 6) {
        winSum +=
          state.rate[6] * diceCoef.one +
          state.rate["5-6"] * diceCoef.two +
          state.rate["even"] * diceCoef.evenodd;
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
                m.callbackButton(
                  "Бросить кости еще раз",
                  "Бросить кости еще раз"
                ),
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
        typeGame: "dice",
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
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        "1-2": 0,
        "3-4": 0,
        "5-6": 0,
        even: 0,
        odd: 0,
      },
      countRate: 0,
      mainBalance,
      demoBalance,
      rateMenu: true,
    };

    const extra = await extraBoard(ctx.session.state);

    if (process.env.DEV !== "true") {
      try {
        ctx.session.state.activeBoard = await bot.telegram.sendPhoto(
          ctx.from.id,
          "AgACAgIAAxkBAANTYTdzkFGEw1O88AS-e2u8EBLI800AAn-_MRv4AAG4SSPCrwtbiQAB8AEAAwIAA3MAAyAE",
          {
            caption: `🎲 Кости`,
            reply_markup: extra,
          }
        );
      } catch (error) {}
    } else {
      try {
        ctx.session.state.activeBoard = await bot.telegram.sendPhoto(
          ctx.from.id,
          "AgACAgIAAxkBAAJFQmEKQEnKpAhODrELdR9KrJyUK3E5AAJCtDEbwjVRSGX1h1IAAfjqPwEAAwIAA3MAAyAE",
          {
            caption: `🎲 Кости`,
            reply_markup: extra,
          }
        );
      } catch (error) {}
    }
  });

  game.action(/Бросить кости еще раз/, async (ctx) => {
    try {
      const state = ctx.session.state;

      if (state.gameStatus) return;
      ctx.session.state.gameStatus = true;
      ctx.session.state.rateMenu = false;

      const { diceCoef } = await MainStats.findOne();

      const amountRate =
        state.rate[1] +
        state.rate[2] +
        state.rate[3] +
        state.rate[4] +
        state.rate[5] +
        state.rate[6] +
        state.rate["1-2"] +
        state.rate["3-4"] +
        state.rate["5-6"] +
        state.rate["odd"] +
        state.rate["even"];

      if (state[state.typeBalance] - amountRate < 0) {
        return ctx.answerCbQuery(
          "У вас недостаточно средств на счету. Пожалуйста, пополните баланс, либо сделайте ставку меньшим размером.",
          true
        );
      }

      try {
        await ctx.deleteMessage(state.activeBoard.message_id);
      } catch (error) {}

      const diceMsg = await bot.telegram.sendDice(ctx.from.id, { emoji: "🎲" });
      const value = diceMsg.dice.value;

      let winSum = 0;
      let resMsg = "Вы были близко! Не сдавайтесь, в следующий раз повезет!";

      if (value === 1) {
        winSum +=
          state.rate[1] * diceCoef.one +
          state.rate["1-2"] * diceCoef.two +
          state.rate["odd"] * diceCoef.evenodd;
      }
      if (value === 2) {
        winSum +=
          state.rate[2] * diceCoef.one +
          state.rate["1-2"] * diceCoef.two +
          state.rate["even"] * diceCoef.evenodd;
      }
      if (value === 3) {
        winSum +=
          state.rate[3] * diceCoef.one +
          state.rate["3-4"] * diceCoef.two +
          state.rate["odd"] * diceCoef.evenodd;
      }
      if (value === 4) {
        winSum +=
          state.rate[4] * diceCoef.one +
          state.rate["3-4"] * diceCoef.two +
          state.rate["even"] * diceCoef.evenodd;
      }
      if (value === 5) {
        winSum +=
          state.rate[5] * diceCoef.one +
          state.rate["5-6"] * diceCoef.two +
          state.rate["odd"] * diceCoef.evenodd;
      }
      if (value === 6) {
        winSum +=
          state.rate[6] * diceCoef.one +
          state.rate["5-6"] * diceCoef.two +
          state.rate["even"] * diceCoef.evenodd;
      }

      if (winSum > 0) {
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
                m.callbackButton(
                  "Бросить кости еще раз",
                  "Бросить кости еще раз"
                ),
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
        typeGame: "dice",
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
      if (dice.emoji !== "🎲") return;

      const state = ctx.session.state;

      if (state.gameStatus) return;
      ctx.session.state.gameStatus = true;

      const value = dice.value;
      const amountRate =
        state.rate[1] +
        state.rate[2] +
        state.rate[3] +
        state.rate[4] +
        state.rate[5] +
        state.rate[6] +
        state.rate["1-2"] +
        state.rate["3-4"] +
        state.rate["5-6"] +
        state.rate["odd"] +
        state.rate["even"];

      if (state.rateMenu) {
        // Если бросаем после ставки
        if (state.countRate === 0) {
          return await ctx.reply(
            "Вы не сделали ставку. Пожалуйста сделайте ставку, чтобы бросить кости."
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

      const { diceCoef } = await MainStats.findOne();

      try {
        await ctx.deleteMessage(state.activeBoard.message_id);
      } catch (error) {}

      let winSum = 0;
      let resMsg = "Вы были близко! Не сдавайтесь, в следующий раз повезет!";

      if (value === 1) {
        winSum +=
          state.rate[1] * diceCoef.one +
          state.rate["1-2"] * diceCoef.two +
          state.rate["odd"] * diceCoef.evenodd;
      }
      if (value === 2) {
        winSum +=
          state.rate[2] * diceCoef.one +
          state.rate["1-2"] * diceCoef.two +
          state.rate["even"] * diceCoef.evenodd;
      }
      if (value === 3) {
        winSum +=
          state.rate[3] * diceCoef.one +
          state.rate["3-4"] * diceCoef.two +
          state.rate["odd"] * diceCoef.evenodd;
      }
      if (value === 4) {
        winSum +=
          state.rate[4] * diceCoef.one +
          state.rate["3-4"] * diceCoef.two +
          state.rate["even"] * diceCoef.evenodd;
      }
      if (value === 5) {
        winSum +=
          state.rate[5] * diceCoef.one +
          state.rate["5-6"] * diceCoef.two +
          state.rate["odd"] * diceCoef.evenodd;
      }
      if (value === 6) {
        winSum +=
          state.rate[6] * diceCoef.one +
          state.rate["5-6"] * diceCoef.two +
          state.rate["even"] * diceCoef.evenodd;
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
                m.callbackButton(
                  "Бросить кости еще раз",
                  "Бросить кости еще раз"
                ),
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
        typeGame: "dice",
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
