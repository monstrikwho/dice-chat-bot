const { bot } = require("../init/startBot");
const User = require("../models/user");

const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const extraBoard = require("../helpers/extraBoard");
const actionsBord = require("../helpers/actionsBoard");

let message = (state) => `Делайте ваши ставки.
Ваш баланс: ${state.balance} ₽`;

const demoGame = new Scene("demoGame");
demoGame.enter(async (ctx) => {
  const { demoMoney } = await User.findOne({ userId: ctx.from.id });

  // Записываем в стейт начальный стейт и баланс игрока
  ctx.session.state = {
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
    valueRate: 1,
    countRate: 0,
  };
  ctx.session.state.balance = demoMoney;
  const state = ctx.session.state;

  // Отправляем первое сообщение с клавиатурой
  await bot.telegram.sendMessage(
    ctx.from.id,
    "Вы вошли в демо игру",
    Extra.markup(Markup.keyboard([["↪️ Вернуться назад"]]).resize())
  );

  // Отправляем board
  ctx.session.state.activeBoard = await ctx.reply(
    message(state),
    extraBoard(state)
  );

  // Подключаем actions
  await actionsBord(demoGame);
});

demoGame.hears(
  "↪️ Вернуться назад",
  async ({ scene, deleteMessage, session }) => {
    await deleteMessage(session.state.activeBoard.message_id);

    scene.enter("showMainMenu");
  }
);

module.exports = { demoGame };
