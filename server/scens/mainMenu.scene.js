const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const showMainMenu = new Scene("showMainMenu");
showMainMenu.enter(async (ctx) => {
  return await ctx.reply(
    "Вы вошли в главное меню",
    Extra.markup(
      Markup.keyboard([
        ["Играть 🎲", "Играть ⚽️", "Играть 🎰"],
        ["Личный кабинет", "Инфо"],
      ]).resize()
    )
  );
});

showMainMenu.hears(/(?:Играть)/, async (ctx) => {
  const emoji = ctx.update.message.text.replace("Играть ", "");
  ctx.session.state = { game: emoji };

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
  const diceGame = ctx.session.state.game;

  if (diceGame === "🎲") {
    ctx.session.state.activeGame = "mainGame";
    return await ctx.scene.enter("diceGame");
  }
  if (diceGame === "⚽️") {
    ctx.session.state.activeGame = "mainGame";
    return await ctx.scene.enter("footballGame");
  }
  if (diceGame === "🎰") {
    ctx.session.state.activeGame = "mainGame";
    return await ctx.scene.enter("slotGame");
  }
});

showMainMenu.hears("Демо счет", async (ctx) => {
  const diceGame = ctx.session.state.game;

  if (diceGame === "🎲") {
    ctx.session.state.activeGame = "demoGame";
    return await ctx.scene.enter("diceGame");
  }
  if (diceGame === "⚽️") {
    ctx.session.state.activeGame = "demoGame";
    return await ctx.scene.enter("footballGame");
  }
  if (diceGame === "🎰") {
    ctx.session.state.activeGame = "demoGame";
    return await ctx.scene.enter("slotGame");
  }
});

showMainMenu.hears("Личный кабинет", async (ctx) => {
  return await ctx.scene.enter("lkMenu");
});

showMainMenu.hears("Инфо", async (ctx) => {
  return await ctx.scene.enter("infoBlock");
});

showMainMenu.hears("↪️ Вернуться назад", async (ctx) => {
  return await ctx.scene.enter("showMainMenu");
});

module.exports = { showMainMenu };
