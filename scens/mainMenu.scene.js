const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const showMainMenu = new Scene("showMainMenu");
showMainMenu.enter(async (ctx) => {
  return await ctx.reply(
    "Вы вошли в главное меню",
    Extra.markup(
      Markup.keyboard([
        ["Играть 🎲", "Играть 🎰", "Играть ⚽️"],
        ["Личный кабинет"],
      ]).resize()
    )
  );
});

showMainMenu.hears("Играть 🎲", async (ctx) => {
  ctx.reply(
    "Выберите счет с которым вы хотите играть.",
    Extra.markup(
      Markup.keyboard([
        ["Основной счет", "Демо счет"],
        ["↪️ Вернуться назад"],
      ]).resize()
    )
  );
});

showMainMenu.hears("Основной счет", async (ctx) => {
  // проверять емоджи и отправлять в нужную сцену
  return await ctx.scene.enter("mainGame");
});

showMainMenu.hears("Демо счет", async (ctx) => {
  // проверять емоджи и отправлять в нужную сцену
  return await ctx.scene.enter("demoGame");
});

showMainMenu.hears("Играть 🎰", async (ctx) => {
  return await ctx.reply("Игра скоро выйдет");
});
showMainMenu.hears("Играть ⚽️", async (ctx) => {
  return await ctx.reply("Игра скоро выйдет");
});

showMainMenu.hears("↪️ Вернуться назад", async (ctx) => {
  return await ctx.scene.enter("showMainMenu");
});

showMainMenu.hears("Личный кабинет", async (ctx) => {
  ctx.scene.enter("lkMenu");
});

module.exports = { showMainMenu };

//4255190103543289
