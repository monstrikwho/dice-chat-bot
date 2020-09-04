const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

// *************************** STEP 1 *******************************************
const autobusMenu = new Scene("autobusMenu");
autobusMenu.enter((ctx) => {
  return ctx.reply(
    "Выберите день недели",
    Extra.markup(
      Markup.keyboard([
        ["Указать остановки", "Выбрать автобусы"],
        ["Расписание др. автобусов", "↪️ Вернуться назад"],
      ]).resize()
    )
  );
});

autobusMenu.hears("↪️ Вернуться назад", (ctx) => {
  ctx.scene.enter("showMainMenu");
});

module.exports = { autobusMenu };
