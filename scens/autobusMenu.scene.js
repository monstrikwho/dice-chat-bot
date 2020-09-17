const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");

// *************************** STEP 1 *******************************************
const autobusMenu = new Scene("autobusMenu");
autobusMenu.enter(async (ctx) => {
  const [status] = await User.find({ userId: ctx.from.id });
  if (status.autobus) {
    return ctx.reply(
      "Вы вошли в меню автобусов",
      Extra.markup(
        Markup.keyboard([
          ["Ближайшие", "Мои автобусы"],
          ["Др. автобусы", "↪️ Вернуться назад"],
        ]).resize()
      )
    );
  }

  return ctx.scene.enter("takeAutobus");
});

autobusMenu.hears("Ближайшие", (ctx) => {
  ctx.scene.enter("nearestAutobus");
});
autobusMenu.hears("Др. автобусы", (ctx) => {
  // ctx.reply('Данного раздела нету. Мне нужно ваш отклик: нужно ли вам расписание других автобусов?')
  ctx.scene.enter("otherAutobus");
});
autobusMenu.hears("Мои автобусы", (ctx) => {
  ctx.scene.enter("yourAutobus");
});
autobusMenu.hears("↪️ Вернуться назад", (ctx) => {
  ctx.scene.enter("showMainMenu");
});

module.exports = { autobusMenu };
