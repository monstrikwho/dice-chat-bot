const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

// *************************** STEP 1 *******************************************
const weekMenu = new Scene("weekMenu");
weekMenu.enter((ctx) => {
  return ctx.reply(
    "Выберите день недели",
    Extra.markup(
      Markup.keyboard([
        ["Пн", "Вт", "Ср", "Чт", "Пт", 'Всю'],
        ["↪️ Вернуться назад"],
      ]).resize()
    )
  );
});

weekMenu.hears("↪️ Вернуться назад", (ctx) => {
  ctx.scene.enter("showMainMenu");
});

module.exports = { weekMenu };
