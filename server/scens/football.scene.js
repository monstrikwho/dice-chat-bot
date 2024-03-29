const Scene = require("telegraf/scenes/base");

const { bot } = require("../init/startBot");
const { setupStart } = require("../commands/start");
const extraBoard = require("../helpers/footballExtra");
const actionsBord = require("../helpers/footballActions");

const User = require("../models/user");

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
        "AgACAgIAAxkBAANZYTd0NxxIv3ZJ0xvRRzYp22YQ_JYAAoK_MRv4AAG4SWxA89c4jp9TAQADAgADcwADIAQ",
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
setupStart(footballGame);
actionsBord(footballGame);

module.exports = { footballGame };
