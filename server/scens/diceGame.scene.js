const { bot } = require("../init/startBot");
const User = require("../models/user");

const Scene = require("telegraf/scenes/base");

const extraBoard = require("../helpers/diceExtra");
const actionsBord = require("../helpers/diceActions");
const { setupStart } = require("../commands/start");

const diceGame = new Scene("diceGame");
diceGame.enter(async (ctx) => {
  const { demoBalance, mainBalance } = await User.findOne({
    userId: ctx.from.id,
  });

  // Записываем в стейт начальный стейт и баланс игрока
  const initState = {
    ...ctx.session.state,
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
    valueRate: 10,
    countRate: 0,
    rateMenu: true,
    demoBalance,
    mainBalance,
  };
  ctx.session.state = initState;

  const extra = await extraBoard(initState);

  if (process.env.DEV !== "true") {
    try {
      ctx.session.state.activeBoard = await bot.telegram.sendPhoto(
        ctx.from.id,
        "AgACAgIAAxkBAAELz79hDPGuFqx3mgMfflJ26-8unGYkuwACzLUxG9FSaEiIso4qsA3wJAEAAwIAA3MAAyAE",
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

// Подключаем actions
setupStart(diceGame);
actionsBord(diceGame);

module.exports = { diceGame };
