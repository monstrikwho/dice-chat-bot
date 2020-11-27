const { bot } = require("../init/startBot");
const User = require("../models/user");
const Extra = require("telegraf/extra");

const isNumber = require("is-number");

const extraBoard = require("./slotExtra");

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
      jek: 0,
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

  game.action(/Поставить/, async (ctx) => {
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

    if (amountRate < 1) {
      return await ctx.answerCbQuery("Минимальная ставка 1₽", true);
    }

    state.balance = Math.floor((state.balance - amountRate) * 100) / 100;
    state.rate["jek"] += amountRate;
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

    if (!ctx.session.state.otherRateActive) return;

    if (!isNumber(msg))
      return await ctx.reply("Пожалуйста, введите только цифры.");

    if (ctx.session.state.balance < msg)
      return await ctx.reply(
        "Вы не можете выбрать размер ставки превышающий ваш игровой баланс."
      );

    ctx.session.state = {
      ...ctx.session.state,
      valueRate: 0,
      otherRate: msg,
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

  game.action("Крутить барабан 🎰", async (ctx) => {
    const state = ctx.session.state;

    if (state.countRate === 0) {
      return ctx.answerCbQuery(
        "Вы не сделали ставку. Пожалуйста сделайте ставку, чтобы крутить барабан.",
        true
      );
    }

    await ctx.deleteMessage(ctx.session.state.activeBoard.message_id);

    const diceMsg = await bot.telegram.sendDice(ctx.from.id, { emoji: "🎰" });
    const value = diceMsg.dice.value;

    let winSum = 0;
    let resMsg =
      "Вы были близко! Вы были близко! Не сдавайесь, в следующий раз повезет!";

    if (value === 1 || value === 22 || value === 43 || value === 64) {
      winSum += state.rate["jek"] * 12;
      resMsg = "Поздравляем! Вы выиграли 🎉";
    }

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
      
Ваша ставка - ${state.rate["jek"]}
Ваш выигрыш - ${Math.floor(winSum * 100) / 100}
Ваш баланс - ${Math.floor(ctx.session.state.balance * 100) / 100}`,
      Extra.markup((m) =>
        m.inlineKeyboard([
          [
            m.callbackButton("Сделать другую ставку", "Сделать другую ставку"),
            m.callbackButton("Крутить еще раз", "Крутить еще раз"),
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
      jek: 0,
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

  game.action(/Крутить еще раз/, async (ctx) => {
    let state = ctx.session.state;
    const countRate = state.rate["jek"];

    if (state.balance - countRate < 0) {
      return ctx.answerCbQuery(
        "У вас недостаточно средств на счету. Пожалуйста, пополните баланс, либо сделайте ставку меньшим размером.",
        true
      );
    }

    await ctx.deleteMessage(ctx.session.state.activeBoard.message_id);

    const diceMsg = await bot.telegram.sendDice(ctx.from.id, { emoji: "🎰" });
    const value = diceMsg.dice.value;

    state.balance -= state.rate["jek"];
    ctx.session.state = state;
    ctx.session.state.rateMenu = false;

    let winSum = 0;
    let resMsg =
      "Вы были близко! Вы были близко! Не сдавайесь, в следующий раз повезет!";

    if (value === 1 || value === 64 || value === 22 || value === 43) {
      winSum += state.rate["jek"] * 12;
      resMsg = "Поздравляем! Вы выиграли 🎉";
    }

    ctx.session.state.balance += winSum;

    if (state.activeGame === "mainGame") {
      await User.updateOne(
        { userId: ctx.from.id },
        { mainBalance: Math.floor(ctx.session.state.balance * 100) / 100 }
      );
    }
    if (state.activeGame === "demoGame") {
      await User.updateOne(
        { userId: ctx.from.id },
        { demoBalance: Math.floor(ctx.session.state.balance * 100) / 100 }
      );
    }

    ctx.session.state.activeBoard = await ctx.reply(
      `${resMsg}
      
Ваша ставка - ${state.rate["jek"]}
Ваш выигрыш - ${Math.floor(winSum * 100) / 100}
Ваш баланс - ${Math.floor(ctx.session.state.balance * 100) / 100}`,
      Extra.markup((m) =>
        m.inlineKeyboard([
          [
            m.callbackButton("Сделать другую ставку", "Сделать другую ставку"),
            m.callbackButton("Крутить еще раз", "Крутить еще раз"),
          ],
        ])
      )
    );
  });

  game.on("dice", async (ctx) => {
    const dice = ctx.update.message.dice;
    if (dice.emoji !== "🎰") return;

    const value = dice.value;
    const state = ctx.session.state;
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

    if (value === 1 || value === 22 || value === 43 || value === 64) {
      winSum += state.rate["jek"] * 12;
      resMsg = "Поздравляем! Вы выиграли 🎉";
    }

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
      
Ваша ставка - ${state.rate["jek"]}
Ваш выигрыш - ${Math.floor(winSum * 100) / 100}
Ваш баланс - ${Math.floor(ctx.session.state.balance * 100) / 100}`,
      Extra.markup((m) =>
        m.inlineKeyboard([
          [
            m.callbackButton("Сделать другую ставку", "Сделать другую ставку"),
            m.callbackButton("Крутить еще раз", "Крутить еще раз"),
          ],
        ])
      )
    );
  });
};