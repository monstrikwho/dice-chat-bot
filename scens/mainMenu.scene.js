const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

// *************************** STEP 1 *******************************************
const showMainMenu = new Scene("showMainMenu");
showMainMenu.enter(async (ctx) => {
  return await ctx.reply(
    "Вы вошли в главное меню",
    Extra.markup(
      Markup.keyboard([
        ["Играть", "Личный кабинет"],
        ["Демо", "Инфо"],
      ]).resize()
    )
  );
});

showMainMenu.hears("Играть", async (ctx) => {
  ctx.reply("Раздел еще в разработке");
});
showMainMenu.hears("Демо", async (ctx) => {
  ctx.scene.enter("demoGame");
});
showMainMenu.hears("Личный кабинет", async (ctx) => {
  ctx.reply("Раздел еще в разработке");
});
showMainMenu.hears("Инфо", async (ctx) => {
  ctx.reply("Раздел еще в разработке");
});

module.exports = { showMainMenu };
