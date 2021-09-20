const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");
const Scene = require("telegraf/scenes/base");

const moment = require("moment");
const isNumber = require("is-number");

const { bot } = require("../init/startBot");
const { setupStart, showMainMenu } = require("../commands/start");
const { mainMenuActions } = require("./mainMenu.scene");

const User = require("../models/user");
const MainStats = require("../models/mainstats");
const SportRates = require("../models/sportRates");
const ActiveGames = require("../models/activeGames");
const TennisGames = require("../models/tennisGames");
const BasketballGames = require("../models/basketballGames");
const FootballGames = require("../models/footballGames");

const { reqTennis } = require("../helpers/parseTennis");
const { reqFootball } = require("../helpers/parseSoccer");
const { reqBasketball } = require("../helpers/parseBasketball");

const sportMenu = new Scene("sportMenu");

setupStart(sportMenu);
mainMenuActions(sportMenu);

sportMenu.enter(async (ctx) => {
  try {
    const typeMatch = "live";
    await ctx.reply(
      `Выберите тип спорта`,
      Extra.markup(
        Markup.keyboard([
          ["🔥 Live", "⭐️ Pre-match"],
          ["🏡 Вернуться на главную"],
        ]).resize()
      )
    );
    const activeBoard = await ctx.reply(
      `${typeMatch === "live" ? "🔥 Live match" : "⭐️ Pre-match"}`,
      Extra.markup((m) =>
        m.inlineKeyboard([
          [
            m.callbackButton("Футбол", "Футбол"),
            m.callbackButton("Теннис", "Теннис"),
            m.callbackButton("Баскетбол", "Баскетбол"),
          ],
          [m.callbackButton("Мои ставки", "Мои ставки")],
        ])
      )
    );

    const { mainBalance } = await User.findOne({
      userId: ctx.from.id,
    });

    ctx.session.sport = {
      rate: {},
      sumAmount: 0,
      valueRate: 10,
      mainBalance,
      typeMatch,
      activeBoard,
      activeView: "mainView",
    };
  } catch (error) {}
});

sportMenu.command("start", (ctx) => ctx.scene.enter("showMainMenu"));

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

sportMenu.action("Мои ставки", async (ctx) => {
  await ratesView(ctx);
});

sportMenu.action(/(?:game_id)/, async (ctx) => {
  const { interval, game_id } = ctx.session.sport;

  clearInterval(interval);

  try {
    await ctx.answerCbQuery();
  } catch (error) {}

  if (game_id) {
    await ActiveGames.deleteOne({ game_id });
  }

  await gameIdView(ctx);
});

sportMenu.action("Вернуться", async (ctx) => {
  const { activeView } = ctx.session.sport;

  if (activeView === "mainView") return;

  if (activeView === "ratesView") {
    await mainView(ctx);
  }

  if (activeView === "gameView") {
    const { interval } = ctx.session.sport;
    clearInterval(interval);
    await mainView(ctx);
  }

  if (activeView === "gameIdView") {
    const { interval } = ctx.session.sport;
    clearInterval(interval);
    await gameView(ctx);
  }

  try {
    await ctx.answerCbQuery();
  } catch (error) {}
});

sportMenu.hears("🏡 Вернуться на главную", async (ctx) => {
  const { activeBoard, interval, game_id } = ctx.session.sport;
  clearInterval(interval);

  try {
    await ctx.deleteMessage(activeBoard.message_id);
  } catch (error) {}
  if (game_id) {
    await ActiveGames.deleteOne({ game_id });
  }

  await showMainMenu(ctx);
});

sportMenu.hears("🔥 Live", async (ctx) => {
  const { activeBoard, activeView, typeMatch, game_id } = ctx.session.sport;

  // Удаляем сообщение "🔥 Live"
  try {
    await ctx.deleteMessage(ctx.update.message.message_id);
  } catch (error) {}

  if (game_id) {
    await ActiveGames.deleteOne({ game_id });
  }

  if (typeMatch === "live") return;
  ctx.session.sport.typeMatch = "live";

  if (activeView === "mainView") {
    try {
      return await bot.telegram.editMessageText(
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
            [m.callbackButton("Мои ставки", "Мои ставки")],
          ])
        )
      );
    } catch (error) {}
  }

  const { interval } = ctx.session.sport;
  clearInterval(interval);
  await gameView(ctx);
});

sportMenu.hears("⭐️ Pre-match", async (ctx) => {
  const { activeBoard, activeView, typeMatch, game_id } = ctx.session.sport;

  // Удаляем сообщение "⭐️ Pre-match"
  try {
    await ctx.deleteMessage(ctx.update.message.message_id);
  } catch (error) {}

  if (game_id) {
    await ActiveGames.deleteOne({ game_id });
  }

  if (typeMatch === "pre") return;
  ctx.session.sport.typeMatch = "pre";

  if (activeView === "mainView") {
    try {
      return await bot.telegram.editMessageText(
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
            [m.callbackButton("Мои ставки", "Мои ставки")],
          ])
        )
      );
    } catch (error) {}
  }

  const { interval } = ctx.session.sport;
  clearInterval(interval);
  await gameView(ctx);
});

sportMenu.action("🗑 Очистить ставки", async (ctx) => {
  const sport = ctx.session.sport;

  // Если ставок не было сделано, выбрасываем уведомление
  if (sport.sumAmount === 0) {
    try {
      return await ctx.answerCbQuery("Ставок не было", true);
    } catch (error) {}
  }

  const { mainBalance } = await User.findOne({
    userId: ctx.from.id,
  });

  ctx.session.sport = {
    ...sport,
    rate: {},
    sumAmount: 0,
    mainBalance,
  };

  editMessage(ctx);
});

sportMenu.action("💰 Поставить", async (ctx) => {
  const { rate, sumAmount, mainBalance, game, typeSport } = ctx.session.sport;

  if (sumAmount === 0) {
    try {
      return await ctx.answerCbQuery("Ставок не было", true);
    } catch (error) {}
  }

  const rates = await SportRates.find();
  await User.updateOne({ userId: ctx.from.id }, { mainBalance });

  const sportRate = new SportRates({
    rate_id: rates.length + 1,
    game_id: game.game_id,
    home: game.home,
    away: game.away,
    userId: ctx.from.id,
    status: "active",
    typeSport,
    rates: rate,
    odds: game.odds,
    sumAmount,
    result: {},
    date: moment().format("DD.MM.YYYY HH:mm:ss"),
  });
  await sportRate.save();

  ctx.session.sport = {
    ...ctx.session.sport,
    rate: {},
    sumAmount: 0,
  };

  try {
    await ctx.answerCbQuery("Вы успешно сделали ставку", true);
  } catch (error) {}
  editMessage(ctx);
});

sportMenu.action(/(?:10₽|50₽|100₽|250₽|500₽)/, async (ctx) => {
  const sport = ctx.session.sport;
  const value = +ctx.update.callback_query.data.match(/\d+/g)[0];

  if (sport.valueRate === value) {
    try {
      return await ctx.answerCbQuery();
    } catch (error) {}
  }

  try {
    await ctx.answerCbQuery();
  } catch (error) {}

  ctx.session.sport.valueRate = value;
  editMessage(ctx);
});

sportMenu.on("text", async (ctx) => {
  const sport = ctx.session.sport;
  const msg = +ctx.update.message.text;

  if (sport.activeView !== "gameIdView") return;

  if (!isNumber(msg)) {
    try {
      await ctx.reply("Пожалуйста, введите только положительные цифры.");
    } catch (error) {}
    return;
  }

  const rate = +msg.toFixed(2);

  if (sport.mainBalance < rate) {
    try {
      return await ctx.reply(
        "Вы не можете выбрать размер ставки превышающий ваш игровой баланс."
      );
    } catch (error) {}
  }

  const { minGameRate } = await MainStats.findOne();

  if (rate < minGameRate) {
    try {
      return await ctx.reply(
        `Минимальная сумма ставки составляет ${minGameRate} ₽`
      );
    } catch (error) {}
  }

  ctx.session.sport.valueRate = rate;
  editMessage(ctx);

  try {
    await ctx.reply(`Вы успешно выбрали размер ставки: ${rate} ₽`);
  } catch (error) {}
});

async function mainView(ctx) {
  ctx.session.sport.activeView = "mainView";
  const { activeBoard, typeMatch } = ctx.session.sport;
  try {
    await bot.telegram.editMessageText(
      ctx.from.id,
      activeBoard.message_id,
      null,
      `${typeMatch === "live" ? "🔥 Live match" : "⭐️ Pre-match"}`,
      Extra.markup((m) =>
        m.inlineKeyboard([
          [
            m.callbackButton("Футбол", "Футбол"),
            m.callbackButton("Теннис", "Теннис"),
            m.callbackButton("Баскетбол", "Баскетбол"),
          ],
          [m.callbackButton("Мои ставки", "Мои ставки")],
        ])
      )
    );
  } catch (error) {}
}

async function gameView(ctx) {
  ctx.session.sport.activeView = "gameView";
  const { activeBoard, typeMatch, typeSport, game_id } = ctx.session.sport;

  if (game_id) {
    await ActiveGames.deleteOne({ game_id });
  }

  editMessage();

  if (ctx.update.callback_query) {
    await ctx.answerCbQuery();
  }

  const intervalId = setInterval(editMessage, 1000 * 10);
  ctx.session.sport.interval = intervalId;

  async function editMessage() {
    const time_status = typeMatch === "live" ? 1 : 0;
    let games = [];
    if (typeSport === "soccer") {
      games = await FootballGames.find({ time_status });
    }
    if (typeSport === "basketball") {
      games = await BasketballGames.find({ time_status });
    }
    if (typeSport === "tennis") {
      games = await TennisGames.find({ time_status });
    }
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
            ...games.map((item) => {
              const date =
                item.time.split(".")[0] + "." + item.time.split(".")[1];
              return [
                m.callbackButton(
                  `${typeMatch === "live" ? "" : `[ ${date} ]`}  ${
                    item.home
                  } - ${item.away}`,
                  `game_id:${item.game_id}`
                ),
              ];
            }),
            [m.callbackButton("Вернуться", "Вернуться")],
          ])
        )
      );
    } catch (error) {}
  }
}

async function ratesView(ctx) {
  ctx.session.sport.activeView = "ratesView";
  const { activeBoard } = ctx.session.sport;

  const rates = await SportRates.find({ userId: ctx.from.id })
    .sort({ _id: -1 })
    .limit(10);

  const ratesMsg = rates
    .map((item) => {
      let rates = "";
      const typeSport = item.typeSport;

      for (let [key, value] of Object.entries(item.rates)) {
        rates = rates.concat(
          `- ${parseNameOdds(typeSport, key)}  [x${
            item.odds[key]
          }]  💰 ${value} P\n`
        );
      }

      if (typeSport === "soccer") {
        return `#${item.rate_id} ⚽️
${item.home} - ${item.away}
Статус: ${
          item.status === "cashout"
            ? `Расчитано\nВыигрыш: ${item.result.cash} P`
            : "Ожидание"
        }
Ваши ставки: 
${rates}`;
      }
      if (typeSport === "basketball") {
        return `#${item.rate_id} 🏀
${item.home} - ${item.away}
Статус: ${
          item.status === "cashout"
            ? `Расчитано\nВыигрыш: ${item.result.cash} P`
            : "Ожидание"
        }
Ваши ставки: 
${rates}`;
      }
      if (typeSport === "tennis") {
        return `#${item.rate_id} 🎾
${item.home} - ${item.away}
Статус: ${
          item.status === "cashout"
            ? `Расчитано\nВыигрыш: ${item.result.cash} P`
            : "Ожидание"
        }
Ваши ставки: 
${rates}`;
      }
    })
    .join("\n");

  try {
    await bot.telegram.editMessageText(
      ctx.from.id,
      activeBoard.message_id,
      null,
      `Ваши последние 10 ставок

${ratesMsg}`,
      Extra.markup((m) =>
        m.inlineKeyboard([[m.callbackButton("Вернуться", "Вернуться")]])
      )
    );
  } catch (error) {}
}

function parseNameOdds(typeSport, key) {
  if (typeSport === "soccer") {
    if (key === "p1") return "П1 (М)";
    if (key === "draw") return "Х (М)";
    if (key === "p2") return "П2 (М)";
    if (key === "FH_p1") return "П1 (FH)";
    if (key === "FH_draw") return "X (FH)";
    if (key === "FH_p2") return "П2 (FH)";
    if (key === "SH_p1") return "П1 (SH)";
    if (key === "SH_draw") return "X (SH)";
    if (key === "SH_p2") return "П2 (SH)";
    if (key === "even") return "Чет";
    if (key === "odd") return "Нечет";
    if (key === "BTS_yes") return "Обе забьют (M) ДА";
    if (key === "BTS_no") return "Обе забьют (M) НЕТ";
    if (key === "BTS1H_yes") return "Обе забьют (FH) ДА";
    if (key === "BTS1H_no") return "Обе забьют (FH) НЕТ";
    if (key === "BTS2H_yes") return "Обе забьют (SH) ДА";
    if (key === "BTS2H_no") return "Обе забьют (SH) НЕТ";
  }
  if (typeSport === "basketball") {
    if (
      key.match(/(?:gl|spread)/g) &&
      key.match(/(?:gl|spread)/g).length === 2
    ) {
      const keyArr = key.split("_");
      const numbTeam = keyArr[1].replace("t", "");
      return `Фора K${numbTeam} ${keyArr[3]}`;
    }
    if (key.match(/(?:gl|total)/g) && key.match(/(?:gl|total)/g).length === 2) {
      const keyArr = key.split("_");
      const total = keyArr[3].replace(/o|u/, "");
      const type = keyArr[3].match(/o|u/)[0].toUpperCase();
      return `Тотал ${total}${type.replace("O", "Б").replace("U", "М")}`;
    }
    if (
      key.match(/(?:gl|moneyline)/g) &&
      key.match(/(?:gl|moneyline)/g).length === 2
    ) {
      const keyArr = key.split("_");
      const numbTeam = keyArr[1].replace("t", "");
      return `П${numbTeam} (М)`;
    }
    if (
      key.match(/(?:fsth|spread)/g) &&
      key.match(/(?:fsth|spread)/g).length === 2
    ) {
      const keyArr = key.split("_");
      const numbTeam = keyArr[1].replace("t", "");
      return `Фора (FH) K${numbTeam} ${keyArr[3]}`;
    }
    if (
      key.match(/(?:fsth|total)/g) &&
      key.match(/(?:fsth|total)/g).length === 2
    ) {
      const keyArr = key.split("_");
      const total = keyArr[3].replace(/o|u/, "");
      const type = keyArr[3].match(/o|u/)[0].toUpperCase();
      return `Тотал (FH) ${total}${type.replace("O", "Б").replace("U", "М")}`;
    }
    if (
      key.match(/(?:fsth|moneyline)/g) &&
      key.match(/(?:fsth|moneyline)/g).length === 2
    ) {
      const keyArr = key.split("_");
      const numbTeam = keyArr[1].replace("t", "");
      return `П${numbTeam} (FH)`;
    }
    if (
      key.match(/(?:sndh|spread)/g) &&
      key.match(/(?:sndh|spread)/g).length === 2
    ) {
      const keyArr = key.split("_");
      const numbTeam = keyArr[1].replace("t", "");
      return `Фора (SH) K${numbTeam} ${keyArr[3]}`;
    }
    if (
      key.match(/(?:sndh|total)/g) &&
      key.match(/(?:sndh|total)/g).length === 2
    ) {
      const keyArr = key.split("_");
      const total = keyArr[3].replace(/o|u/, "");
      const type = keyArr[3].match(/o|u/)[0].toUpperCase();
      return `Тотал (SH) ${total}${type.replace("O", "Б").replace("U", "М")}`;
    }
    if (
      key.match(/(?:sndh|moneyline)/g) &&
      key.match(/(?:sndh|moneyline)/g).length === 2
    ) {
      const keyArr = key.split("_");
      const numbTeam = keyArr[1].replace("t", "");
      return `П${numbTeam} (SH)`;
    }
    if (key.match(/(?:HSH_fh)/g)) {
      return `Больше всего очков (FH)`;
    }
    if (key.match(/(?:HSH_sh)/g)) {
      return `Больше всего очков (SH)`;
    }
    if (key.match(/(?:HSH_tie)/g)) {
      return `Больше всего очков (Tie)`;
    }
    if (key.match(/(?:odd)/g)) {
      const type = key.replace("odd_", "");
      return `Нечет ${type}`;
    }
    if (key.match(/(?:even)/g)) {
      const type = key.replace("even_", "");
      return `Чет ${type}`;
    }
  }
  if (typeSport === "tennis") {
    if (key === "tw_p1_match") return "П1 (Матч)";
    if (key === "tw_p2_match") return "П2 (Матч)";
    if (key === "tw_p1_set1") return "П1 (сет 1)";
    if (key === "tw_p2_set1") return "П2 (сет 1)";
    if (key === "tw_p1_set2") return "П1 (сет 2)";
    if (key === "tw_p2_set2") return "П2 (сет 2)";
    if (key === "tw_p1_set3") return "П1 (сет 3)";
    if (key === "tw_p2_set3") return "П2 (сет 3)";
    if (key.match(/tgs1_over/)) {
      const total = key.replace("tgs1_over_", "");
      return `ТG (сет 1) ${total}Б`;
    }
    if (key.match(/tgs1_under/)) {
      const total = key.replace("tgs1_under_", "");
      return `ТG (сет 1) ${total}M`;
    }
    if (key.match(/tgs2_over/)) {
      const total = key.replace("tgs2_over_", "");
      return `ТG (сет 2) ${total}Б`;
    }
    if (key.match(/tgs2_under/)) {
      const total = key.replace("tgs2_under_", "");
      return `ТG (сет 2) ${total}M`;
    }
    if (key.match(/tgs3_over/)) {
      const total = key.replace("tgs3_over_", "");
      return `ТG (сет 3) ${total}Б`;
    }
    if (key.match(/tgs3_under/)) {
      const total = key.replace("tgs3_under_", "");
      return `ТG (сет 3) ${total}M`;
    }
    if (key.match(/tgm_over/)) {
      const total = key.replace("tgm_over_", "");
      return `ТG (Матч) ${total}Б`;
    }
    if (key.match(/tgm_under/)) {
      const total = key.replace("tgm_under_", "");
      return `ТG (Матч) ${total}M`;
    }
    if (key.match(/sb_p1_2-0/)) return "Счет 2-0 П1";
    if (key.match(/sb_p2_2-0/)) return "Счет 2-0 П2";
    if (key.match(/sb_p1_2-1/)) return "Счет 2-1 П1";
    if (key.match(/sb_p2_2-1/)) return "Счет 2-1 П2";
    if (key.match(/TS2/)) return "Тотал сетов 2";
    if (key.match(/TS3/)) return "Тотал сетов 3";
    if (key.match(/MTGOE_odd/)) return "Тотал геймов НЕЧЕТ";
    if (key.match(/MTGOE_even/)) return "Тотал геймов ЧЕТ";
    if (key === "S2W_p1") return "П1 (сет 2)";
    if (key === "S2W_p2") return "П2 (сет 2)";
    if (key === "S3W_p1") return "П1 (сет 3)";
    if (key === "S3W_p2") return "П2 (сет 3)";
  }
  return key;
}

const vld = async (ctx, action) => {
  const { sumAmount, mainBalance } = ctx.session.sport;
  const value = ctx.session.sport.valueRate;
  if (sumAmount + value > mainBalance) {
    return await ctx.answerCbQuery("У вас недостаточно баланса", true);
  }
  if (!ctx.session.sport.rate[action]) {
    ctx.session.sport.rate[action] = 0;
  }
  ctx.session.sport.rate[action] += value;
  ctx.session.sport.sumAmount += value;
  ctx.session.sport.mainBalance -= value;
  editMessage(ctx);
  if (ctx.update.callback_query) {
    await ctx.answerCbQuery();
  }
};

const soccerExtra = (game, ctx) => {
  const sport = ctx.session.sport;

  const valueRate = (count) => {
    if (sport.valueRate === count) {
      return `✅ ${count}₽`;
    }
    return `${count}₽`;
  };

  const extra = {
    inline_keyboard: [
      [
        {
          text: valueRate(10),
          callback_data: valueRate(10),
        },
        {
          text: valueRate(50),
          callback_data: valueRate(50),
        },
        {
          text: valueRate(100),
          callback_data: valueRate(100),
        },
        {
          text: valueRate(250),
          callback_data: valueRate(250),
        },
        {
          text: valueRate(500),
          callback_data: valueRate(500),
        },
      ],
    ],
  };

  if (game.odds && game.odds.p1) {
    extra.inline_keyboard.push([
      {
        text: `П1 (М) - ${game.odds.p1}`,
        callback_data: "p1",
      },
      {
        text: `Х (М) - ${game.odds.draw}`,
        callback_data: "draw",
      },
      {
        text: `П1 (М) - ${game.odds.p2}`,
        callback_data: "p2",
      },
    ]);
  }

  if (game.odds && game.odds.FH_p1) {
    extra.inline_keyboard.push([
      {
        text: `П1 (FH) - ${game.odds.FH_p1}`,
        callback_data: "FH_p1",
      },
      {
        text: `Х (FH) - ${game.odds.FH_draw}`,
        callback_data: "FH_draw",
      },
      {
        text: `П1 (FH) - ${game.odds.FH_p2}`,
        callback_data: "FH_p2",
      },
    ]);
  }

  if (game.odds && game.odds.SH_p1) {
    extra.inline_keyboard.push([
      {
        text: `П1 (SH) - ${game.odds.SH_p1}`,
        callback_data: "SH_p1",
      },
      {
        text: `Х (SH) - ${game.odds.SH_draw}`,
        callback_data: "SH_draw",
      },
      {
        text: `П1 (SH) - ${game.odds.SH_p2}`,
        callback_data: "SH_p2",
      },
    ]);
  }

  if (game.odds && game.odds.odd) {
    extra.inline_keyboard.push([
      {
        text: `Чет - ${game.odds.even}`,
        callback_data: "even",
      },
      {
        text: `Нечет - ${game.odds.odd}`,
        callback_data: "odd",
      },
    ]);
  }

  if (game.odds && game.odds.BTS_yes) {
    extra.inline_keyboard.push([
      {
        text: `Обе забьют (M) ДА - ${game.odds.BTS_yes}`,
        callback_data: "BTS_yes",
      },
      {
        text: `Обе забьют (M) НЕТ - ${game.odds.BTS_no}`,
        callback_data: "BTS_no",
      },
    ]);
  }

  if (game.odds && game.odds.BTS1H_yes) {
    extra.inline_keyboard.push([
      {
        text: `Обе забьют (FH) ДА - ${game.odds.BTS1H_yes}`,
        callback_data: "BTS1H_yes",
      },
      {
        text: `Обе забьют (FH) НЕТ - ${game.odds.BTS1H_no}`,
        callback_data: "BTS1H_no",
      },
    ]);
  }

  if (game.odds && game.odds.BTS2H_yes) {
    extra.inline_keyboard.push([
      {
        text: `Обе забьют (SH) ДА - ${game.odds.BTS2H_yes}`,
        callback_data: "BTS2H_yes",
      },
      {
        text: `Обе забьют (SH) НЕТ - ${game.odds.BTS2H_no}`,
        callback_data: "BTS2H_no",
      },
    ]);
  }

  if (game.odds && game.odds.totals) {
    const objArr = [];
    for (let [key, value] of Object.entries(game.odds.totals)) {
      objArr.push({
        text: `Тотал ${key.replace("O", "Б").replace("U", "М")} - ${value}`,
        callback_data: `T${key.match(/O|U/g)[0]}:${key}`,
        weight: +key.match(/\d/g).join(""),
      });
    }
    objArr.sort((a, b) => a.weight - b.weight);
    const totalsArr = separate(objArr);
    extra.inline_keyboard.push(...totalsArr);
  }

  extra.inline_keyboard.push([
    {
      text: "🗑 Очистить ставки",
      callback_data: "🗑 Очистить ставки",
    },
    {
      text: "💰 Поставить",
      callback_data: "💰 Поставить",
    },
  ]);

  extra.inline_keyboard.push([
    {
      text: "Вернуться",
      callback_data: "Вернуться",
    },
  ]);

  return extra;
};
(function soccerAction() {
  sportMenu.action("p1", async (ctx) => await vld(ctx, "p1"));
  sportMenu.action("draw", async (ctx) => await vld(ctx, "draw"));
  sportMenu.action("p2", async (ctx) => await vld(ctx, "p2"));
  sportMenu.action("even", async (ctx) => await vld(ctx, "even"));
  sportMenu.action("odd", async (ctx) => await vld(ctx, "odd"));
  sportMenu.action("FH_p1", async (ctx) => await vld(ctx, "FH_p1"));
  sportMenu.action("FH_draw", async (ctx) => await vld(ctx, "FH_draw"));
  sportMenu.action("FH_p2", async (ctx) => await vld(ctx, "FH_p2"));
  sportMenu.action("SH_p1", async (ctx) => await vld(ctx, "SH_p1"));
  sportMenu.action("SH_draw", async (ctx) => await vld(ctx, "SH_draw"));
  sportMenu.action("SH_p2", async (ctx) => await vld(ctx, "SH_p2"));
  sportMenu.action("BTS_yes", async (ctx) => await vld(ctx, "BTS_yes"));
  sportMenu.action("BTS_no", async (ctx) => await vld(ctx, "BTS_no"));
  sportMenu.action("BTS1H_yes", async (ctx) => await vld(ctx, "BTS1H_yes"));
  sportMenu.action("BTS1H_no", async (ctx) => await vld(ctx, "BTS1H_no"));
  sportMenu.action("BTS2H_yes", async (ctx) => await vld(ctx, "BTS2H_yes"));
  sportMenu.action("BTS2H_no", async (ctx) => await vld(ctx, "BTS2H_no"));
  sportMenu.action(/(?:TO:)/, async (ctx) => {
    const total = ctx.update.callback_query.data.replace("TO:", "");
    await vld(ctx, total);
  });
  sportMenu.action(/(?:TU:)/, async (ctx) => {
    const total = ctx.update.callback_query.data.replace("TU:", "");
    await vld(ctx, total);
  });
})();

const basketBallExtra = (game, ctx) => {
  const sport = ctx.session.sport;

  const valueRate = (count) => {
    if (sport.valueRate === count) {
      return `✅ ${count}₽`;
    }
    return `${count}₽`;
  };

  const extra = {
    inline_keyboard: [
      [
        {
          text: valueRate(10),
          callback_data: valueRate(10),
        },
        {
          text: valueRate(50),
          callback_data: valueRate(50),
        },
        {
          text: valueRate(100),
          callback_data: valueRate(100),
        },
        {
          text: valueRate(250),
          callback_data: valueRate(250),
        },
        {
          text: valueRate(500),
          callback_data: valueRate(500),
        },
      ],
    ],
  };

  if (game.odds && Object.keys(game.odds).length !== 0) {
    const gl_spread = [];
    const gl_total = [];
    const gl_moneyline = [];
    const fsth_spread = [];
    const fsth_total = [];
    const fsth_moneyline = [];
    const sndh_spread = [];
    const sndh_total = [];
    const sndh_moneyline = [];
    const HSH = [];
    const odd_even = {};
    for (let [key, value] of Object.entries(game.odds)) {
      if (
        key.match(/(?:gl|spread)/g) &&
        key.match(/(?:gl|spread)/g).length === 2
      ) {
        const keyArr = key.split("_");
        const numbTeam = keyArr[1].replace("t", "");
        gl_spread.push({
          text: `Фора K${numbTeam} ${keyArr[3]} - ${value}`,
          callback_data: key,
        });
      }

      if (
        key.match(/(?:gl|total)/g) &&
        key.match(/(?:gl|total)/g).length === 2
      ) {
        const keyArr = key.split("_");
        const total = keyArr[3].replace(/o|u/, "");
        const type = keyArr[3].match(/o|u/)[0].toUpperCase();
        gl_total.push({
          text: `Тотал ${total}${type
            .replace("O", "Б")
            .replace("U", "М")} - ${value}`,
          callback_data: key,
        });
      }

      if (
        key.match(/(?:gl|moneyline)/g) &&
        key.match(/(?:gl|moneyline)/g).length === 2
      ) {
        const keyArr = key.split("_");
        const numbTeam = keyArr[1].replace("t", "");
        gl_moneyline.push({
          text: `П${numbTeam} (М) - ${value}`,
          callback_data: key,
        });
      }

      if (
        key.match(/(?:fsth|spread)/g) &&
        key.match(/(?:fsth|spread)/g).length === 2
      ) {
        const keyArr = key.split("_");
        const numbTeam = keyArr[1].replace("t", "");
        fsth_spread.push({
          text: `Фора (FH) K${numbTeam} ${keyArr[3]} - ${value}`,
          callback_data: key,
        });
      }

      if (
        key.match(/(?:fsth|total)/g) &&
        key.match(/(?:fsth|total)/g).length === 2
      ) {
        const keyArr = key.split("_");
        const total = keyArr[3].replace(/o|u/, "");
        const type = keyArr[3].match(/o|u/)[0].toUpperCase();
        fsth_total.push({
          text: `Тотал (FH) ${total}${type
            .replace("O", "Б")
            .replace("U", "М")} - ${value}`,
          callback_data: key,
        });
      }

      if (
        key.match(/(?:fsth|moneyline)/g) &&
        key.match(/(?:fsth|moneyline)/g).length === 2
      ) {
        const keyArr = key.split("_");
        const numbTeam = keyArr[1].replace("t", "");
        fsth_moneyline.push({
          text: `П${numbTeam} (FH) - ${value}`,
          callback_data: key,
        });
      }

      if (
        key.match(/(?:sndh|spread)/g) &&
        key.match(/(?:sndh|spread)/g).length === 2
      ) {
        const keyArr = key.split("_");
        const numbTeam = keyArr[1].replace("t", "");
        sndh_spread.push({
          text: `Фора (SH) K${numbTeam} ${keyArr[3]} - ${value}`,
          callback_data: key,
        });
      }

      if (
        key.match(/(?:sndh|total)/g) &&
        key.match(/(?:sndh|total)/g).length === 2
      ) {
        const keyArr = key.split("_");
        const total = keyArr[3].replace(/o|u/, "");
        const type = keyArr[3].match(/o|u/)[0].toUpperCase();
        sndh_total.push({
          text: `Тотал (SH) ${total}${type
            .replace("O", "Б")
            .replace("U", "М")} - ${value}`,
          callback_data: key,
        });
      }

      if (
        key.match(/(?:sndh|moneyline)/g) &&
        key.match(/(?:sndh|moneyline)/g).length === 2
      ) {
        const keyArr = key.split("_");
        const numbTeam = keyArr[1].replace("t", "");
        sndh_moneyline.push({
          text: `П${numbTeam} (SH) - ${value}`,
          callback_data: key,
        });
      }

      if (key.match(/(?:HSH_fh)/g)) {
        HSH.push({
          text: `Больше всего очков (FH) - ${value}`,
          callback_data: key,
        });
      }

      if (key.match(/(?:HSH_sh)/g)) {
        HSH.push({
          text: `Больше всего очков (SH) - ${value}`,
          callback_data: key,
        });
      }

      if (key.match(/(?:HSH_tie)/g)) {
        HSH.push({
          text: `Больше всего очков (Tie) - ${value}`,
          callback_data: key,
        });
      }

      if (key.match(/(?:odd)/g)) {
        const type = key.replace("odd_", "");
        if (!odd_even[type]) {
          odd_even[type] = {};
        }
        odd_even[type].odd = {
          text: `Нечет ${type} - ${value}`,
          callback_data: key,
        };
      }

      if (key.match(/(?:even)/g)) {
        const type = key.replace("even_", "");
        odd_even[type].even = {
          text: `Чет ${type} - ${value}`,
          callback_data: key,
        };
      }
    }

    if (gl_spread.length !== 0) extra.inline_keyboard.push(gl_spread);
    if (gl_total.length !== 0) extra.inline_keyboard.push(gl_total);
    if (gl_moneyline.length !== 0) extra.inline_keyboard.push(gl_moneyline);
    if (fsth_spread.length !== 0) extra.inline_keyboard.push(fsth_spread);
    if (fsth_total.length !== 0) extra.inline_keyboard.push(fsth_total);
    if (fsth_moneyline.length !== 0) extra.inline_keyboard.push(fsth_moneyline);
    if (sndh_spread.length !== 0) extra.inline_keyboard.push(sndh_spread);
    if (sndh_total.length !== 0) extra.inline_keyboard.push(sndh_total);
    if (sndh_moneyline.length !== 0) extra.inline_keyboard.push(sndh_moneyline);
    if (HSH.length !== 0) extra.inline_keyboard.push(HSH);
    if (Object.keys(odd_even).length !== 0) {
      for (let [key, value] of Object.entries(odd_even)) {
        extra.inline_keyboard.push([value.odd, value.even]);
      }
    }
  }

  extra.inline_keyboard.push([
    {
      text: "🗑 Очистить ставки",
      callback_data: "🗑 Очистить ставки",
    },
    {
      text: "💰 Поставить",
      callback_data: "💰 Поставить",
    },
  ]);

  extra.inline_keyboard.push([
    {
      text: "Вернуться",
      callback_data: "Вернуться",
    },
  ]);

  return extra;
};
(async function basketballAction() {
  sportMenu.action(/gl_t1/, async (ctx) => {
    const action = ctx.update.callback_query.data;
    await vld(ctx, action);
  });
  sportMenu.action(/gl_t2/, async (ctx) => {
    const action = ctx.update.callback_query.data;
    await vld(ctx, action);
  });
  sportMenu.action(/fsth_t1/, async (ctx) => {
    const action = ctx.update.callback_query.data;
    await vld(ctx, action);
  });
  sportMenu.action(/fsth_t2/, async (ctx) => {
    const action = ctx.update.callback_query.data;
    await vld(ctx, action);
  });
  sportMenu.action(/sndh_t1/, async (ctx) => {
    const action = ctx.update.callback_query.data;
    await vld(ctx, action);
  });
  sportMenu.action(/sndh_t2/, async (ctx) => {
    const action = ctx.update.callback_query.data;
    await vld(ctx, action);
  });
  sportMenu.action(/odd_/, async (ctx) => {
    const action = ctx.update.callback_query.data;
    await vld(ctx, action);
  });
  sportMenu.action(/even_/, async (ctx) => {
    const action = ctx.update.callback_query.data;
    await vld(ctx, action);
  });
  sportMenu.action(/HSH_/, async (ctx) => {
    const action = ctx.update.callback_query.data;
    await vld(ctx, action);
  });
})();

const tennisExtra = (game, ctx) => {
  const sport = ctx.session.sport;

  const valueRate = (count) => {
    if (sport.valueRate === count) {
      return `✅ ${count}₽`;
    }
    return `${count}₽`;
  };

  const extra = {
    inline_keyboard: [
      [
        {
          text: valueRate(10),
          callback_data: valueRate(10),
        },
        {
          text: valueRate(50),
          callback_data: valueRate(50),
        },
        {
          text: valueRate(100),
          callback_data: valueRate(100),
        },
        {
          text: valueRate(250),
          callback_data: valueRate(250),
        },
        {
          text: valueRate(500),
          callback_data: valueRate(500),
        },
      ],
    ],
  };

  if (game.odds && Object.keys(game.odds).length !== 0) {
    for (let [key, value] of Object.entries(game.odds)) {
      if (key === "tw_p1_match") {
        extra.inline_keyboard.push([
          {
            text: `П1 (Матч) - ${value}`,
            callback_data: key,
          },
          {
            text: `П2 (Матч) - ${game.odds[key.replace("1", "2")]}`,
            callback_data: key.replace("1", "2"),
          },
        ]);
      }

      if (key === "tw_p1_set1") {
        extra.inline_keyboard.push([
          {
            text: `П1 (сет 1) - ${value}`,
            callback_data: key,
          },
          {
            text: `П2 (сет 1) - ${game.odds[key.replace("1", "2")]}`,
            callback_data: key.replace("1", "2"),
          },
        ]);
      }

      if (key === "tw_p1_set2") {
        extra.inline_keyboard.push([
          {
            text: `П1 (сет 2) - ${value}`,
            callback_data: key,
          },
          {
            text: `П2 (сет 2) - ${game.odds[key.replace("1", "2")]}`,
            callback_data: key.replace("1", "2"),
          },
        ]);
      }

      if (key === "tw_p1_set3") {
        extra.inline_keyboard.push([
          {
            text: `П1 (сет 3) - ${value}`,
            callback_data: key,
          },
          {
            text: `П2 (сет 3) - ${game.odds[key.key("1", "2")]}`,
            callback_data: key.key("1", "2"),
          },
        ]);
      }

      if (key.match(/tgs1_over/)) {
        const total = key.replace("tgs1_over_", "");
        extra.inline_keyboard.push([
          {
            text: `ТG (сет 1) ${total}Б - ${value}`,
            callback_data: key,
          },
          {
            text: `ТG (сет 1) ${total}М - ${
              game.odds[key.replace("over", "under")]
            }`,
            callback_data: key.replace("over", "under"),
          },
        ]);
      }

      if (key.match(/tgs2_over/)) {
        const total = key.replace("tgs2_over_", "");
        extra.inline_keyboard.push([
          {
            text: `ТG (сет 2) ${total}Б - ${value}`,
            callback_data: key,
          },
          {
            text: `ТG (сет 2) ${total}М - ${
              game.odds[key.replace("over", "under")]
            }`,
            callback_data: key.replace("over", "under"),
          },
        ]);
      }

      if (key.match(/tgs3_over/)) {
        const total = key.replace("tgs3_over_", "");
        extra.inline_keyboard.push([
          {
            text: `ТG (сет 3) ${total}Б - ${value}`,
            callback_data: key,
          },
          {
            text: `ТG (сет 3) ${total}М - ${
              game.odds[key.replace("over", "under")]
            }`,
            callback_data: key.replace("over", "under"),
          },
        ]);
      }

      if (key.match(/tgm_over/)) {
        const total = key.replace("tgm_over_", "");
        extra.inline_keyboard.push([
          {
            text: `ТG (Матч) ${total}Б - ${value}`,
            callback_data: key,
          },
          {
            text: `ТG (Матч) ${total}М - ${
              game.odds[key.replace("over", "under")]
            }`,
            callback_data: key.replace("over", "under"),
          },
        ]);
      }

      if (key.match(/sb_p1_2-0/)) {
        if (game.odds[key.replace("p1", "p2")]) {
          extra.inline_keyboard.push([
            {
              text: `Счет 2-0 П1 - ${value}`,
              callback_data: key,
            },
            {
              text: `Счет 2-0 П2 - ${game.odds[key.replace("p1", "p2")]}`,
              callback_data: key.replace("p1", "p2"),
            },
          ]);
        }
      }

      if (key.match(/sb_p1_2-1/)) {
        if (game.odds[key.replace("p1", "p2")]) {
          extra.inline_keyboard.push([
            {
              text: `Счет 2-1 П1 - ${value}`,
              callback_data: key,
            },
            {
              text: `Счет 2-1 П2 - ${game.odds[key.replace("p1", "p2")]}`,
              callback_data: key.replace("p1", "p2"),
            },
          ]);
        }
      }

      if (key.match(/TS2/)) {
        if (game.odds[key.replace("2", "3")]) {
          extra.inline_keyboard.push([
            {
              text: `Тотал сетов 2 - ${value}`,
              callback_data: key,
            },
            {
              text: `Тотал сетов 3 - ${game.odds[key.replace("2", "3")]}`,
              callback_data: key.replace("2", "3"),
            },
          ]);
        }
      }

      if (key.match(/MTGOE_odd/)) {
        if (game.odds[key.replace("odd", "even")]) {
          extra.inline_keyboard.push([
            {
              text: `Тотал геймов НЕЧЕТ - ${value}`,
              callback_data: key,
            },
            {
              text: `Тотал геймов ЧЕТ - ${
                game.odds[key.replace("odd", "even")]
              }`,
              callback_data: key.replace("odd", "even"),
            },
          ]);
        }
      }

      if (key === "S2W_p1") {
        if (game.odds.S2W_p2) {
          extra.inline_keyboard.push([
            {
              text: `П1 (сет 2) - ${value}`,
              callback_data: key,
            },
            {
              text: `П2 (сет 2) - ${game.odds.S2W_p2}`,
              callback_data: key.replace("p1", "p2"),
            },
          ]);
        }
      }

      if (key === "S3W_p1") {
        if (game.odds.S3W_p2) {
          extra.inline_keyboard.push([
            {
              text: `П1 (сет 3) - ${value}`,
              callback_data: key,
            },
            {
              text: `П2 (сет 3) - ${game.odds.S3W_p2}`,
              callback_data: key.replace("p1", "p2"),
            },
          ]);
        }
      }
    }
  }

  extra.inline_keyboard.push([
    {
      text: "🗑 Очистить ставки",
      callback_data: "🗑 Очистить ставки",
    },
    {
      text: "💰 Поставить",
      callback_data: "💰 Поставить",
    },
  ]);

  extra.inline_keyboard.push([
    {
      text: "Вернуться",
      callback_data: "Вернуться",
    },
  ]);

  return extra;
};
(async function tennisAction() {
  sportMenu.action(/tw/, async (ctx) => {
    const action = ctx.update.callback_query.data;
    await vld(ctx, action);
  });
  sportMenu.action(/tgs1/, async (ctx) => {
    const action = ctx.update.callback_query.data;
    await vld(ctx, action);
  });
  sportMenu.action(/tgs2/, async (ctx) => {
    const action = ctx.update.callback_query.data;
    await vld(ctx, action);
  });
  sportMenu.action(/tgs3/, async (ctx) => {
    const action = ctx.update.callback_query.data;
    await vld(ctx, action);
  });
  sportMenu.action(/tgm/, async (ctx) => {
    const action = ctx.update.callback_query.data;
    await vld(ctx, action);
  });
  sportMenu.action(/mtgoe/, async (ctx) => {
    const action = ctx.update.callback_query.data;
    await vld(ctx, action);
  });
  sportMenu.action(/sb/, async (ctx) => {
    const action = ctx.update.callback_query.data;
    await vld(ctx, action);
  });
  sportMenu.action(/TS/, async (ctx) => {
    const action = ctx.update.callback_query.data;
    await vld(ctx, action);
  });
  sportMenu.action(/S2W/, async (ctx) => {
    const action = ctx.update.callback_query.data;
    await vld(ctx, action);
  });
})();

async function gameIdView(ctx) {
  ctx.session.sport.activeView = "gameIdView";

  if (ctx.session.actionStatus) return;
  ctx.session.actionStatus = true;

  const game_id = ctx.update.callback_query.data.split(":")[1];
  ctx.session.sport.game_id = game_id;

  const { typeMatch, typeSport } = ctx.session.sport;

  const status = await ActiveGames.findOne({ game_id });
  if (!status) {
    const game = new ActiveGames({
      game_id,
      typeSport,
      typeMatch,
    });
    await game.save();
  }

  if (typeSport === "tennis") {
    const game = await TennisGames.findOne({ game_id });
    await reqTennis(typeMatch, game);
  }
  if (typeSport === "soccer") {
    const game = await FootballGames.findOne({ game_id });
    await reqFootball(typeMatch, game);
  }
  if (typeSport === "basketball") {
    const game = await BasketballGames.findOne({ game_id });
    await reqBasketball(typeMatch, game);
  }

  editMessage(ctx);
  const intervalId = setInterval(() => {
    editMessage(ctx);
  }, 5000);
  ctx.session.sport.interval = intervalId;
  ctx.session.actionStatus = false;
}

async function editMessage(ctx) {
  const { activeBoard, typeSport, game_id, interval, valueRate, rate } =
    ctx.session.sport;

  let game = null;
  let extra = null;

  if (typeSport === "soccer") {
    game = await FootballGames.findOne({ game_id });
    extra = soccerExtra(game, ctx);
  }

  if (typeSport === "tennis") {
    game = await TennisGames.findOne({ game_id });
    extra = tennisExtra(game, ctx);
  }

  if (typeSport === "basketball") {
    game = await BasketballGames.findOne({ game_id });
    extra = basketBallExtra(game, ctx);
  }

  if (!game || game.time_status === 3) {
    try {
      await ctx.answerCbQuery(
        "Данных об игре нету, либо она закончилась.",
        true
      );
    } catch (error) {}
    clearInterval(interval);
    return gameView(ctx);
  }

  ctx.session.sport.game = game;

  let rates = "";

  for (let [key, value] of Object.entries(rate)) {
    if (value && value !== 0 && game.odds[key]) {
      rates = rates.concat(
        `- ${parseNameOdds(typeSport, key)}  [x${
          game.odds[key]
        }]  💰 ${value} P\n`
      );
    } else {
      ctx.session.sport.mainBalance += value;
      ctx.session.sport.rate[key] = 0;
    }
  }

  try {
    await bot.telegram.editMessageText(
      ctx.from.id,
      activeBoard.message_id,
      null,
      `${game.home} - ${game.away}

Ваш баланс: ${ctx.session.sport.mainBalance} Р

Сумма ставки: ${valueRate} P
Ваши ставки:
${rates}
❕ Нажмите кнопку "💰 Поставить", чтобы ваши ставки были приняты.

Время обновления: ${moment().format("HH:mm:ss")}`,
      {
        reply_markup: extra,
      }
    );
  } catch (error) {}
}

function separate(arr) {
  let cols = 2;

  const rowsItems = [];
  for (let i = 0, j = arr.length; i < j; i += cols) {
    const row = arr.slice(i, i + cols);
    rowsItems.push(row);
  }

  return rowsItems;
}

module.exports = { sportMenu };
