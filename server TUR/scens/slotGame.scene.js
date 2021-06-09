const { bot } = require("../init/startBot");
const User = require("../models/user");
const MainStats = require("../models/mainstats");

const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const extraBoard = require("../helpers/slotExtra");
const actionsBord = require("../helpers/slotActions");

const slotGame = new Scene("slotGame");
slotGame.enter(async (ctx) => {
  const { demoBalance, mainBalance } = await User.findOne({
    userId: ctx.from.id,
  });
  const { slotCoef } = await MainStats.findOne();

  const activeGame = ctx.session.state.activeGame;

  // Записываем в стейт начальный стейт и баланс игрока
  const initState = {
    rate: {
      jek: 0,
    },
    valueRate: 10,
    otherRate: 0,
    countRate: 0,
    activeGame,
    rateMenu: true,
    balance: activeGame === "mainGame" ? mainBalance : demoBalance,
    slotCoef,
  };
  ctx.session.state = initState;

  // Отправляем первое сообщение с пустой клавиатурой
  try {
    await bot.telegram.sendMessage(
      ctx.from.id,
      "Bahis yapın",
      Extra.markup(Markup.keyboard([["🏡 Menüye dön"]]).resize())
    );

    let message = ({ balance }) => `Sonuç katsayıları:

➖	777 durumunda bahsinizin x${slotCoef.x3_7} katını kazanırsınız.
➖	Aynı 3 nesne tutturmanız durumunda bahsinizin x${slotCoef.x3} katını kazanırsınız.
➖	Aynı 2 nesne tutturmanız durumunda bahsinizin x${slotCoef.x2} katını kazanırsınız.

Bakiyeniz: ${balance} TL`;

    const extra = await extraBoard(initState);

    // Отправляем init board
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
    ctx.session.state.activeBoard = await ctx.reply(message(initState), extra);
  } catch (error) {}
});

slotGame.hears("🏡 Menüye dön", async ({ scene, deleteMessage, session }) => {
  try {
    await deleteMessage(session.state.activeBoard.message_id);
  } catch (error) {}
  try {
    await deleteMessage(session.state.photoMsg.message_id);
  } catch (error) {}
  await scene.enter("showMainMenu");
});

// Подключаем actions
actionsBord(slotGame);

module.exports = { slotGame };
