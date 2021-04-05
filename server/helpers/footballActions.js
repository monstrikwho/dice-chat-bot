const { bot } = require("../init/startBot");
const Extra = require("telegraf/extra");
const isNumber = require("is-number");
const moment = require("moment");

const User = require("../models/user");
const MainStats = require("../models/mainstats");
const Error = require("../models/errors");

const extraBoard = require("./footballExtra");
const { saveGames } = require("./saveData");

let message = ({ balance }) => `Делайте ваши ставки.
Ваш баланс: ${balance} ₽`;

module.exports = async (game) => {
  try {
    game.action("🗑 Очистить ставки", async (ctx) => {
      let state = ctx.session.state;

      // Если ставок не было сделано, выбрасываем уведомление
      if (state.countRate === 0) {
        return await ctx.answerCbQuery("Ставко не было", true);
      }

      const { mainBalance, demoBalance } = await User.findOne({
        userId: ctx.from.id,
      });

      // Записываем в стейт начальный стейт и баланс игрока
      state.rate = {
        goal: 0,
        out: 0,
      };
      state.countRate = 0;
      state.balance =
        state.activeGame === "mainGame" ? mainBalance : demoBalance;
      ctx.session.state = state;

      const extra = await extraBoard(state);

      // Чистим активный board
      try {
        await bot.telegram.editMessageText(
          ctx.from.id,
          state.activeBoard.message_id,
          null,
          message(state),
          extra
        );
      } catch (error) {}
    });

    game.action(/Забил/, async (ctx) => {
      let state = ctx.session.state;

      const amountRate = state.otherRateActive
        ? +state.otherRate
        : +state.valueRate;

      if (state.balance - amountRate < 0) {
        return await ctx.answerCbQuery(
          "У вас недостаточно средств на балансе",
          true
        );
      }

      if (amountRate === 0) {
        return await ctx.answerCbQuery(
          "Вы не можете поставить ставку 0₽",
          true
        );
      }

      state.balance = +(state.balance - amountRate).toFixed(2);
      state.rate["goal"] = +(state.rate["goal"] + amountRate).toFixed(2);
      state.countRate += 1;
      ctx.session.state = state;

      const extra = await extraBoard(state);

      // Изменяем активный board
      try {
        await bot.telegram.editMessageText(
          ctx.from.id,
          state.activeBoard.message_id,
          null,
          message(state),
          extra
        );
      } catch (error) {}
    });

    game.action(/Промах/, async (ctx) => {
      let state = ctx.session.state;

      const amountRate = state.otherRateActive
        ? +state.otherRate
        : +state.valueRate;

      if (state.balance - amountRate < 0) {
        return await ctx.answerCbQuery(
          "У вас недостаточно средств на балансе",
          true
        );
      }
      if (amountRate === 0) {
        return await ctx.answerCbQuery(
          "Вы не можете поставить ставку 0₽",
          true
        );
      }

      state.balance = +(state.balance - amountRate).toFixed(2);
      state.rate["out"] = +(state.rate["out"] + amountRate).toFixed(2);
      state.countRate += 1;
      ctx.session.state = state;

      const extra = await extraBoard(state);

      // Изменяем активный board
      try {
        await bot.telegram.editMessageText(
          ctx.from.id,
          state.activeBoard.message_id,
          null,
          message(state),
          extra
        );
      } catch (error) {}
    });

    game.action(/(?:10₽|50₽|100₽|500₽|1000₽)/, async (ctx) => {
      const value = ctx.update.callback_query.data
        .replace(/\D+/, "")
        .replace("₽", "");
      let state = ctx.session.state;

      if (state.valueRate === +value) {
        return await ctx.answerCbQuery("Размер ставки уже выбран", true);
      }

      state.valueRate = +value;
      state.otherRateActive = false;
      ctx.session.state = state;

      const extra = await extraBoard(state);

      // Изменяем активный board
      try {
        await bot.telegram.editMessageText(
          ctx.from.id,
          state.activeBoard.message_id,
          null,
          message(state),
          extra
        );
      } catch (error) {}
    });

    game.action(/Другая сумма/, async (ctx) => {
      if (
        ctx.session.state.otherRateActive &&
        ctx.session.state.otherRate < 1
      ) {
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

      const extra = await extraBoard(state);

      // Изменяем активный board
      try {
        await bot.telegram.editMessageText(
          ctx.from.id,
          state.activeBoard.message_id,
          null,
          message(state),
          extra
        );
      } catch (error) {}
    });

    game.on("text", async (ctx) => {
      const msg = ctx.update.message.text;

      if (!ctx.session.state.otherRateActive) return;

      if (!isNumber(msg)) {
        return await ctx.reply(
          "Пожалуйста, введите только положительные цифры."
        );
      }

      const rate = +(+msg).toFixed(2);

      if (
        rate === 10 ||
        rate === 50 ||
        rate === 100 ||
        rate === 500 ||
        rate === 1000
      ) {
        return await ctx.reply(
          "Вы не можете выбрать сумму из уже имеющихся в борде."
        );
      }

      if (ctx.session.state.balance < rate) {
        return await ctx.reply(
          "Вы не можете выбрать размер ставки превышающий ваш игровой баланс."
        );
      }

      const { minGameRate } = await MainStats.findOne();

      if (rate < minGameRate) {
        return await ctx.reply(
          `Минимальная сумма ставки составляет ${minGameRate}₽`
        );
      }

      ctx.session.state = {
        ...ctx.session.state,
        valueRate: 0,
        otherRate: rate,
      };

      await ctx.reply(`Вы успешно выбрали размер ставки: ${rate}₽`);

      const state = ctx.session.state;

      // Удаляем сообщение "Сделать еще одну ставку"
      try {
        await ctx.deleteMessage(state.activeBoard.message_id);
      } catch (error) {}

      const extra = await extraBoard(state);

      // Изменяем активный board
      try {
        ctx.session.state.activeBoard = await bot.telegram.sendMessage(
          ctx.from.id,
          message(state),
          extra
        );
      } catch (error) {}
    });

    game.action("Ударить по воротам ⚽️", async (ctx) => {
      const state = ctx.session.state;
      const amountRate = +(state.rate["out"] + state.rate["goal"]).toFixed(2);

      if (state.countRate === 0) {
        return ctx.answerCbQuery(
          "Вы не сделали ставку. Пожалуйста сделайте ставку, чтобы ударить мяч.",
          true
        );
      }

      const { footballCoef } = await MainStats.findOne();

      try {
        await ctx.deleteMessage(ctx.session.state.activeBoard.message_id);
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

      winSum = +winSum.toFixed(2);

      state.rateMenu = false;
      state.balance = +(state.balance + winSum).toFixed(2);
      ctx.session.state = state;

      setTimeout(async () => {
        ctx.session.state.activeBoard = await ctx.reply(
          `${resMsg}
          
  Ваша общая ставка - ${amountRate}
  Ваш выигрыш - ${winSum}
  Ваш баланс - ${state.balance}`,
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

      if (state.activeGame === "mainGame") {
        await User.updateOne(
          { userId: ctx.from.id },
          { mainBalance: state.balance }
        );
      }
      if (state.activeGame === "demoGame") {
        await User.updateOne(
          { userId: ctx.from.id },
          { demoBalance: state.balance }
        );
      }
      saveGames({
        typeGame: "football",
        typeBalance: state.activeGame,
        result: winSum > 0 ? "win" : "lose",
        rateAmount: amountRate,
        rateWinAmount: winSum,
        rateValue: value,
        rate: state.rate,
        userId: ctx.chat.id,
        date: moment().format("YYYY-MM-DD"),
      });
    });

    game.action(/Сделать другую ставку/, async (ctx) => {
      let state = ctx.session.state;

      try {
        await ctx.deleteMessage(state.activeBoard.message_id);
      } catch (error) {}

      const { mainBalance, demoBalance } = await User.findOne({
        userId: ctx.from.id,
      });

      state.rate = {
        goal: 0,
        out: 0,
      };
      state.countRate = 0;
      state.balance =
        state.activeGame === "mainGame" ? mainBalance : demoBalance;
      ctx.session.state = state;
      ctx.session.state.rateMenu = true;

      const extra = await extraBoard(state);

      ctx.session.state.activeBoard = await ctx.reply(message(state), extra);
    });

    game.action(/Ударить еще раз/, async (ctx) => {
      let state = ctx.session.state;
      const amountRate = +(state.rate["out"] + state.rate["goal"]).toFixed(2);

      if (state.balance - amountRate < 0) {
        return ctx.answerCbQuery(
          "У вас недостаточно средств на счету. Пожалуйста, пополните баланс, либо сделайте другую ставку.",
          true
        );
      }

      const { footballCoef } = await MainStats.findOne();

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

      winSum = +winSum.toFixed(2);

      state.rateMenu = false;
      state.balance = +(state.balance - amountRate + winSum).toFixed(2);
      ctx.session.state = state;

      setTimeout(async () => {
        ctx.session.state.activeBoard = await ctx.reply(
          `${resMsg}
          
    Ваша общая ставка - ${amountRate}
    Ваш выигрыш - ${winSum}
    Ваш баланс - ${state.balance}`,
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

      if (state.activeGame === "mainGame") {
        await User.updateOne(
          { userId: ctx.from.id },
          { mainBalance: state.balance }
        );
      }
      if (state.activeGame === "demoGame") {
        await User.updateOne(
          { userId: ctx.from.id },
          { demoBalance: state.balance }
        );
      }
      saveGames({
        typeGame: "football",
        typeBalance: state.activeGame,
        result: winSum > 0 ? "win" : "lose",
        rateAmount: amountRate,
        rateWinAmount: winSum,
        rateValue: value,
        rate: state.rate,
        userId: ctx.chat.id,
        date: moment().format("YYYY-MM-DD"),
      });
    });

    game.on("dice", async (ctx) => {
      if (ctx.update.message.forward_date) return;

      const dice = ctx.update.message.dice;
      if (dice.emoji !== "⚽") return;

      const value = dice.value;
      const state = ctx.session.state;
      const amountRate = +(state.rate["out"] + state.rate["goal"]).toFixed(2);

      if (state.rateMenu) {
        // Если бросаем после ставки
        if (state.countRate === 0) {
          return ctx.reply(
            "Вы не сделали ставку. Пожалуйста сделайте ставку, чтобы ударить мяч."
          );
        }
        state.rateMenu = false;
      } else {
        // Если хотим бросить еще раз с той же ставкой
        if (state.balance - amountRate < 0) {
          return ctx.reply(
            "У вас недостаточно средств на счету. Пожалуйста, пополните баланс, либо сделайте ставку меньшим размером."
          );
        }
        state.balance -= amountRate;
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

      winSum = +winSum.toFixed(2);

      state.balance = +(state.balance + winSum).toFixed(2);
      ctx.session.state = state;

      setTimeout(async () => {
        ctx.session.state.activeBoard = await ctx.reply(
          `${resMsg}
          
  Ваша общая ставка - ${amountRate}
  Ваш выигрыш - ${winSum}
  Ваш баланс - ${state.balance}`,
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

      if (state.activeGame === "mainGame") {
        await User.updateOne(
          { userId: ctx.from.id },
          { mainBalance: state.balance }
        );
      }
      if (state.activeGame === "demoGame") {
        await User.updateOne(
          { userId: ctx.from.id },
          { demoBalance: state.balance }
        );
      }
      saveGames({
        typeGame: "football",
        typeBalance: state.activeGame,
        result: winSum > 0 ? "win" : "lose",
        rateAmount: amountRate,
        rateWinAmount: winSum,
        rateValue: value,
        rate: state.rate,
        userId: ctx.chat.id,
        date: moment().format("YYYY-MM-DD"),
      });
    });
  } catch (error) {
    const err = new Error({
      message: error.message,
      err: error,
    });
    await err.save();
  }
};
