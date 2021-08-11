const { bot } = require("../init/startBot");
const User = require("../models/user");

const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const extraBoard = require("../helpers/footballExtra");
const actionsBord = require("../helpers/footballActions");

const footballGame = new Scene("footballGame");
footballGame.enter(async (ctx) => {
  const { demoBalance, mainBalance } = await User.findOne({
    userId: ctx.from.id,
  });

  // Записываем в стейт начальный стейт и баланс игрока
  const initState = {
    ...ctx.session.state,
    rate: {
      goal: 0,
      out: 0,
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
        "AgACAgIAAxkBAAELz75hDPFbFqOoq19HcyfQRZxetgYazAACyrUxG9FSaEhnM091tDxpEwEAAwIAA3MAAyAE",
        {
          caption: `⚽️ Футбол`,
          reply_markup: extra,
        }
      );
    } catch (error) {}
  } else {
    try {
      ctx.session.state.activeBoard = await bot.telegram.sendPhoto(
        ctx.from.id,
        "AgACAgIAAxkBAAJGiGEKjSkKqf8KXfroKBeNfKzvJO9kAAJJtDEbwjVRSJSFOM7nIvVTAQADAgADcwADIAQ",
        {
          caption: `⚽️ Футбол`,
          reply_markup: extra,
        }
      );
    } catch (error) {}
  }
});

// Подключаем actions
actionsBord(footballGame);

module.exports = { footballGame };
