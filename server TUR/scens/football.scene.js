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

  const activeGame = ctx.session.state.activeGame;

  // Записываем в стейт начальный стейт и баланс игрока
  const initState = {
    rate: {
      goal: 0,
      out: 0,
    },
    valueRate: 10,
    otherRate: 0,
    countRate: 0,
    activeGame,
    rateMenu: true,
    balance: activeGame === "mainGame" ? mainBalance : demoBalance,
  };
  ctx.session.state = initState;

  // Отправляем первое сообщение с пустой клавиатурой
  try {
    await bot.telegram.sendMessage(
      ctx.from.id,
      "Menüye dön",
      Extra.markup(Markup.keyboard([["🏡 Menüye dön"]]).resize())
    );

    let message = ({ balance }) => `Bakiyeniz: ${balance} ₽`;

    const extra = await extraBoard(initState);

    // Отправляем init board
    ctx.session.state.activeBoard = await ctx.reply(message(initState), extra);
  } catch (error) {}
});

footballGame.hears(
  "🏡 Menüye dön",
  async ({ scene, deleteMessage, session }) => {
    try {
      await deleteMessage(session.state.activeBoard.message_id);
    } catch (error) {}
    await scene.enter("showMainMenu");
  }
);

// Подключаем actions
actionsBord(footballGame);

module.exports = { footballGame };
