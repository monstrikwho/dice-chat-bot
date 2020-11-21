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

showMainMenu.hears(/(?:Играть)/, async (ctx) => {
  const emoji = ctx.update.message.text.replace("Играть ", "");
  ctx.session.state = { diceGame: emoji };

  if (emoji === "🎰") return ctx.reply("Игра будет готова в ближайшее время");
  // if (emoji === "⚽️") return ctx.reply("Игра будет готова в ближайшее время.");

  await ctx.reply(
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
  const diceGame = ctx.session.state.diceGame;

  if (diceGame === "🎲") {
    ctx.session.state.activeGame = "mainGame";
    await ctx.scene.enter("diceGame");
  }
});

showMainMenu.hears("Демо счет", async (ctx) => {
  const diceGame = ctx.session.state.diceGame;

  if (diceGame === "🎲") {
    ctx.session.state.activeGame = "demoGame";
    await ctx.scene.enter("diceGame");
  }
});

showMainMenu.hears("Личный кабинет", async (ctx) => {
  // await checkOrder(1092432832)
  return await ctx.scene.enter("lkMenu");
});

showMainMenu.hears("↪️ Вернуться назад", async (ctx) => {
  return await ctx.scene.enter("showMainMenu");
});

module.exports = { showMainMenu };
