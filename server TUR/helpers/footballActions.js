const { bot } = require("../init/startBot");
const Extra = require("telegraf/extra");
const isNumber = require("is-number");
const moment = require("moment");

const User = require("../models/user");
const MainStats = require("../models/mainstats");

const extraBoard = require("./footballExtra");
const { saveGames } = require("./saveData");

let message = ({ balance }) => `Bahislerinizi yapın.
Bakineyiz: ${balance} TL`;

module.exports = async (game) => {
  game.action("🗑 Bahisleri sıfırla", async (ctx) => {
    let state = ctx.session.state;

    // Если ставок не было сделано, выбрасываем уведомление
    if (state.countRate === 0) {
      return await ctx.answerCbQuery("Bahis yok", true);
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
    state.balance = state.activeGame === "mainGame" ? mainBalance : demoBalance;
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

  game.action(/Gol/, async (ctx) => {
    let state = ctx.session.state;

    const amountRate = state.otherRateActive
      ? +state.otherRate
      : +state.valueRate;

    if (state.balance - amountRate < 0) {
      return await ctx.answerCbQuery("Bakiyenizde yeterli nakitiniz yok", true);
    }

    if (amountRate === 0) {
      return await ctx.answerCbQuery("0 TL bahis oynayamazsınız", true);
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

  game.action(/Kaçırdın/, async (ctx) => {
    let state = ctx.session.state;

    const amountRate = state.otherRateActive
      ? +state.otherRate
      : +state.valueRate;

    if (state.balance - amountRate < 0) {
      return await ctx.answerCbQuery("Bakiyenizde yeterli nakitiniz yok", true);
    }
    if (amountRate === 0) {
      return await ctx.answerCbQuery("0 TL bahis oynayamazsınız", true);
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

  game.action(/(?:5 TL|10 TL|50 TL|100 TL|500 TL)/, async (ctx) => {
    const value = ctx.update.callback_query.data
      .replace(/\D+/, "")
      .replace("₽", "");
    let state = ctx.session.state;

    if (state.valueRate === +value) {
      return await ctx.answerCbQuery("Bahsin boyutu zaten seçilmiş", true);
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

  game.action(/Diğer tutar/, async (ctx) => {
    if (ctx.session.state.otherRateActive && ctx.session.state.otherRate < 1) {
      return await ctx.answerCbQuery("Bahis miktarını girmediniz", true);
    }

    ctx.session.state = {
      ...ctx.session.state,
      valueRate: 0,
      otherRate: 0,
      otherRateActive: true,
    };

    const state = ctx.session.state;

    await ctx.answerCbQuery(
      "Lütfen bahis miktarını değiştirmek için sohbete yazın.",
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
      return await ctx.reply("Lütfen yalnızca pozitif sayılar girin.");
    }

    const rate = +(+msg).toFixed(2);

    if (
      rate === 10 ||
      rate === 50 ||
      rate === 100 ||
      rate === 500 ||
      rate === 1000
    ) {
      return await ctx.reply("Lütfen yalnızca pozitif sayılar girin.");
    }

    if (ctx.session.state.balance < rate) {
      return await ctx.reply("Lütfen yalnızca pozitif sayılar girin.");
    }

    const { minGameRate } = await MainStats.findOne();

    if (rate < minGameRate) {
      return await ctx.reply(`Minimum bahis tutarınız: ${minGameRate} TL`);
    }

    ctx.session.state = {
      ...ctx.session.state,
      valueRate: 0,
      otherRate: rate,
    };

    await ctx.reply(`Bahis tutarını başarıyla seçtiniz: ${rate} TL`);

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

  game.action("Topa vur ⚽️", async (ctx) => {
    const state = ctx.session.state;
    const amountRate = +(state.rate["out"] + state.rate["goal"]).toFixed(2);

    if (state.gameStatus) return;

    if (state.countRate === 0) {
      return ctx.answerCbQuery(
        "Bahis oynamadınız. Lütfen zar atmak için bahsinizi yapın.",
        true
      );
    }

    state.gameStatus = true;
    ctx.session.state = state;

    const { footballCoef } = await MainStats.findOne();

    try {
      await ctx.deleteMessage(ctx.session.state.activeBoard.message_id);
    } catch (error) {}

    const diceMsg = await bot.telegram.sendDice(ctx.from.id, {
      emoji: "⚽️",
    });
    const value = diceMsg.dice.value;

    let winSum = 0;
    let resMsg =
      "Neredeyse oldu! Vazgeçmeyin, şans bir dahaki sefer sizinle olacak!";

    if (value === 3 || value === 4 || value === 5) {
      winSum += state.rate["goal"] * footballCoef.goal;
    }

    if (value === 1 || value === 2) {
      winSum += state.rate["out"] * footballCoef.out;
    }

    if (winSum > 0) {
      resMsg = "Tebrikler! Kazandın 🎉";
    }

    state.rateMenu = false;
    state.balance = +(state.balance + winSum).toFixed(2);
    ctx.session.state = state;

    setTimeout(async () => {
      ctx.session.state.activeBoard = await ctx.reply(
        `${resMsg}
          
Kazancınız - ${winSum.toFixed(2)}
Bakiyeniz - ${state.balance}`,
        Extra.markup((m) =>
          m.inlineKeyboard([
            [
              m.callbackButton("Başka bir bahis oyna", "Başka bir bahis oyna"),
              m.callbackButton("Bir kez daha vur", "Bir kez daha vur"),
            ],
          ])
        )
      );
      state.gameStatus = false;
      ctx.session.state = state;
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
      rateWinAmount: winSum.toFixed(2),
      rateValue: value,
      rate: state.rate,
      userId: ctx.chat.id,
      date: moment().format("YYYY-MM-DD"),
    });
  });

  game.action(/Başka bir bahis oyna/, async (ctx) => {
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
    state.balance = state.activeGame === "mainGame" ? mainBalance : demoBalance;
    ctx.session.state = state;
    ctx.session.state.rateMenu = true;

    const extra = await extraBoard(state);

    ctx.session.state.activeBoard = await ctx.reply(message(state), extra);
  });

  game.action(/Bir kez daha vur/, async (ctx) => {
    const state = ctx.session.state;
    const amountRate = +(state.rate["out"] + state.rate["goal"]).toFixed(2);

    if (state.gameStatus) return;

    if (state.balance - amountRate < 0) {
      return ctx.answerCbQuery("Bakiyenizde yeterli nakitiniz yok", true);
    }

    state.gameStatus = true;
    ctx.session.state = state;

    const { footballCoef } = await MainStats.findOne();

    try {
      await ctx.deleteMessage(state.activeBoard.message_id);
    } catch (error) {}

    const diceMsg = await bot.telegram.sendDice(ctx.from.id, {
      emoji: "⚽️",
    });
    const value = diceMsg.dice.value;

    let winSum = 0;
    let resMsg =
      "Neredeyse oldu! Vazgeçmeyin, şans bir dahaki sefer sizinle olacak!";

    if (value === 3 || value === 4 || value === 5) {
      winSum += state.rate["goal"] * footballCoef.goal;
    }

    if (value === 1 || value === 2) {
      winSum += state.rate["out"] * footballCoef.out;
    }

    if (winSum > 0) resMsg = "Tebrikler! Kazandın 🎉";

    state.rateMenu = false;
    state.balance = +(state.balance - amountRate + winSum).toFixed(2);
    ctx.session.state = state;

    setTimeout(async () => {
      ctx.session.state.activeBoard = await ctx.reply(
        `${resMsg}
          
Kazancınız - ${winSum.toFixed(2)}
Bakiyeniz - ${state.balance}`,
        Extra.markup((m) =>
          m.inlineKeyboard([
            [
              m.callbackButton("Başka bir bahis oyna", "Başka bir bahis oyna"),
              m.callbackButton("Bir kez daha vur", "Bir kez daha vur"),
            ],
          ])
        )
      );
      state.gameStatus = false;
      ctx.session.state = state;
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
      rateWinAmount: winSum.toFixed(2),
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

    if (state.gameStatus) return;

    if (state.rateMenu) {
      // Если бросаем после ставки
      if (state.countRate === 0) {
        return ctx.reply(
          "Bahis oynamadınız. Lütfen topa vurmak için bahis oynayın."
        );
      }
      state.rateMenu = false;
    } else {
      // Если хотим бросить еще раз с той же ставкой
      if (state.balance - amountRate < 0) {
        return ctx.reply("Bakiyenizde yeterli nakitiniz yok");
      }
      state.balance -= amountRate;
    }

    state.gameStatus = true;
    ctx.session.state = state;

    const { footballCoef } = await MainStats.findOne();

    try {
      await ctx.deleteMessage(state.activeBoard.message_id);
    } catch (error) {}

    let winSum = 0;
    let resMsg =
      "Neredeyse oldu! Vazgeçmeyin, şans bir dahaki sefer sizinle olacak!";

    if (value === 3 || value === 4 || value === 5) {
      winSum += state.rate["goal"] * footballCoef.goal;
    }

    if (value === 1 || value === 2) {
      winSum += state.rate["out"] * footballCoef.out;
    }

    if (winSum > 0) {
      resMsg = "Tebrikler! Kazandın 🎉";
    }

    state.balance = +(state.balance + winSum).toFixed(2);
    ctx.session.state = state;

    setTimeout(async () => {
      ctx.session.state.activeBoard = await ctx.reply(
        `${resMsg}
          
Kazancınız - ${winSum.toFixed(2)}
Bakiyeniz - ${state.balance}`,
        Extra.markup((m) =>
          m.inlineKeyboard([
            [
              m.callbackButton("Başka bir bahis oyna", "Başka bir bahis oyna"),
              m.callbackButton("Bir kez daha vur", "Bir kez daha vur"),
            ],
          ])
        )
      );
      state.gameStatus = false;
      ctx.session.state = state;
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
      rateWinAmount: winSum.toFixed(2),
      rateValue: value,
      rate: state.rate,
      userId: ctx.chat.id,
      date: moment().format("YYYY-MM-DD"),
    });
  });
};
