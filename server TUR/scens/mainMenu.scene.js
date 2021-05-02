const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const showMainMenu = new Scene("showMainMenu");
showMainMenu.enter(async (ctx) => {
  return await ctx.reply(
    "Ana menüye giriş yaptınız.",
    Extra.markup(
      Markup.keyboard([
        ["Oyna 🎲", "Oyna ⚽️", "Oyna 🎰"],
        ["Hesabınız", "Info"],
      ]).resize()
    )
  );
});

showMainMenu.hears(/(?:Oyna)/, async (ctx) => {
  const emoji = ctx.update.message.text.replace("Oyna ", "");
  ctx.session.state = { game: emoji };

  await ctx.reply(
    "Oynamak istediğiniz bir hesap seçin.",
    Extra.markup(
      Markup.keyboard([
        ["Ana hesap", "Demo hesap"],
        ["↪️ Geri"],
      ]).resize()
    )
  );
});

showMainMenu.hears("Ana hesap", async (ctx) => {
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

showMainMenu.hears("Demo hesap", async (ctx) => {
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

showMainMenu.hears("Hesabınız", async (ctx) => {
  return await ctx.scene.enter("lkMenu");
});

showMainMenu.hears("Info", async (ctx) => {
  return await ctx.scene.enter("infoBlock");
});

showMainMenu.hears("↪️ Geri", async (ctx) => {
  return await ctx.scene.enter("showMainMenu");
});

module.exports = { showMainMenu };
