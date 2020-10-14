const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const getRasp = require("../helpers/getRasp");
const checkRasp = require("../helpers/checkRasp");

// *************************** STEP 1 *******************************************
const showMainMenu = new Scene("showMainMenu");
showMainMenu.enter(async (ctx) => {
  return await ctx.reply(
    "Вы вошли в главное меню",
    Extra.markup(
      Markup.keyboard([
        ["Сегодня", "Завтра", "Полное 📷"],
        ["⚙️ Другое", "📌 Избранное", "🚌 Автобусы"],
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
showMainMenu.hears("Полное 📷", async (ctx) => {
  const today = new Date().getDay();

  let statusRasp =
    today === 3 ? await checkRasp() : today === 4 || today === 5 ? true : false;

  if (statusRasp || today === 4 || today === 5) {
    return await ctx.scene.enter("weekMenu");
  }

  if (today === 1 || today === 2 || (today === 3 && !statusRasp)) {
    await ctx.reply("Ответ займет некоторое время. Пожалуйста, подождите...");
    await ctx.reply("Расписание на текущую неделю.");
    return await getRasp(ctx, 0);
  }

  if (today === 6 || today === 0) {
    await ctx.reply("Ответ займет некоторое время. Пожалуйста, подождите...");
    await ctx.reply("Расписание на следующую неделю.");
    return await getRasp(ctx, 1);
  }
});
showMainMenu.hears("⚙️ Другое", async (ctx) => {
  await ctx.scene.enter("showSettingsMenu");
});
showMainMenu.hears("📌 Избранное", async (ctx) => {
  await ctx.scene.enter("favoritesMenu");
});
showMainMenu.hears("🚌 Автобусы", async (ctx) => {
  await ctx.scene.enter("autobusMenu");
});

module.exports = { showMainMenu };
