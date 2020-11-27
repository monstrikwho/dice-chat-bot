const { bot } = require("../init/startBot");
const User = require("../models/user");
const Extra = require("telegraf/extra");

const isNumber = require("is-number");

const extraBoard = require("./diceExtra");

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

  // 1-2
  game.action(/1️⃣.*2️⃣|2️⃣.*1️⃣/, async (ctx) => {
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
    state.balance = Math.floor((state.balance - amountRate) * 100) / 100;
    state.rate["1-2"] += amountRate;
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

  // 3-4
  game.action(/3️⃣.*4️⃣|4️⃣.*3️⃣/, async (ctx) => {
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
    state.balance = Math.floor((state.balance - amountRate) * 100) / 100;
    state.rate["3-4"] += amountRate;
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

  // 5-6
  game.action(/5️⃣.*6️⃣|6️⃣.*5️⃣/, async (ctx) => {
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
    state.balance = Math.floor((state.balance - amountRate) * 100) / 100;
    state.rate["5-6"] += amountRate;
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

  game.action(/1️⃣/, async (ctx) => {
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
    state.balance = Math.floor((state.balance - amountRate) * 100) / 100;
    state.rate[1] += amountRate;
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

  game.action(/2️⃣/, async (ctx) => {
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
    state.balance = Math.floor((state.balance - amountRate) * 100) / 100;
    state.rate[2] += amountRate;
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

  game.action(/3️⃣/, async (ctx) => {
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
    state.balance = Math.floor((state.balance - amountRate) * 100) / 100;
    state.rate[3] += amountRate;
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

  game.action(/4️⃣/, async (ctx) => {
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
    state.balance = Math.floor((state.balance - amountRate) * 100) / 100;
    state.rate[4] += amountRate;
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

  game.action(/5️⃣/, async (ctx) => {
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
    state.balance = Math.floor((state.balance - amountRate) * 100) / 100;
    state.rate[5] += amountRate;
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

  game.action(/6️⃣/, async (ctx) => {
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
    state.balance = Math.floor((state.balance - amountRate) * 100) / 100;
    state.rate[6] += amountRate;
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

  game.action(/Нечетное/, async (ctx) => {
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
    state.balance = Math.floor((state.balance - amountRate) * 100) / 100;
    state.rate["odd"] += amountRate;
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

  game.action(/Четное/, async (ctx) => {
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

    state.balance = Math.floor((state.balance - amountRate) * 100) / 100;
    state.rate["even"] += amountRate;
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
    await bot.telegram.editMessageText(
      ctx.from.id,
      state.activeBoard.message_id,
      null,
      message(state),
      extraBoard(state)
    );
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
    await bot.telegram.editMessageText(
      ctx.from.id,
      state.activeBoard.message_id,
      null,
      message(state),
      extraBoard(state)
    );
  });

  game.on("text", async (ctx) => {
    const msg = ctx.update.message.text.replace(/-/, "");

    if (!ctx.session.state.otherRateFlag) return;

    if (!isNumber(msg))
      return await ctx.reply("Пожалуйста, введите только положительные цифры.");

    if (ctx.session.state.balance < msg)
      return await ctx.reply(
        "Вы не можете выбрать размер ставки превышающий ваш игровой баланс."
      );

    if (+msg < +process.env.MIN_RATE) {
      return await ctx.reply(`Минимальная сумма ставки составляет ${process.env.MIN_RATE}₽`);
    }

    ctx.session.state = {
      ...ctx.session.state,
      otherRate: msg,
      valueRate: 0,
      otherRateFlag: false,
      otherRateActive: true,
    };

    await ctx.reply(`Вы успешно выбрали размер ставки: ${msg}₽`);

    const state = ctx.session.state;

    // Удаляем сообщение "Сделать еще одну ставку"
    await ctx.deleteMessage(state.activeBoard.message_id);

    // Изменяем активный board
    ctx.session.state.activeBoard = await bot.telegram.sendMessage(
      ctx.from.id,
      message(state),
      extraBoard(state)
    );
  });

  game.action("Бросить кости 🎲", async (ctx) => {
    const state = ctx.session.state;
    const sumRate =
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

    if (state.countRate === 0) {
      return ctx.answerCbQuery(
        "Вы не сделали ставку. Пожалуйста сделайте ставку, чтобы бросить кости.",
        true
      );
    }

    await ctx.deleteMessage(ctx.session.state.activeBoard.message_id);

    const diceMsg = await bot.telegram.sendDice(ctx.from.id, { emoji: "🎲" });
    const value = diceMsg.dice.value;

    let winSum = 0;
    let resMsg =
      "Вы были близко! Вы были близко! Не сдавайесь, в следующий раз повезет!";

    if (value === 1) {
      winSum +=
        state.rate[1] * 5 + state.rate["1-2"] * 2.7 + state.rate["odd"] * 1.85;
    }
    if (value === 2) {
      winSum +=
        state.rate[2] * 5 + state.rate["1-2"] * 2.7 + state.rate["even"] * 1.85;
    }
    if (value === 3) {
      winSum +=
        state.rate[3] * 5 + state.rate["3-4"] * 2.7 + state.rate["odd"] * 1.85;
    }
    if (value === 4) {
      winSum +=
        state.rate[4] * 5 + state.rate["3-4"] * 2.7 + state.rate["even"] * 1.85;
    }
    if (value === 5) {
      winSum +=
        state.rate[5] * 5 + state.rate["5-6"] * 2.7 + state.rate["odd"] * 1.85;
    }
    if (value === 6) {
      winSum +=
        state.rate[6] * 5 + state.rate["5-6"] * 2.7 + state.rate["even"] * 1.85;
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

    ctx.session.state.activeBoard = await ctx.reply(
      `${resMsg}
      
Ваша общая ставка - ${sumRate}
Ваш выигрыш - ${Math.floor(winSum * 100) / 100}
Ваш баланс - ${Math.floor(ctx.session.state.balance * 100) / 100}`,
      Extra.markup((m) =>
        m.inlineKeyboard([
          [
            m.callbackButton("Сделать другую ставку", "Сделать другую ставку"),
            m.callbackButton("Бросить кости еще раз", "Бросить кости еще раз"),
          ],
        ])
      )
    );
  });

  game.action(/Сделать другую ставку/, async (ctx) => {
    let state = ctx.session.state;

    // Удаляем сообщение "Сделать еще одну ставку"
    await ctx.deleteMessage(state.activeBoard.message_id);

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

    ctx.session.state.activeBoard = await ctx.reply(
      message(state),
      extraBoard(state)
    );
  });

  game.action(/Бросить кости еще раз/, async (ctx) => {
    let state = ctx.session.state;
    const sumRate =
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

    if (state.balance - sumRate < 0) {
      return ctx.answerCbQuery(
        "У вас недостаточно средств на счету. Пожалуйста, пополните баланс, либо сделайте ставку меньшим размером.",
        true
      );
    }

    // Удаляем сообщение "Сделать еще одну ставку"
    await ctx.deleteMessage(state.activeBoard.message_id);

    const diceMsg = await bot.telegram.sendDice(ctx.from.id, { emoji: "🎲" });
    const value = diceMsg.dice.value;

    ctx.session.state.balance -= sumRate;
    ctx.session.state = state;

    let winSum = 0;
    let resMsg =
      "Вы были близко! Вы были близко! Не сдавайесь, в следующий раз повезет!";

    if (value === 1) {
      winSum +=
        state.rate[1] * 5 + state.rate["1-2"] * 2.7 + state.rate["odd"] * 1.85;
    }
    if (value === 2) {
      winSum +=
        state.rate[2] * 5 + state.rate["1-2"] * 2.7 + state.rate["even"] * 1.85;
    }
    if (value === 3) {
      winSum +=
        state.rate[3] * 5 + state.rate["3-4"] * 2.7 + state.rate["odd"] * 1.85;
    }
    if (value === 4) {
      winSum +=
        state.rate[4] * 5 + state.rate["3-4"] * 2.7 + state.rate["even"] * 1.85;
    }
    if (value === 5) {
      winSum +=
        state.rate[5] * 5 + state.rate["5-6"] * 2.7 + state.rate["odd"] * 1.85;
    }
    if (value === 6) {
      winSum +=
        state.rate[6] * 5 + state.rate["5-6"] * 2.7 + state.rate["even"] * 1.85;
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

    ctx.session.state.activeBoard = await ctx.reply(
      `${resMsg}
      
Ваша общая ставка - ${sumRate}
Ваш выигрыш - ${Math.floor(winSum * 100) / 100}
Ваш баланс - ${Math.floor(ctx.session.state.balance * 100) / 100}`,
      Extra.markup((m) =>
        m.inlineKeyboard([
          [
            m.callbackButton("Сделать другую ставку", "Сделать другую ставку"),
            m.callbackButton("Бросить кости еще раз", "Бросить кости еще раз"),
          ],
        ])
      )
    );
  });

  game.on("dice", async (ctx) => {
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

    if (state.rateMenu) {
      // Если бросаем после ставки
      if (state.countRate === 0) {
        return ctx.reply(
          "Вы не сделали ставку. Пожалуйста сделайте ставку, чтобы бросить кости."
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

    await ctx.deleteMessage(ctx.session.state.activeBoard.message_id);

    let winSum = 0;
    let resMsg =
      "Вы были близко! Вы были близко! Не сдавайесь, в следующий раз повезет!";

    if (value === 1) {
      winSum +=
        state.rate[1] * 5 + state.rate["1-2"] * 2.7 + state.rate["odd"] * 1.85;
    }
    if (value === 2) {
      winSum +=
        state.rate[2] * 5 + state.rate["1-2"] * 2.7 + state.rate["even"] * 1.85;
    }
    if (value === 3) {
      winSum +=
        state.rate[3] * 5 + state.rate["3-4"] * 2.7 + state.rate["odd"] * 1.85;
    }
    if (value === 4) {
      winSum +=
        state.rate[4] * 5 + state.rate["3-4"] * 2.7 + state.rate["even"] * 1.85;
    }
    if (value === 5) {
      winSum +=
        state.rate[5] * 5 + state.rate["5-6"] * 2.7 + state.rate["odd"] * 1.85;
    }
    if (value === 6) {
      winSum +=
        state.rate[6] * 5 + state.rate["5-6"] * 2.7 + state.rate["even"] * 1.85;
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

    ctx.session.state.activeBoard = await ctx.reply(
      `${resMsg}
      
Ваша общая ставка - ${amountRate}
Ваш выигрыш - ${Math.floor(winSum * 100) / 100}
Ваш баланс - ${Math.floor(ctx.session.state.balance * 100) / 100}`,
      Extra.markup((m) =>
        m.inlineKeyboard([
          [
            m.callbackButton("Сделать другую ставку", "Сделать другую ставку"),
            m.callbackButton("Бросить кости еще раз", "Бросить кости еще раз"),
          ],
        ])
      )
    );
  });
};
