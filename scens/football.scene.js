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
    valueRate: 1,
    countRate: 0,
    activeGame,
    balance: activeGame === "mainGame" ? mainBalance : demoBalance,
  };
  ctx.session.state = initState;

  // Отправляем первое сообщение с пустой клавиатурой
  await bot.telegram.sendMessage(
    ctx.from.id,
    "Вы вошли в сцену с игрой",
    Extra.markup(Markup.keyboard([["🏡 Вернуться на главную"]]).resize())
  );

  let message = ({ balance }) => `Делайте ваши ставки.
Ваш баланс: ${balance} ₽`;

  // Отправляем init board
  ctx.session.state.activeBoard = await ctx.reply(
    message(initState),
    extraBoard(initState)
  );

  // Подключаем actions
  actionsBord(footballGame);
});

footballGame.hears(
  "🏡 Вернуться на главную",
  async ({ scene, deleteMessage, session }) => {
    await deleteMessage(session.state.activeBoard.message_id);

    await scene.enter("showMainMenu");
  }
);

module.exports = { footballGame };
