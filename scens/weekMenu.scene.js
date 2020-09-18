const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const getRasp = require("../helpers/getRasp");

// *************************** STEP 1 *******************************************
const weekMenu = new Scene("weekMenu");
weekMenu.enter(async(ctx) => {
  return await ctx.reply(
    "Выберите день недели",
    Extra.markup(
      Markup.keyboard([
        ["Пн", "Вт", "Ср", "Чт", "Пт"],
        ["↪️ Вернуться назад"],
      ]).resize()
    )
  );
});

weekMenu.hears("↪️ Вернуться назад", async (ctx) => {
  await ctx.scene.enter("showMainMenu");
});
weekMenu.hears("Пн", async (ctx) => {
  await getRasp(ctx, 0)
});
weekMenu.hears("Вт", async (ctx) => {
  await getRasp(ctx, 1)
});
weekMenu.hears("Ср", async (ctx) => {
  await getRasp(ctx, 2)
});
weekMenu.hears("Чт", async (ctx) => {
  await getRasp(ctx, 3)
});
weekMenu.hears("Пт", async (ctx) => {
  await getRasp(ctx, 4)
});
// weekMenu.hears("Всю", (ctx) => {
//   getRasp(ctx, 5)
// });

module.exports = { weekMenu };
