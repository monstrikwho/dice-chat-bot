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
        ["PvP 🎲", "PvP 🎳", "PvP ⚽️"],
        ["Личный кабинет", "💬 Чат", "Инфо"],
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

showMainMenu.hears(/(?:PvP)/, async (ctx) => {
  const emoji = ctx.update.message.text.replace("PvP ", "");

  ctx.session.state = { typeGame: emoji, typeBalance: "mainBalance" };

  if (emoji === "🎲") {
    return await ctx.scene.enter("pvpDiceGame");
  }
  if (emoji === "⚽️") {
    return await ctx.scene.enter("pvpFootballGame");
  }
  if (emoji === "🎳") {
    return await ctx.scene.enter("pvpBoulingGame");
  }
});

showMainMenu.hears("Основной счет", async (ctx) => {
  const diceGame = ctx.session.state.game;

  ctx.session.state.activeGame = "mainGame";

  if (diceGame === "🎲") {
    return await ctx.scene.enter("diceGame");
  }
  if (diceGame === "⚽️") {
    return await ctx.scene.enter("footballGame");
  }
  if (diceGame === "🎰") {
    return await ctx.scene.enter("slotGame");
  }
});

showMainMenu.hears("Демо счет", async (ctx) => {
  const diceGame = ctx.session.state.game;

  ctx.session.state.activeGame = "demoGame";

  if (diceGame === "🎲") {
    return await ctx.scene.enter("diceGame");
  }
  if (diceGame === "⚽️") {
    return await ctx.scene.enter("footballGame");
  }
  if (diceGame === "🎰") {
    return await ctx.scene.enter("slotGame");
  }
});

showMainMenu.hears("Личный кабинет", async (ctx) => {
  return await ctx.scene.enter("lkMenu");
});

showMainMenu.hears("Инфо", async (ctx) => {
  return await ctx.scene.enter("infoBlock");
});

showMainMenu.hears("💬 Чат", async (ctx) => {
  ctx.reply(
    `Вы можете общаться с игроками в нашем общем чате
<a href="http://t.me/joinchat/P0el-xuDN6g-ZsY7decv7A">💬 Чат для общения с игроками</a>`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Перейти в чат",
              url: "http://t.me/joinchat/P0el-xuDN6g-ZsY7decv7A",
            },
          ],
        ],
      },
    }
  );
});

showMainMenu.hears("↪️ Вернуться назад", async (ctx) => {
  return await ctx.scene.enter("showMainMenu");
});

module.exports = { showMainMenu };
