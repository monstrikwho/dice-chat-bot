const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const getRasp = require("../helpers/getRasp");

// *************************** STEP 1 *******************************************
const showMainMenu = new Scene("showMainMenu");
showMainMenu.enter((ctx) => {
  return ctx.reply(
    "Вы вошли в главное меню",
    Extra.markup(
      Markup.keyboard([
        ["Сегодня", "Завтра", "Неделю"],
        // ["⚙️ Другое", "🚌 Автобусы"],
      ]).resize()
    )
  );
});

showMainMenu.hears("Сегодня", (ctx) => {
  getRasp(ctx, 8);
});
showMainMenu.hears("Завтра", (ctx) => {
  getRasp(ctx, 9);
});
showMainMenu.hears("Неделю", (ctx) => {
  ctx.scene.enter("weekMenu");
});
// showMainMenu.hears("⚙️ Другое", (ctx) => {
//   ctx.scene.enter("showSettingsMenu");
// });
// showMainMenu.hears("🚌 Автобусы", (ctx) => {
//   ctx.scene.enter("autobusMenu");
// });

module.exports = { showMainMenu };
