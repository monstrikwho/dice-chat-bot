const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const getRasp = require("../helpers/getRasp");

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
weekMenu.hears("Пн", (ctx) => {
  getRasp(ctx, 0)
});
weekMenu.hears("Вт", (ctx) => {
  getRasp(ctx, 1)
});
weekMenu.hears("Ср", (ctx) => {
  getRasp(ctx, 2)
});
weekMenu.hears("Чт", (ctx) => {
  getRasp(ctx, 3)
});
weekMenu.hears("Пт", (ctx) => {
  getRasp(ctx, 4)
});

module.exports = { weekMenu };
