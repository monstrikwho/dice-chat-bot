const Scene = require("telegraf/scenes/base");

const { bot } = require("../init/startBot");

const User = require("../models/user");
const MainStats = require("../models/mainstats");

const extraBoard = require("../helpers/slotExtra");
const actionsBord = require("../helpers/slotActions");
const setupStart = require("../commands/start");

const slotGame = new Scene("slotGame");
slotGame.enter(async (ctx) => {
  const { demoBalance, mainBalance } = await User.findOne({
    userId: ctx.from.id,
  });
  const { slotCoef } = await MainStats.findOne();

  // Записываем в стейт начальный стейт и баланс игрока
  const initState = {
    ...ctx.session.state,
    rate: {
      jek: 0,
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
        "AgACAgIAAxkBAAELz8BhDPHr5BzdYkeMyS3w27Z_jbb7NwAC0LUxG9FSaEiPNb0zl31QeAEAAwIAA3MAAyAE",
        {
          caption: `🎰 Автоматы
Выигрышные комбинации:
- 777 [x${slotCoef.x3_7}]
- 3 в ряд [x${slotCoef.x3}]
- XXY или YXX [x${slotCoef.x2}]`,
          reply_markup: extra,
        }
      );
    } catch (error) {}
  } else {
    try {
      ctx.session.state.activeBoard = await bot.telegram.sendPhoto(
        ctx.from.id,
        "AgACAgIAAxkBAAJGP2EKgoiW-VUkZVWZioc6VzBl3sgvAAKmtDEbwjVRSB0Lf_qKVpvAAQADAgADcwADIAQ",
        {
          caption: `🎰 Автоматы
Выигрышные комбинации:
- 777 [x${slotCoef.x3_7}]
- 3 в ряд [x${slotCoef.x3}]
- 2 в ряд [x${slotCoef.x2}]`,
          reply_markup: extra,
        }
      );
    } catch (error) {}
  }
});

// Подключаем actions
setupStart(slotGame);
actionsBord(slotGame);

module.exports = { slotGame };
