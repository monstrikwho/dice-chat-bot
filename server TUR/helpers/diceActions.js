const { bot } = require("../init/startBot");
const Extra = require("telegraf/extra");
const isNumber = require("is-number");
const moment = require("moment");

const User = require("../models/user");
const MainStats = require("../models/mainstats");

const extraBoard = require("./diceExtra");
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

  game.action(/1️⃣.*2️⃣|2️⃣.*1️⃣/, async (ctx) => {
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
    state.rate["1-2"] = +(state.rate["1-2"] + amountRate).toFixed(2);
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

  game.action(/3️⃣.*4️⃣|4️⃣.*3️⃣/, async (ctx) => {
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
    state.rate["3-4"] = +(state.rate["3-4"] + amountRate).toFixed(2);
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

  game.action(/5️⃣.*6️⃣|6️⃣.*5️⃣/, async (ctx) => {
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
    state.rate["5-6"] = +(state.rate["5-6"] + amountRate).toFixed(2);
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

  game.action(/1️⃣/, async (ctx) => {
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
    state.rate[1] = +(state.rate[1] + amountRate).toFixed(2);
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

  game.action(/2️⃣/, async (ctx) => {
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
    state.rate[2] = +(state.rate[2] + amountRate).toFixed(2);
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

  game.action(/3️⃣/, async (ctx) => {
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
    state.rate[3] = +(state.rate[3] + amountRate).toFixed(2);
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

  game.action(/4️⃣/, async (ctx) => {
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
    state.rate[4] = +(state.rate[4] + amountRate).toFixed(2);
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

  game.action(/5️⃣/, async (ctx) => {
    let state = ctx.session.state;

    const amountRate = state.otherRateActive
      ? +state.otherRate
      : +state.valueRate;

    if (state.balaFnce - amountRate < 0) {
      return await ctx.answerCbQuery("Bakiyenizde yeterli nakitiniz yok", true);
    }

    if (amountRate === 0) {
      return await ctx.answerCbQuery("0 TL bahis oynayamazsınız", true);
    }

    state.balance = +(state.balance - amountRate).toFixed(2);
    state.rate[5] = +(state.rate[5] + amountRate).toFixed(2);
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

  game.action(/6️⃣/, async (ctx) => {
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
    state.rate[6] = +(state.rate[6] + amountRate).toFixed(2);
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

  game.action(/Tek/, async (ctx) => {
    let state = ctx.session.state;

    const amountRate = state.otherRateActive
      ? +state.otherRate
      : +state.valueRate;

    if (state.balance - amountRate < 0) {
      return await ctx.answerCbQuery(
        "Bakiyenizde yeterli nakitiniz yok.",
        true
      );
    }

    if (amountRate === 0) {
      return await ctx.answerCbQuery("0 TL bahis oynayamazsınız.", true);
    }

    state.balance = +(state.balance - amountRate).toFixed(2);
    state.rate["odd"] = +(state.rate["odd"] + amountRate).toFixed(2);
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

  game.action(/Çift/, async (ctx) => {
    let state = ctx.session.state;

    const amountRate = state.otherRateActive
      ? +state.otherRate
      : +state.valueRate;

    if (state.balance - amountRate < 0) {
      return await ctx.answerCbQuery(
        "Bakiyenizde yeterli nakitiniz yok.",
        true
      );
    }

    if (amountRate === 0) {
      return await ctx.answerCbQuery("0 TL bahis oynayamazsınız.", true);
    }

    state.balance = +(state.balance - amountRate).toFixed(2);
    state.rate["even"] = +(state.rate["even"] + amountRate).toFixed(2);
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

  game.action(/(?:5 TL|10 TL|25 TL|50 TL|100 TL)/, async (ctx) => {
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
    const msg = ctx.update.message.text.replace(/-/, "");

    if (!ctx.session.state.otherRateActive) return;

    if (!isNumber(msg)) {
      return await ctx.reply("Lütfen yalnızca pozitif sayılar girin.");
    }

    const rate = Math.floor(+msg);

    if (
      rate === 5 ||
      rate === 10 ||
      rate === 25 ||
      rate === 50 ||
      rate === 100
    ) {
      return await ctx.reply("Bu sayı zaten seçildi. Tekrar seçemezsiniz. ");
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

    await ctx.reply(`Minimum bahis tutarınız: ${rate} TL`);

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

  game.action("Zar at 🎲", async (ctx) => {
    const state = ctx.session.state;
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

    if (state.gameStatus) return;

    if (state.countRate === 0) {
      return ctx.answerCbQuery(
        "Bahis oynamadınız. Lütfen zar atmak için bahsinizi yapın.",
        true
      );
    }

    if (!isNumber(amountRate)) {
      return await ctx.reply("This value is not a number.");
    }

    state.gameStatus = true;
    ctx.session.state = state;

    const { diceCoef } = await MainStats.findOne();

    try {
      await ctx.deleteMessage(ctx.session.state.activeBoard.message_id);
    } catch (error) {}
    try {
      await ctx.deleteMessage(ctx.session.state.photoMsg.message_id);
    } catch (error) {}

    const diceMsg = await bot.telegram.sendDice(ctx.from.id, { emoji: "🎲" });
    const value = diceMsg.dice.value;

    let winSum = 0;
    let resMsg = "Bahis oynamadınız. Lütfen zar atmak için bahsinizi yapın.";

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
              m.callbackButton("Bir kez daha zar at", "Bir kez daha zar at"),
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

    if (state.activeGame === "mainGame") {
      saveGames({
        typeGame: "dice",
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

    try {
      await ctx.deleteMessage(state.activeBoard.message_id);
    } catch (error) {}

    const { mainBalance, demoBalance } = await User.findOne({
      userId: ctx.from.id,
    });

    state.rate = {
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
    };
    state.countRate = 0;
    state.balance = state.activeGame === "mainGame" ? mainBalance : demoBalance;
    ctx.session.state = state;
    ctx.session.state.rateMenu = true;

    if (Boolean(+process.env.DEV)) {
      ctx.session.state.photoMsg = await bot.telegram.sendPhoto(
        ctx.from.id,
        "AgACAgIAAxkBAAIDkGCzeYJUYXdMSqY3V8uBr5hVFhUUAAJitDEbH2KhScl0liCHqsJ-PL4GpC4AAwEAAwIAA3MAA8K8AQABHwQ"
      );
    } else {
      ctx.session.state.photoMsg = await bot.telegram.sendPhoto(
        ctx.from.id,
        "AgACAgIAAxkBAAMHYLu2bb4MdQW0sjMk6bJGdX6D67oAAj-1MRuPweFJMQwZnSLsWXaHBo-hLgADAQADAgADcwADc0sDAAEfBA"
      );
    }

    const extra = await extraBoard(state);
    ctx.session.state.activeBoard = await ctx.reply(message(state), extra);
  });

  game.action(/Bir kez daha zar at/, async (ctx) => {
    const state = ctx.session.state;
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

    if (state.gameStatus) return;

    if (!isNumber(amountRate)) {
      return await ctx.reply("This value is not a number.");
    }

    if (state.balance - amountRate < 0) {
      return ctx.answerCbQuery(
        "Hesabınızda yeterli para yok. Lütfen bakiyenizi doldurun.",
        true
      );
    }

    state.gameStatus = true;
    ctx.session.state = state;

    const { diceCoef } = await MainStats.findOne();

    try {
      await ctx.deleteMessage(state.activeBoard.message_id);
    } catch (error) {}

    const diceMsg = await bot.telegram.sendDice(ctx.from.id, { emoji: "🎲" });
    const value = diceMsg.dice.value;

    let winSum = 0;
    let resMsg =
      "Neredeyse oldu! Vazgeçmeyin, şans bir dahaki sefer sizinle olacak!";

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
              m.callbackButton("Bir kez daha zar at", "Bir kez daha zar at"),
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

    if (state.activeGame === "mainGame") {
      saveGames({
        typeGame: "dice",
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
    if (dice.emoji !== "🎲") return;

    const value = dice.value;
    const state = ctx.session.state;
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

    if (state.gameStatus) return;

    if (!isNumber(amountRate)) {
      return await ctx.reply("This value is not a number.");
    }

    if (state.rateMenu) {
      // Если бросаем после ставки
      if (state.countRate === 0) {
        return ctx.reply(
          "Bahis oynamadınız. Lütfen zar atmak için bahsinizi yapın."
        );
      }
      state.rateMenu = false;
    } else {
      // Если хотим бросить еще раз с той же ставкой
      if (state.balance - amountRate < 0) {
        return ctx.reply(
          "Hesabınızda yeterli para yok. Lütfen bakiyenizi doldurun."
        );
      }
      state.balance -= amountRate;
    }

    state.gameStatus = true;
    ctx.session.state = state;

    const { diceCoef } = await MainStats.findOne();

    try {
      await ctx.deleteMessage(state.activeBoard.message_id);
    } catch (error) {}
    try {
      await ctx.deleteMessage(state.photoMsg.message_id);
    } catch (error) {}

    let winSum = 0;
    let resMsg =
      "Neredeyse oldu! Vazgeçmeyin, şans bir dahaki sefer sizinle olacak!";

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

    if (state.activeGame === "mainGame") {
      saveGames({
        typeGame: "dice",
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
