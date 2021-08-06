const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");
const Scene = require("telegraf/scenes/base");
const SportsTopGames = require("../models/sportsTopGames");
const SportFootballGames = require("../models/sportFootballGames");
const moment = require("moment");
const { bot } = require("../init/startBot");

const sportMenu = new Scene("sportMenu");
sportMenu.enter(async (ctx) => {
  const startType = "live";
  let activeBoard = null;
  try {
    await ctx.reply(
      `Какие-нибудь правила`,
      Extra.markup(
        Markup.keyboard([
          ["🔥 Live", "⭐️ Pre-match"],
          ["🏡 Вернуться на главную"],
        ]).resize()
      )
    );
  } catch (error) {}
  try {
    activeBoard = await ctx.reply(
      `${startType === "live" ? "🔥 Live match" : "⭐️ Pre-match"}
Выберите тип спорта`,
      Extra.markup((m) =>
        m.inlineKeyboard([
          [
            m.callbackButton("Футбол", "Футбол"),
            m.callbackButton("Теннис", "Теннис"),
            m.callbackButton("Баскетбол", "Баскетбол"),
          ],
        ])
      )
    );
  } catch (error) {}
  ctx.session.sport = {
    activeBoard,
    activeView: "mainView",
    typeMatch: startType,
  };
});

sportMenu.action("Футбол", async (ctx) => {
  ctx.session.sport.typeSport = "soccer";
  await gameView(ctx);
});

sportMenu.action("Теннис", async (ctx) => {
  ctx.session.sport.typeSport = "tennis";
  await gameView(ctx);
});

sportMenu.action("Баскетбол", async (ctx) => {
  ctx.session.sport.typeSport = "basketball";
  await gameView(ctx);
});

sportMenu.action(/(?:game_id)/, async (ctx) => {
  const { interval } = ctx.session.sport;
  clearInterval(interval);
  await gameIdView(ctx);
});

sportMenu.action("Вернуться", async (ctx) => {
  const { activeView } = ctx.session.sport;
  if (activeView === "mainView") return;
  if (activeView === "gameView") {
    const { interval } = ctx.session.sport;
    clearInterval(interval);
    return await mainView(ctx);
  }
  if (activeView === "gameIdView") {
    const { interval } = ctx.session.sport;
    clearInterval(interval);
    return await gameView(ctx);
  }
});

sportMenu.hears("🏡 Вернуться на главную", async (ctx) => {
  const { activeBoard } = ctx.session.sport;
  try {
    await ctx.deleteMessage(activeBoard.message_id);
  } catch (error) {}
  return await ctx.scene.enter("showMainMenu");
});

sportMenu.hears("🔥 Live", async (ctx) => {
  const { activeBoard, activeView, typeMatch } = ctx.session.sport;

  try {
    await ctx.deleteMessage(ctx.update.message.message_id);
  } catch (error) {}

  if (typeMatch === "live") return;
  ctx.session.sport.typeMatch = "live";

  if (activeView === "mainView") {
    try {
      await bot.telegram.editMessageText(
        ctx.from.id,
        activeBoard.message_id,
        null,
        `🔥 Live match
Выберите тип спорта`,
        Extra.markup((m) =>
          m.inlineKeyboard([
            [
              m.callbackButton("Футбол", "Футбол"),
              m.callbackButton("Теннис", "Теннис"),
              m.callbackButton("Баскетбол", "Баскетбол"),
            ],
          ])
        )
      );
    } catch (error) {}
  }

  if (activeView === "gameView" || activeView === "gameIdView") {
    const { interval } = ctx.session.sport;
    clearInterval(interval);
    return await gameView(ctx);
  }
});

sportMenu.hears("⭐️ Pre-match", async (ctx) => {
  const { activeBoard, activeView, typeMatch } = ctx.session.sport;

  try {
    await ctx.deleteMessage(ctx.update.message.message_id);
  } catch (error) {}

  if (typeMatch === "pre") return;
  ctx.session.sport.typeMatch = "pre";

  if (activeView === "mainView") {
    try {
      await bot.telegram.editMessageText(
        ctx.from.id,
        activeBoard.message_id,
        null,
        `⭐️ Pre-match
Выберите тип спорта`,
        Extra.markup((m) =>
          m.inlineKeyboard([
            [
              m.callbackButton("Футбол", "Футбол"),
              m.callbackButton("Теннис", "Теннис"),
              m.callbackButton("Баскетбол", "Баскетбол"),
            ],
          ])
        )
      );
    } catch (error) {}
  }

  if (activeView === "gameView" || activeView === "gameIdView") {
    const { interval } = ctx.session.sport;
    clearInterval(interval);
    return await gameView(ctx);
  }
});

async function mainView(ctx) {
  ctx.session.sport.activeView = "mainView";
  const { typeMatch } = ctx.session.sport;
  try {
    await ctx.editMessageText(
      `${typeMatch === "live" ? "🔥 Live match" : "⭐️ Pre-match"}
Выберите тип спорта`,
      Extra.markup((m) =>
        m.inlineKeyboard([
          [
            m.callbackButton("Футбол", "Футбол"),
            m.callbackButton("Теннис", "Теннис"),
            m.callbackButton("Баскетбол", "Баскетбол"),
          ],
        ])
      )
    );
  } catch (error) {}
  if (ctx.update.callback_query) {
    await ctx.answerCbQuery();
  }
}

async function gameView(ctx) {
  ctx.session.sport.activeView = "gameView";
  const { activeBoard, typeMatch, typeSport } = ctx.session.sport;

  editMessage();
  if (ctx.update.callback_query) {
    await ctx.answerCbQuery();
  }
  const intervalId = setInterval(editMessage, 5000);
  ctx.session.sport.interval = intervalId;

  async function editMessage() {
    const { topGames } = await SportsTopGames.findOne({
      sport: `${typeSport}_${typeMatch}`,
    });
    try {
      await bot.telegram.editMessageText(
        ctx.from.id,
        activeBoard.message_id,
        null,
        `${
          typeMatch === "live" ? "🔥 Live match" : "⭐️ Pre-match"
        } ${typeSport}
Выберите матч
Время обновления: ${moment().format("HH:mm:ss")}`,
        Extra.markup((m) =>
          m.inlineKeyboard([
            ...topGames.map((item) => [
              m.callbackButton(
                `${item.home} - ${item.away}`,
                `game_id:${item.game_id}`
              ),
            ]),
            [m.callbackButton("Вернуться", "Вернуться")],
          ])
        )
      );
    } catch (error) {}
  }
}

async function gameIdView(ctx) {
  ctx.session.sport.activeView = "gameIdView";
  const game_id = ctx.update.callback_query.data.split(":")[1];

  editMessage();
  if (ctx.update.callback_query) {
    await ctx.answerCbQuery();
  }
  const intervalId = setInterval(editMessage, 5000);
  ctx.session.sport.interval = intervalId;

  async function editMessage() {
    const { typeMatch, typeSport } = ctx.session.sport;

    if (typeSport === "soccer" && typeMatch === "live") {
      await liveSoccer();
    }
    if (typeSport === "soccer" && typeMatch === "pre") {
      await preSoccer();
    }
    if (typeSport === "tennis" && typeMatch === "live") {
      await liveTennis();
    }
    if (typeSport === "tennis" && typeMatch === "pre") {
      await preTennis();
    }
    if (typeSport === "basketball" && typeMatch === "live") {
      await liveBasketball();
    }
    if (typeSport === "basketball" && typeMatch === "pre") {
      await preBasketball();
    }
  }

  async function liveSoccer() {
    const game = await SportFootballGames.findOne({ game_id });
    try {
      await bot.telegram.editMessageText(
        ctx.from.id,
        activeBoard.message_id,
        null,
        `${game.league}
${game.name}
Время обновления: ${moment().format("HH:mm:ss")}`,
        Extra.markup((m) =>
          m.inlineKeyboard([
            [
              m.callbackButton(`П1 - ${game.team1.odd}`, "p1_odd"),
              m.callbackButton(`Х - ${game.x_odd}`, "x-odd"),
              m.callbackButton(`П2 - ${game.team2.odd}`, "p2_odd"),
            ],
            [m.callbackButton("Вернуться", "Вернуться")],
          ])
        )
      );
    } catch (error) {}
  }
  async function preSoccer() {}

  async function liveTennis() {}
  async function preTennis() {}

  async function liveBasketball() {}
  async function preBasketball() {}
}

module.exports = { sportMenu };
