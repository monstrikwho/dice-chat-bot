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
showMainMenu.hears("Полное 📷", async (ctx) => {
  const today = new Date().getDay();

  let statusRasp = false;
  if (today === 3) statusRasp = await checkRasp();

  if (statusRasp || today > 4 || today === 5) {
    await ctx.scene.enter("weekMenu");
  } else {
    await ctx.reply('Ответ займет некоторое время. Пожалуйста, подождите...')
    await getRasp(ctx, 0);
  }

  if (today === 6 || today === 0) return await getRasp(ctx, 1);
});
showMainMenu.hears("⚙️ Другое", async (ctx) => {
  await ctx.scene.enter("showSettingsMenu");
});
showMainMenu.hears("🚌 Автобусы", async (ctx) => {
  await ctx.scene.enter("autobusMenu");
});

module.exports = { showMainMenu };
