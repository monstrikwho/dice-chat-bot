const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const getRasp = require("../helpers/getRasp");

// *************************** STEP 1 *******************************************
const showMainMenu = new Scene("showMainMenu");
showMainMenu.enter(async (ctx) => {
  return await ctx.reply(
    "Вы вошли в главное меню",
    Extra.markup(
      Markup.keyboard([
        // Поставить условие для четверга по времени после обеда
        // Проверять запросом
        ["Сегодня", "Завтра", "Неделя"],
        ["⚙️ Другое", "🚌 Автобусы"],
      ]).resize()
    )
  );
});

showMainMenu.hears("Сегодня", async (ctx) => {
  await getRasp(ctx, 8);
});
showMainMenu.hears("Завтра", async (ctx) => {
  await getRasp(ctx, 9);
});
showMainMenu.hears('Неделя', async (ctx) => {
  await ctx.scene.enter("weekMenu");
});
showMainMenu.hears("⚙️ Другое", async (ctx) => {
  await ctx.reply(
    "Раздел в доработке. Мы оповестим вас, как только он будет готов 🌵"
  );
  // ctx.scene.enter("showSettingsMenu");
});
showMainMenu.hears("🚌 Автобусы", async (ctx) => {
  await ctx.scene.enter("autobusMenu");
});

module.exports = { showMainMenu };
