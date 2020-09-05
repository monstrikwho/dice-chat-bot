const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const requestToday = require("../helpers/requestToday");

// *************************** STEP 1 *******************************************
const showMainMenu = new Scene("showMainMenu");
showMainMenu.enter((ctx) => {
  return ctx.reply(
    "Вы вошли в главное меню",
    Extra.markup(
      Markup.keyboard([
        ["Сегодня", "Завтра", "Неделю"],
        ["⚙️ Другое", "🚌 Автобусы"],
      ]).resize()
    )
  );
});

showMainMenu.hears("⚙️ Другое", (ctx) => {
  ctx.scene.enter("showSettingsMenu");
});
showMainMenu.hears("Сегодня", (ctx) => {
  requestToday(ctx)
});
showMainMenu.hears("Завтра", (ctx) => {
  requestToday(ctx, 9)
});
showMainMenu.hears("Неделю", (ctx) => {
  ctx.scene.enter("weekMenu");
});
showMainMenu.hears("🚌 Автобусы", (ctx) => {
  ctx.scene.enter("autobusMenu");
});

module.exports = { showMainMenu };
