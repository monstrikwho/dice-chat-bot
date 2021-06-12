const { bot } = require("../init/startBot");
const Extra = require("telegraf/extra");
const isNumber = require("is-number");
const moment = require("moment");

const User = require("../models/user");
const MainStats = require("../models/mainstats");

const { saveGames } = require("./saveData");
const extraBoard = require("./slotExtra");

let message = ({ balance, slotCoef }) => `Sonuç katsayıları:

➖	777 durumunda bahsinizin x${slotCoef.x3_7} katını kazanırsınız.
➖	Aynı 3 nesne tutturmanız durumunda bahsinizin x${slotCoef.x3} katını kazanırsınız.
➖	Aynı 2 nesne tutturmanız durumunda bahsinizin x${slotCoef.x2} katını kazanırsı

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
      jek: 0,
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

  game.action(/Bahis oyna/, async (ctx) => {
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

    state.balance -= amountRate;
    state.rate["jek"] += amountRate;
    state.countRate += 1;
    ctx.session.state = state;

    state.rate["jek"] = +state.rate["jek"].toFixed(2);
    state.balance = +state.balance.toFixed(2);

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

  game.action(/(?:5 TL|10 TL|25 TL|50 TL|100 TL)/, async (ctx) => {
    const value = ctx.update.callback_query.data
      .replace(/\D+/, "")
      .replace("TL", "");
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
      return await ctx.answerCbQuery("Bahsin boyutu zaten seçilmiş", true);
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
      return await ctx.reply(
        "Lütfen bahis miktarını değiştirmek için sohbete yazın."
      );
    }

    const rate = Math.floor(+msg);

    if (
      rate === 5 ||
      rate === 10 ||
      rate === 25 ||
      rate === 50 ||
      rate === 100
    ) {
      return await ctx.reply("Bu sayı zaten seçildi. Tekrar seçemezsiniz.");
    }

    if (ctx.session.state.balance < rate) {
      return await ctx.reply("Bakiyenizi aşan bir bahis miktarı giremezsiniz.");
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

  game.action("Kolu çevir 🎰", async (ctx) => {
    const state = ctx.session.state;
    const amountRate = state.rate["jek"];

    if (state.gameStatus) return;

    if (!isNumber(amountRate)) {
      return await ctx.reply("This value is not a number.");
    }

    if (state.countRate === 0) {
      return ctx.answerCbQuery(
        "Bahis oynamadınız. Lütfen çevirmek için bir bahis oynayın.",
        true
      );
    }

    state.gameStatus = true;
    ctx.session.state = state;

    const { slotCoef } = await MainStats.findOne();

    try {
      await ctx.deleteMessage(state.activeBoard.message_id);
    } catch (error) {}
    try {
      await ctx.deleteMessage(state.photoMsg.message_id);
    } catch (error) {}

    const diceMsg = await bot.telegram.sendDice(ctx.from.id, { emoji: "🎰" });
    const value = diceMsg.dice.value;

    let winSum = 0;
    let resMsg =
      "Neredeyse oldu! Vazgeçmeyin, şans bir dahaki sefer sizinle olacak!";

    if (value === 64) {
      winSum = amountRate * slotCoef.x3_7;
      resMsg = "Tebrikler! Kazandın 🎉";
    }

    if (value === 1 || value === 22 || value === 43) {
      winSum = amountRate * slotCoef.x3;
      resMsg = "Tebrikler! Kazandın 🎉";
    }

    const value_x2 = [
      2, 3, 4, 6, 11, 16, 17, 21, 23, 24, 27, 32, 33, 38, 41, 42, 44, 48, 49,
      54, 59, 61, 62, 63,
    ];

    if (value_x2.indexOf(value) !== -1) {
      winSum = amountRate * slotCoef.x2;
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
              m.callbackButton("Tekrar çevir", "Tekrar çevir"),
            ],
          ])
        )
      );
      state.gameStatus = false;
      ctx.session.state = state;
    }, 2000);

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

    if (state.activeGame === "mainGame") {
      saveGames({
        typeGame: "slot",
        typeBalance: state.activeGame,
        result: winSum > 0 ? "win" : "lose",
        rateAmount: amountRate,
        rateWinAmount: winSum.toFixed(2),
        rateValue: value,
        rate: state.rate,
        userId: ctx.from.id,
        date: moment().format("YYYY-MM-DD"),
      });
    }
  });

  game.action(/Başka bir bahis oyna/, async (ctx) => {
    let state = ctx.session.state;

    // Удаляем сообщение "Сделать еще одну ставку"
    try {
      await ctx.deleteMessage(state.activeBoard.message_id);
    } catch (error) {}

    const { mainBalance, demoBalance } = await User.findOne({
      userId: ctx.from.id,
    });

    state.rate = {
      jek: 0,
    };
    state.countRate = 0;
    state.balance = state.activeGame === "mainGame" ? mainBalance : demoBalance;
    state.rateMenu = true;
    ctx.session.state = state;

    if (Boolean(+process.env.DEV)) {
      ctx.session.state.photoMsg = await bot.telegram.sendPhoto(
        ctx.from.id,
        "AgACAgIAAxkBAAIIjWC7sJWlqbL_KYLhNuJz6Qhm9kJaAAKWtDEbC2fgSUCGMmR4SljxJhocpC4AAwEAAwIAA3MAAy_xAQABHwQ"
      );
    } else {
      ctx.session.state.photoMsg = await bot.telegram.sendPhoto(
        ctx.from.id,
        "AgACAgIAAxkBAAMIYLu26v_d8YRocTjxbrFgr-YKtvwAAkC1MRuPweFJvDfgasioU5oebQABny4AAwEAAwIAA3MAA5sYBQABHwQ"
      );
    }

    const extra = await extraBoard(state);
    ctx.session.state.activeBoard = await ctx.reply(message(state), extra);
  });

  game.action(/Tekrar çevir/, async (ctx) => {
    const state = ctx.session.state;
    const amountRate = state.rate["jek"];

    if (state.gameStatus) return;

    if (!isNumber(amountRate)) {
      return await ctx.reply("This value is not a number.");
    }

    if (state.balance - amountRate < 0) {
      return ctx.answerCbQuery("Bakiyenizde yeterli nakitiniz yok", true);
    }

    state.gameStatus = true;
    ctx.session.state = state;

    const { slotCoef } = await MainStats.findOne();

    try {
      await ctx.deleteMessage(ctx.session.state.activeBoard.message_id);
    } catch (error) {}

    const diceMsg = await bot.telegram.sendDice(ctx.from.id, { emoji: "🎰" });
    const value = diceMsg.dice.value;

    let winSum = 0;
    let resMsg =
      "Neredeyse oldu! Vazgeçmeyin, şans bir dahaki sefer sizinle olacak!";

    if (value === 64) {
      winSum = amountRate * slotCoef.x3_7;
      resMsg = "Tebrikler! Kazandın 🎉";
    }

    if (value === 1 || value === 22 || value === 43) {
      winSum = amountRate * slotCoef.x3;
      resMsg = "Tebrikler! Kazandın 🎉";
    }

    const value_x2 = [
      2, 3, 4, 6, 11, 16, 17, 21, 23, 24, 27, 32, 33, 38, 41, 42, 44, 48, 49,
      54, 59, 61, 62, 63,
    ];

    if (value_x2.indexOf(value) !== -1) {
      winSum = amountRate * slotCoef.x2;
      resMsg = "Tebrikler! Kazandın 🎉";
    }

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
              m.callbackButton("Tekrar çevir", "Tekrar çevir"),
            ],
          ])
        )
      );
      state.gameStatus = false;
      ctx.session.state = state;
    }, 2000);

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

    if (state.activeGame === "mainGame") {
      saveGames({
        typeGame: "slot",
        typeBalance: state.activeGame,
        result: winSum > 0 ? "win" : "lose",
        rateAmount: amountRate,
        rateWinAmount: winSum.toFixed(2),
        rateValue: value,
        rate: state.rate,
        userId: ctx.from.id,
        date: moment().format("YYYY-MM-DD"),
      });
    }
  });

  game.on("dice", async (ctx) => {
    if (ctx.update.message.forward_date) return;

    const dice = ctx.update.message.dice;
    if (dice.emoji !== "🎰") return;

    const value = dice.value;
    const state = ctx.session.state;
    const amountRate = state.rate["jek"];

    if (state.gameStatus) return;

    if (!isNumber(amountRate)) {
      return await ctx.reply("This value is not a number.");
    }

    if (state.rateMenu) {
      // Если бросаем после ставки
      if (state.countRate === 0) {
        return ctx.reply(
          "Bahis oynamadınız. Lütfen çevirmek için bir bahis oynayın."
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

    const { slotCoef } = await MainStats.findOne();

    try {
      await ctx.deleteMessage(state.activeBoard.message_id);
    } catch (error) {}
    try {
      await ctx.deleteMessage(state.photoMsg.message_id);
    } catch (error) {}

    let winSum = 0;
    let resMsg =
      "Neredeyse oldu! Vazgeçmeyin, şans bir dahaki sefer sizinle olacak!";

    if (value === 64) {
      winSum = amountRate * slotCoef.x3_7;
      resMsg = "Tebrikler! Kazandın 🎉";
    }

    if (value === 1 || value === 22 || value === 43) {
      winSum = amountRate * slotCoef.x3;
      resMsg = "Tebrikler! Kazandın 🎉";
    }

    const value_x2 = [
      2, 3, 4, 6, 11, 16, 17, 21, 23, 24, 27, 32, 33, 38, 41, 42, 44, 48, 49,
      54, 59, 61, 62, 63,
    ];

    if (value_x2.indexOf(value) !== -1) {
      winSum = amountRate * slotCoef.x2;
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
              m.callbackButton("Bir kez daha zar at", "Bir kez daha zar at"),
            ],
          ])
        )
      );
      state.gameStatus = false;
      ctx.session.state = state;
    }, 2000);

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

    if (state.activeGame === "mainGame") {
      saveGames({
        typeGame: "slot",
        typeBalance: state.activeGame,
        result: winSum > 0 ? "win" : "lose",
        rateAmount: amountRate,
        rateWinAmount: winSum.toFixed(2),
        rateValue: value,
        rate: state.rate,
        userId: ctx.from.id,
        date: moment().format("YYYY-MM-DD"),
      });
    }
  });
};
