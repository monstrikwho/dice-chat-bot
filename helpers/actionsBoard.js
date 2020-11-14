const { bot } = require("../init/startBot");
const User = require("../models/user");
const Extra = require("telegraf/extra");

const extraBoard = require("../helpers/extraBoard");
let message = ({ balance }) => `Делайте ваши ставки.
Ваш баланс: ${balance} ₽`;

module.exports = (diceGame) => {
  diceGame.action("Очистить ставки", async (ctx) => {
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

  // 1-2
  diceGame.action(/1️⃣.*2️⃣|2️⃣.*1️⃣/, async (ctx) => {
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
    state.rate["1-2"] += state.valueRate;
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
  diceGame.action(/3️⃣.*4️⃣|4️⃣.*3️⃣/, async (ctx) => {
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
    state.rate["3-4"] += state.valueRate;
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
  diceGame.action(/5️⃣.*6️⃣|6️⃣.*5️⃣/, async (ctx) => {
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
    state.rate["5-6"] += state.valueRate;
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

  diceGame.action(/1️⃣/, async (ctx) => {
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
    state.rate[1] += state.valueRate;
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

  diceGame.action(/2️⃣/, async (ctx) => {
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
    state.rate[2] += state.valueRate;
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

  diceGame.action(/3️⃣/, async (ctx) => {
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
    state.rate[3] += state.valueRate;
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

  diceGame.action(/4️⃣/, async (ctx) => {
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
    state.rate[4] += state.valueRate;
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

  diceGame.action(/5️⃣/, async (ctx) => {
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
    state.rate[5] += state.valueRate;
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

  diceGame.action(/6️⃣/, async (ctx) => {
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
    state.rate[6] += state.valueRate;
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

  diceGame.action(/Нечетное/, async (ctx) => {
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
    state.rate["odd"] += state.valueRate;
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

  diceGame.action(/Четное/, async (ctx) => {
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
    state.rate["even"] += state.valueRate;
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

  diceGame.action(/(?:1₽|5₽|10₽|50₽|100₽|500₽)/, async (ctx) => {
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

  diceGame.action("Бросить кости 🎲", async (ctx) => {
    const state = ctx.session.state;

    if (state.countRate === 0) {
      return ctx.answerCbQuery(
        "Вы не сделали ставку. Пожалуйста сделайте ставку, чтобы бросить кости.",
        true
      );
    }

    await ctx.deleteMessage(ctx.session.state.activeBoard.message_id);

    const diceMsg = await bot.telegram.sendDice(ctx.from.id, "🎲");
    const value = diceMsg.dice.value;

    let winSum = 0;

    if (value === 1) {
      winSum +=
        state.rate[1] * 10 + state.rate["1-2"] * 5 + state.rate["odd"] * 3;
    }
    if (value === 2) {
      winSum +=
        state.rate[2] * 10 + state.rate["1-2"] * 5 + state.rate["even"] * 3;
    }
    if (value === 3) {
      winSum +=
        state.rate[3] * 10 + state.rate["3-4"] * 5 + state.rate["odd"] * 3;
    }
    if (value === 4) {
      winSum +=
        state.rate[4] * 10 + state.rate["3-4"] * 5 + state.rate["even"] * 3;
    }
    if (value === 5) {
      winSum +=
        state.rate[5] * 10 + state.rate["5-6"] * 5 + state.rate["odd"] * 3;
    }
    if (value === 6) {
      winSum +=
        state.rate[6] * 10 + state.rate["5-6"] * 5 + state.rate["even"] * 3;
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
      `Вам выпало число: ${value}
Ваш выигрыш: ${winSum}`,
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

    ctx.session.state.activeBoard = await ctx.reply(
      message(state),
      extraBoard(state)
    );
  });
};
