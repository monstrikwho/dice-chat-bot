const isNumber = require("is-number");
const Scene = require("telegraf/scenes/base");

const { bot } = require("../init/startBot");
const { mainMenuActions } = require("./mainMenu.scene");

const User = require("../models/user");
const PvpModel = require("../models/pvpAllGames");
const MainStats = require("../models/mainstats");

const pvpAllGames = new Scene("pvpAllGames");
pvpAllGames.enter(async (ctx) => {
  ctx.session.state.boardCountPage = 1;
  await showMainView(ctx);
});

pvpAllGames.leave(async (ctx) => {
  const activeBoard = ctx.session.state.activeBoard;
  try {
    await ctx.deleteMessage(activeBoard.message_id);
  } catch (error) {}
});

mainMenuActions(pvpAllGames);

pvpAllGames.action(">", async (ctx) => {
  const { boardCountPage, boardMaxPages, actionStatus } = ctx.session.state;

  if (actionStatus) return;
  await setState(ctx);

  if (boardCountPage + 1 <= boardMaxPages) {
    ctx.session.state.boardCountPage = boardCountPage + 1;
  } else {
    await removeState(ctx);
    return await ctx.answerCbQuery("Это была последняя страница", true);
  }

  await showMainView(ctx);
  await removeState(ctx);
});

pvpAllGames.action("🔄 Обновить", async (ctx) => {
  const { actionStatus } = ctx.session.state;

  if (actionStatus) return;
  await setState(ctx);

  ctx.session.state.boardCountPage = 1;

  await showMainView(ctx);
  await removeState(ctx);
});

pvpAllGames.action("<", async (ctx) => {
  const { boardCountPage, actionStatus } = ctx.session.state;

  if (actionStatus) return;
  await setState(ctx);

  if (boardCountPage - 1 !== 0) {
    ctx.session.state.boardCountPage = boardCountPage - 1;
  } else {
    await removeState(ctx);
    return await ctx.answerCbQuery("Левее некуда..", true);
  }

  await showMainView(ctx);
  await removeState(ctx);
});

pvpAllGames.action(/(?:Создать)/, async (ctx) => {
  const { actionStatus } = ctx.session.state;

  if (actionStatus) return;
  await setState(ctx);

  const emoji = ctx.update.callback_query.data.split(" ")[1];
  ctx.session.state.typeGame = emoji;

  await showCreateLobbyStep1(ctx);
  await removeState(ctx);
});

pvpAllGames.action(/(?:2 игрока|3 игрока|5 игроков)/, async (ctx) => {
  const { actionStatus } = ctx.session.state;

  if (actionStatus) return;
  await setState(ctx);

  const createLobbyRoomSize = +ctx.update.callback_query.data.replace(
    /\W+/g,
    ""
  );
  ctx.session.state.createLobbyRoomSize = createLobbyRoomSize;

  await showCreateLobbyStep2(ctx);
  await removeState(ctx);
});

pvpAllGames.action(/(?:25₽|50₽|100₽|250₽|500₽)/, async (ctx) => {
  const value = +ctx.update.callback_query.data.match(/\d+/g)[0];

  ctx.session.state.createLobbyRate = value;
  await validateRate(ctx);
});

pvpAllGames.on("text", async (ctx) => {
  const msg = ctx.update.message.text;
  const { activeView, createLobbyStep } = ctx.session.state;

  if (activeView === "createlobby" && createLobbyStep === 2) {
    ctx.session.state.createLobbyRate = msg;
    await validateRate(ctx);
  }
});

pvpAllGames.action(/(?:lobby_id)/, async (ctx) => {
  const { actionStatus } = ctx.session.state;
  const btnData = ctx.update.callback_query.data;

  if (actionStatus) return;
  await setState(ctx);

  if (btnData.indexOf("lobby_id:") !== -1) {
    const lobbyId = btnData.replace("lobby_id:", "");
    ctx.session.state.lobbyId = lobbyId;
    await showSelectRivals(ctx);
  }

  await removeState(ctx);
});

pvpAllGames.action("Вступить в лобби", async (ctx) => {
  const { actionStatus } = ctx.session.state;

  if (actionStatus) return;
  await setState(ctx);

  await joinToLobby(ctx);

  await removeState(ctx);
});

pvpAllGames.action("Выйти из лобби", async (ctx) => {
  const { actionStatus } = ctx.session.state;

  if (actionStatus) return;
  await setState(ctx);

  await deleteLobby(ctx);

  await removeState(ctx);
});

pvpAllGames.action("Вернуться назад", async (ctx) => {
  const { activeView, createLobbyStep, actionStatus } = ctx.session.state;

  if (actionStatus) return;
  await setState(ctx);

  if (activeView === "createlobby" && createLobbyStep === 2) {
    await showCreateLobbyStep1(ctx);
  }

  if (activeView === "createlobby" && createLobbyStep === 1) {
    ctx.session.state.boardCountPage = 1;
    await showMainView(ctx);
  }

  if (activeView === "playwithrials") {
    ctx.session.state.boardCountPage = 1;
    await showMainView(ctx);
  }

  await removeState(ctx);
});

function mainExtra(boardGames, boardCountPage, uid) {
  if (boardGames.length === 0) {
    return {
      inline_keyboard: [
        [
          {
            text: "<",
            callback_data: "<",
          },
          {
            text: "🔄 Обновить",
            callback_data: "🔄 Обновить",
          },
          {
            text: ">",
            callback_data: ">",
          },
        ],
        [
          {
            text: "Создать 🎲",
            callback_data: "Создать 🎲",
          },
          {
            text: "Создать ⚽️",
            callback_data: "Создать ⚽️",
          },
          {
            text: "Создать 🎳",
            callback_data: "Создать 🎳",
          },
        ],
        [
          {
            text: "Создать 🏀",
            callback_data: "Создать 🏀",
          },
          {
            text: "Создать 🎯",
            callback_data: "Создать 🎯",
          },
        ],
      ],
    };
  }

  const flatSingle = (arr) => [].concat(...arr);

  const row = flatSingle(
    ...boardGames[boardCountPage - 1].map((cols) =>
      cols.map((game) => [
        {
          text: `${game.typeGame} Lobby #${game.lobbyId} ➖ ${
            game.prize
          } P  👤 [${game.rivals.length}/${game.size}] ${
            game.creator === uid ? "⏳" : ""
          }`,
          callback_data: `lobby_id:${game.lobbyId}`,
        },
      ])
    )
  );

  return {
    inline_keyboard: [
      row,
      [
        {
          text: "<",
          callback_data: "<",
        },
        {
          text: "🔄 Обновить",
          callback_data: "🔄 Обновить",
        },
        {
          text: ">",
          callback_data: ">",
        },
      ],
      [
        {
          text: "Создать 🎲",
          callback_data: "Создать 🎲",
        },
        {
          text: "Создать ⚽️",
          callback_data: "Создать ⚽️",
        },
        {
          text: "Создать 🎳",
          callback_data: "Создать 🎳",
        },
      ],
      [
        {
          text: "Создать 🏀",
          callback_data: "Создать 🏀",
        },
        {
          text: "Создать 🎯",
          callback_data: "Создать 🎯",
        },
      ],
    ],
  };
}

// Create Lobby First Step
function clfsExtra(typeGame) {
  if (typeGame === "🎲") {
    return {
      inline_keyboard: [
        [
          {
            text: "2 игрока",
            callback_data: "2 игрока",
          },
          {
            text: "3 игрока",
            callback_data: "3 игрока",
          },
          {
            text: "5 игроков",
            callback_data: "5 игроков",
          },
        ],
        [
          {
            text: "Вернуться назад",
            callback_data: "Вернуться назад",
          },
        ],
      ],
    };
  }
  if (typeGame === "⚽️") {
    return {
      inline_keyboard: [
        [
          {
            text: "2 игрока",
            callback_data: "2 игрока",
          },
        ],
        [
          {
            text: "Вернуться назад",
            callback_data: "Вернуться назад",
          },
        ],
      ],
    };
  }
  if (typeGame === "🎳") {
    return {
      inline_keyboard: [
        [
          {
            text: "2 игрока",
            callback_data: "2 игрока",
          },
        ],
        [
          {
            text: "Вернуться назад",
            callback_data: "Вернуться назад",
          },
        ],
      ],
    };
  }
  if (typeGame === "🏀") {
    return {
      inline_keyboard: [
        [
          {
            text: "2 игрока",
            callback_data: "2 игрока",
          },
        ],
        [
          {
            text: "Вернуться назад",
            callback_data: "Вернуться назад",
          },
        ],
      ],
    };
  }
  if (typeGame === "🎯") {
    return {
      inline_keyboard: [
        [
          {
            text: "2 игрока",
            callback_data: "2 игрока",
          },
        ],
        [
          {
            text: "Вернуться назад",
            callback_data: "Вернуться назад",
          },
        ],
      ],
    };
  }
}

// Create Lobby Second Step
function clssExtra() {
  return {
    inline_keyboard: [
      [
        {
          text: "25₽",
          callback_data: "25₽",
        },
        {
          text: "50₽",
          callback_data: "50₽",
        },
        {
          text: "100₽",
          callback_data: "100₽",
        },
        {
          text: "250₽",
          callback_data: "250₽",
        },
        {
          text: "500₽",
          callback_data: "500₽",
        },
      ],
      [
        {
          text: "Вернуться назад",
          callback_data: "Вернуться назад",
        },
      ],
    ],
  };
}

async function showMainView(ctx) {
  const { activeBoard, boardCountPage } = ctx.session.state;
  ctx.session.state.activeView = "main";

  const user = await User.findOne({ userId: ctx.from.id });
  const games = await PvpModel.find({ statusGame: "waiting" });
  const top10 = await User.find({ "pvp.count": { $gte: 1 } })
    .sort({ "pvp.winCash": -1 })
    .limit(10);
  const latestGames = await PvpModel.find({
    rivals: ctx.from.id,
    statusGame: "completed",
  })
    .sort({ _id: -1 })
    .limit(10);
  const { pvpPercent } = await MainStats.findOne();

  try {
    await ctx.deleteMessage(activeBoard.message_id);
  } catch (error) {}

  games.sort((a, b) => b.prize * b.rivals.length - a.prize * a.rivals.length);

  const boardGames = separate(games);
  const boardMaxPages = boardGames.length;

  const extra = mainExtra(boardGames, boardCountPage, ctx.from.id);
  const message = `PVP GAMES

Ваш рейтинг: №${user.pvp.rating}
Ваш баланс: ${user.mainBalance} P
Ваш общий выигрыш: ${user.pvp.winCash} P
Кол-во побед: ${user.pvp.winCount}/${user.pvp.count} [${
    user.pvp.count ? ((user.pvp.winCount / user.pvp.count) * 100).toFixed(0) : 0
  }%]

ТОП-10 игроков:
${top10
  .map(
    (item, i) =>
      `${i + 1}. ${
        item.userName
          ? "@" + item.userName
          : `<a href="tg://user?id=${item.userId}">@${item.userId}</a>`
      }`
  )
  .join("\n")}

Ваши последние лобби:
${
  latestGames.length !== 0
    ? latestGames
        .map((item) => {
          const status = item.winner === ctx.from.id ? "🟢" : "🔴";
          const typeGame = item.typeGame;
          const res = item.reversedResults[ctx.from.id].join(" - ");

          return `${typeGame} ➖ ${status} 👤 ${item.rivals.length} 💰 ${(
            item.prize *
            item.rivals.length *
            (1 - pvpPercent / 100)
          ).toFixed(2)} P   📝 ${res}`;
        })
        .join("\n")
    : "- у вас нету сыгранных игр"
}

Страница: ${boardGames.length === 0 ? 0 : boardCountPage}/${boardMaxPages}`;

  if (process.env.DEV !== "true") {
    try {
      ctx.session.state.activeBoard = await bot.telegram.sendPhoto(
        ctx.from.id,
        "AgACAgIAAxkBAAELz71hDPEBIJb6BTXwrjuedla1dnMEDgACyLUxG9FSaEj-twyihsA0_wEAAwIAA3MAAyAE",
        {
          caption: message,
          reply_markup: extra,
          parse_mode: "HTML",
        }
      );
    } catch (error) {}
  } else {
    try {
      ctx.session.state.activeBoard = await bot.telegram.sendPhoto(
        ctx.from.id,
        "AgACAgIAAxkBAAJG82ELh0OKxZcqOBcPuKViCYfQcEtqAAJntjEbwjVZSDynD3HIHdqBAQADAgADcwADIAQ",
        {
          caption: message,
          reply_markup: extra,
          parse_mode: "HTML",
        }
      );
    } catch (error) {
      console.log(error.message);
    }
  }

  ctx.session.state = {
    ...ctx.session.state,
    boardGames,
    boardCountPage,
    boardMaxPages,
  };
}

async function showCreateLobbyStep1(ctx) {
  const { activeBoard, typeGame } = ctx.session.state;
  ctx.session.state.activeView = "createlobby";
  ctx.session.state.createLobbyStep = 1;

  const extra = clfsExtra(typeGame);

  try {
    await bot.telegram.editMessageCaption(
      ctx.from.id,
      activeBoard.message_id,
      null,
      `Step 1/2 - Выберите количество игроков`,
      extra
    );
  } catch (error) {}
}

async function showCreateLobbyStep2(ctx) {
  const { activeBoard } = ctx.session.state;
  ctx.session.state.createLobbyStep = 2;

  const user = await User.findOne({ userId: ctx.from.id });

  const extra = clssExtra();

  try {
    await bot.telegram.editMessageCaption(
      ctx.from.id,
      activeBoard.message_id,
      null,
      `Step 2/2 - Выберите или напишите в чат ставку
Ваш баланс: ${user.mainBalance} ₽`,
      extra
    );
  } catch (error) {}
}

async function validateRate(ctx) {
  const { createLobbyRate } = ctx.session.state;

  if (!isNumber(createLobbyRate)) {
    try {
      await ctx.reply("Пожалуйста, введите только положительные цифры.");
    } catch (error) {}
    return;
  }

  const { minGameRate } = await MainStats.findOne();

  if (createLobbyRate < minGameRate) {
    try {
      await ctx.reply(`Минимальная сумма ставки составляет ${minGameRate} ₽`);
    } catch (error) {}
    return;
  }

  const user = await User.findOne({ userId: ctx.from.id });

  if (user.mainBalance - createLobbyRate < 0) {
    try {
      await ctx.reply(
        `У вас недостаточно баланса, чтобы создать лобби c ставкой ${createLobbyRate}₽
Ваш баланс: ${user.mainBalance}₽`
      );
    } catch (error) {}
    return;
  }

  ctx.session.state.createLobbyStep = 3;
  await createLobby(ctx);
}

async function createLobby(ctx) {
  const { typeGame, createLobbyRate, createLobbyRoomSize } = ctx.session.state;

  const user = await User.findOne({ userId: ctx.from.id });
  await User.updateOne(
    { userId: ctx.from.id },
    { mainBalance: +(user.mainBalance - createLobbyRate).toFixed(2) }
  );

  const { pvpGames } = await MainStats.findOne();
  await MainStats.updateOne({}, { $inc: { "pvpGames.prevLobbyId": 1 } });

  const game = new PvpModel({
    lobbyId: pvpGames.prevLobbyId + 1,
    typeGame,
    statusGame: "waiting",
    prize: createLobbyRate,
    size: createLobbyRoomSize,
    rivals: [ctx.from.id],
    rivalsLinks: {
      [ctx.from.id]: ctx.from.username
        ? `@${ctx.from.username}`
        : `<a href="tg://user?id=${ctx.from.id}">@${ctx.from.id}</a>`,
    },
    creator: ctx.from.id,
  });
  await game.save();

  try {
    await ctx.reply(`Лобби успешно созданно!
С вашего баланса было удеражна сумма: ${createLobbyRate} Р
Ваш баланс: ${(user.mainBalance - createLobbyRate).toFixed(2)} Р`);
  } catch (error) {}

  ctx.session.state.createLobbyStep = 0;

  await showMainView(ctx);
}

async function showSelectRivals(ctx) {
  const { lobbyId, activeBoard } = ctx.session.state;
  ctx.session.state.activeView = "playwithrials";

  const lobby = await PvpModel.findOne({ lobbyId });

  const { pvpPercent } = await MainStats.findOne();
  const lobbyPrize = lobby.prize * lobby.size * (1 - pvpPercent / 100);

  const isConsist = lobby.rivals.indexOf(ctx.from.id) !== -1 ? true : false;

  try {
    await bot.telegram.editMessageCaption(
      ctx.from.id,
      activeBoard.message_id,
      null,
      `${lobby.typeGame} Lobby #${lobbyId}
Призовой фонд: ${lobbyPrize} ₽
${isConsist ? "\n📋 Вы состоите в данном лобби!\n" : ""}
Соперники:
${[...lobby.rivals, ...new Array(lobby.size - lobby.rivals.length)]
  .map((item, i) => {
    if (!item) return `${i + 1}. Ожидание..`;
    return `${i + 1}. ${lobby.rivalsLinks[item]}`;
  })
  .join("\n")}`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: !isConsist ? "Вступить в лобби" : "Выйти из лобби",
                callback_data: !isConsist
                  ? "Вступить в лобби"
                  : "Выйти из лобби",
              },
              {
                text: "Вернуться назад",
                callback_data: "Вернуться назад",
              },
            ],
          ],
        },
      }
    );
  } catch (error) {}
}

async function deleteLobby(ctx) {
  const { lobbyId } = ctx.session.state;

  const lobby = await PvpModel.findOne({ lobbyId });

  if (!lobby || lobby.rivals.indexOf(ctx.from.id) === -1) return;

  const user = await User.findOne({ userId: ctx.from.id });
  const userIndex = lobby.rivals.indexOf(ctx.from.id);

  lobby.rivals.splice(userIndex, 1);

  if (lobby.rivals.length !== 0) {
    await PvpModel.updateOne({ lobbyId }, { rivals: lobby.rivals });
  } else {
    await PvpModel.updateOne({ lobbyId }, { statusGame: "deleted" });
  }

  await User.updateOne(
    { userId: ctx.from.id },
    { mainBalance: +(user.mainBalance + lobby.prize).toFixed(2) }
  );

  try {
    await ctx.reply(`Вы успешно вышли из лобби.
На ваш балан была начислена сумма вашей ставки: ${lobby.prize} Р
Ваш баланс: ${(user.mainBalance + lobby.prize).toFixed(2)} Р`);
  } catch (error) {}

  await showMainView(ctx);
}

async function joinToLobby(ctx) {
  const { lobbyId } = ctx.session.state;

  const lobby = await PvpModel.findOne({ lobbyId });

  if (lobby.rivals.indexOf(ctx.from.id) > 0) return;

  lobby.rivals.push(ctx.from.id);
  lobby.rivalsLinks[ctx.from.id] = ctx.from.username
    ? `@${ctx.from.username}`
    : `<a href="tg://user?id=${ctx.from.id}">@${ctx.from.id}</a>`;

  await PvpModel.updateOne(
    { lobbyId },
    {
      rivals: lobby.rivals,
      rivalsLinks: lobby.rivalsLinks,
    }
  );

  const user = await User.findOne({ userId: ctx.from.id });
  await User.updateOne(
    { userId: ctx.from.id },
    { mainBalance: +(user.mainBalance - lobby.prize).toFixed(2) }
  );

  try {
    await ctx.reply(`Вы успешно вступили в лобби #${lobbyId}
С вашего баланса была списана сумма ставки: ${lobby.prize} P
Ваш баланс: ${(user.mainBalance - lobby.prize).toFixed(2)} P`);
  } catch (error) {}

  await showMainView(ctx);

  // Если вступил последний игрок - ЗАПУСКАЕМ ИГРУ
  checkLastPlayer(lobby, ctx);
}

async function checkLastPlayer(lobby, ctx) {
  if (lobby.rivals.length !== lobby.size) {
    return await showMainView(ctx);
  }

  // Обновляем статус игры на "pending"
  await PvpModel.updateOne(
    { lobbyId: lobby.lobbyId },
    {
      statusGame: "pending",
    }
  );

  saveGameMainStats(lobby);

  for (let i = 0; i < lobby.rivals.length; i++) {
    try {
      bot.telegram.sendMessage(
        lobby.rivals[i],
        `Лобби #${lobby.lobbyId} было собрано`,
        {
          disable_notification: true,
        }
      );
    } catch (error) {}
  }

  // Записываем ключи объекта
  lobby.results[0] = {};
  lobby.resultsSum[0] = {};

  for (let i = 0; i < lobby.rivals.length; i++) {
    const userId = lobby.rivals[i];
    lobby.results[0][userId] = [];
    lobby.resultsSum[0][userId] = 0;
  }

  ctx.session.state.lobby = lobby;

  await sendStickers(ctx);

  // Сформируем массив с результатами игроков
  // Выбираем по убыванию
  const _lobby = ctx.session.state.lobby;
  const players = _lobby.rivals
    .map((item) => ({
      userId: item,
      resultsSum: _lobby.resultsSum[0][item],
    }))
    .sort((a, b) => b.resultsSum - a.resultsSum);

  let { resLobby, winner } = await playing2round(_lobby, players, 2, ctx);

  const reversedResults = {};
  for (let i = 0; i < resLobby.resultsSum.length; i++) {
    for (const [key, value] of Object.entries(resLobby.resultsSum[i])) {
      if (reversedResults[key]) {
        reversedResults[key] = [...reversedResults[key], value];
      } else {
        reversedResults[key] = [value];
      }
    }
  }

  const { pvpPercent } = await MainStats.findOne();
  const lobbyPrize = _lobby.prize * _lobby.size * (1 - pvpPercent / 100);

  // Отправляем игрокам общий результат
  _lobby.rivals.map((userId) =>
    bot.telegram.sendMessage(
      userId,
      `Результат лобби #${_lobby.lobbyId}

${
  userId === winner
    ? `Вы выиграли!
Ваш выигрыш: ${lobbyPrize.toFixed(2)} P`
    : `Выиграл ${winner === 0 ? "drow" : `${_lobby.rivalsLinks[winner]}`}
Выигрыш составил: ${lobbyPrize.toFixed(2)} P`
}
   
${_lobby.rivals
  .map(
    (item, i) =>
      `${i + 1}. 👤 ${_lobby.rivalsLinks[item]} ➖ ${
        _lobby.typeGame
      } ${reversedResults[item].join(` ${_lobby.typeGame} `)}`
  )
  .join("\n")}`,
      {
        parse_mode: "HTML",
      }
    )
  );

  // Обновляем статус игры на "completed"
  await PvpModel.updateOne(
    { lobbyId: _lobby.lobbyId },
    {
      winner,
      statusGame: "completed",
      results: resLobby.results,
      resultsSum: resLobby.resultsSum,
      reversedResults,
    }
  );

  // Начисляем выигрыш победителю
  const { mainBalance, pvp } = await User.findOne({ userId: winner });
  await User.updateOne(
    { userId: winner },
    {
      mainBalance: +(mainBalance + lobbyPrize).toFixed(2),
      pvp: {
        ...pvp,
        winCount: pvp.winCount + 1,
        winCash: +(pvp.winCash + lobbyPrize).toFixed(2),
      },
    }
  );

  // Обновляем статистику игроков
  for (let i = 0; i < _lobby.rivals.length; i++) {
    const { pvp } = await User.findOne({ userId: _lobby.rivals[i] });
    await User.updateOne(
      { userId: _lobby.rivals[i] },
      {
        pvp: {
          ...pvp,
          count: pvp.count + 1,
          playCash: +(pvp.playCash + _lobby.prize).toFixed(2),
        },
      }
    );
  }

  await showMainView(ctx);
}

async function saveGameMainStats(lobby) {
  let type = null;
  const { pvpGames } = await MainStats.findOne();

  if (lobby.typeGame === "🎲") {
    type = "dice";
  }
  if (lobby.typeGame === "⚽️") {
    type = "football";
  }
  if (lobby.typeGame === "🎳") {
    type = "bouling";
  }
  if (lobby.typeGame === "🏀") {
    type = "basketball";
  }
  if (lobby.typeGame === "🎯") {
    type = "darts";
  }

  await MainStats.updateOne(
    {},
    {
      $inc: { "pvpGames.dice.countLobby": 1 },
      [`pvpGames.${type}.countCash`]: +(
        pvpGames[type].countCash +
        lobby.prize * lobby.rivals.length
      ).toFixed(2),
    }
  );
}

async function sendStickers(ctx, round, rivals) {
  const type = ctx.session.state.lobby.typeGame;

  // *************** DICE ***************
  if (type === "🎲" && !round) {
    const lobby = ctx.session.state.lobby;
    for (let userId of lobby.rivals) {
      const resMsgArr = [];
      // Отправляем каждому игроку сообщение о том, кто делает бросок
      for (let uid of lobby.rivals) {
        if (uid !== userId) {
          try {
            const resMsg = await bot.telegram.sendMessage(
              uid,
              `Сейчас бросоки делает игрок: ${lobby.rivalsLinks[userId]}`,
              { parse_mode: "HTML", disable_notification: true }
            );
            resMsgArr.push(resMsg);
          } catch (error) {}
        } else {
          try {
            const resMsg = await bot.telegram.sendMessage(
              uid,
              `Сейчас ваш бросок`,
              {
                disable_notification: true,
              }
            );
            resMsgArr.push(resMsg);
          } catch (error) {}
        }
      }

      let dice1 = null;
      let dice2 = null;
      let dice3 = null;
      try {
        dice1 = await bot.telegram.sendDice(userId, {
          emoji: "🎲",
          disable_notification: true,
        });
        dice2 = await bot.telegram.sendDice(userId, {
          emoji: "🎲",
          disable_notification: true,
        });
        dice3 = await bot.telegram.sendDice(userId, {
          emoji: "🎲",
          disable_notification: true,
        });
      } catch (error) {}

      const value1 = dice1.dice.value;
      const value2 = dice2.dice.value;
      const value3 = dice3.dice.value;

      const results = [value1, value2, value3];
      const resultsSum = value1 + value2 + value3;

      lobby.results[0] = { ...lobby.results[0], [userId]: results };
      lobby.resultsSum[0] = { ...lobby.resultsSum[0], [userId]: resultsSum };
      ctx.session.state.lobby = lobby;

      // Пересылаем остальным игрокам результат броска
      lobby.rivals.map((replyTo) => {
        if (replyTo === userId) return;
        try {
          bot.telegram.forwardMessage(replyTo, userId, dice1.message_id, {
            disable_notification: true,
          });
        } catch (error) {}
        try {
          bot.telegram.forwardMessage(replyTo, userId, dice2.message_id, {
            disable_notification: true,
          });
        } catch (error) {}
        try {
          bot.telegram.forwardMessage(replyTo, userId, dice3.message_id, {
            disable_notification: true,
          });
        } catch (error) {}
      });

      // Ожидаем окончание анимации
      await timeout(4000);

      for (let i = 0; i < resMsgArr.length; i++) {
        const userId = resMsgArr[i].chat.id;
        const msg = `${resMsgArr[i].text}\nОбщее кол-во очков: 🎲 ${resultsSum}`;
        bot.telegram.editMessageText(
          userId,
          resMsgArr[i].message_id,
          null,
          msg,
          {
            parse_mode: "HTML",
            disable_notification: true,
          }
        );
      }
    }
  }

  if (type === "🎲" && round) {
    const lobby = ctx.session.state.lobby;
    for (let { userId } of rivals) {
      const resMsgArr = [];
      // Отправляем каждому игроку сообщение о том, кто делает бросок
      for (let uid of lobby.rivals) {
        if (uid !== userId) {
          try {
            const resMsg = await bot.telegram.sendMessage(
              uid,
              `Сейчас бросоки делает игрок: ${lobby.rivalsLinks[userId]}`,
              { parse_mode: "HTML", disable_notification: true }
            );
            resMsgArr.push(resMsg);
          } catch (error) {}
        } else {
          try {
            const resMsg = await bot.telegram.sendMessage(
              uid,
              `Сейчас ваш бросок`,
              {
                disable_notification: true,
              }
            );
            resMsgArr.push(resMsg);
          } catch (error) {}
        }
      }

      let dice1 = null;
      let dice2 = null;
      let dice3 = null;
      try {
        dice1 = await bot.telegram.sendDice(userId, {
          emoji: "🎲",
          disable_notification: true,
        });
        dice2 = await bot.telegram.sendDice(userId, {
          emoji: "🎲",
          disable_notification: true,
        });
        dice3 = await bot.telegram.sendDice(userId, {
          emoji: "🎲",
          disable_notification: true,
        });
      } catch (error) {}

      const value1 = dice1.dice.value;
      const value2 = dice2.dice.value;
      const value3 = dice3.dice.value;

      const results = [value1, value2, value3];
      const resultsSum = value1 + value2 + value3;

      lobby.results[round - 1] = {
        ...lobby.results[round - 1],
        [userId]: results,
      };
      lobby.resultsSum[round - 1] = {
        ...lobby.resultsSum[round - 1],
        [userId]: resultsSum,
      };
      ctx.session.state.lobby = lobby;

      // Пересылаем остальным игрокам результат броска
      lobby.rivals.map((replyTo) => {
        if (replyTo === userId) return;
        try {
          bot.telegram.forwardMessage(replyTo, userId, dice1.message_id, {
            disable_notification: true,
          });
          bot.telegram.forwardMessage(replyTo, userId, dice2.message_id, {
            disable_notification: true,
          });
          bot.telegram.forwardMessage(replyTo, userId, dice3.message_id, {
            disable_notification: true,
          });
        } catch (error) {}
      });

      // Ожидаем окончание анимации
      await timeout(4000);

      for (let i = 0; i < resMsgArr.length; i++) {
        const userId = resMsgArr[i].chat.id;
        const msg = `${resMsgArr[i].text}\nОбщее кол-во очков: 🎲 ${resultsSum}`;
        bot.telegram.editMessageText(
          userId,
          resMsgArr[i].message_id,
          null,
          msg,
          {
            parse_mode: "HTML",
            disable_notification: true,
          }
        );
      }
    }
  }

  // *************** FOOTBALL ***************

  if (type === "⚽️" && !round) {
    for (let i = 0; i < 6; i++) {
      const lobby = ctx.session.state.lobby;
      for (let userId of lobby.rivals) {
        const resMsgArr = [];
        // Отправляем каждому игроку сообщение о том, кто бьет мяч
        for (let uid of lobby.rivals) {
          if (uid !== userId) {
            try {
              const resMsg = await bot.telegram.sendMessage(
                uid,
                `Сейчас по воротам бьет игрок: ${lobby.rivalsLinks[userId]}`,
                { parse_mode: "HTML", disable_notification: true }
              );
              resMsgArr.push(resMsg);
            } catch (error) {}
          } else {
            try {
              const resMsg = await bot.telegram.sendMessage(
                uid,
                `Сейчас ваш удар по воротам`,
                {
                  disable_notification: true,
                }
              );
              resMsgArr.push(resMsg);
            } catch (error) {}
          }
        }

        let diceMsg = null;
        try {
          diceMsg = await bot.telegram.sendDice(userId, {
            emoji: "⚽️",
            disable_notification: true,
          });
        } catch (error) {}

        // Берем предыдущие результаты
        let results = [...lobby.results[0][userId], diceMsg.dice.value];
        let resultsSum = lobby.resultsSum[0][userId];

        // Если забиваем гол, добавляем игроку очко
        if (diceMsg.dice.value >= 3) resultsSum++;

        // Записываем результат игры
        lobby.results[0] = { ...lobby.results[0], [userId]: results };
        lobby.resultsSum[0] = { ...lobby.resultsSum[0], [userId]: resultsSum };
        ctx.session.state.lobby = lobby;

        // Пересылаем остальным игрокам результат броска
        lobby.rivals.map((replyTo) => {
          if (replyTo === userId) return;
          try {
            bot.telegram.forwardMessage(replyTo, userId, diceMsg.message_id, {
              disable_notification: true,
            });
          } catch (error) {}
        });

        // Ожидаем окончание анимации
        await timeout(4000);

        for (let i = 0; i < resMsgArr.length; i++) {
          const userId = resMsgArr[i].chat.id;
          const msg = `${resMsgArr[i].text}\nОбщее кол-во голов: ⚽️ ${resultsSum}`;
          bot.telegram.editMessageText(
            userId,
            resMsgArr[i].message_id,
            null,
            msg,
            {
              parse_mode: "HTML",
              disable_notification: true,
            }
          );
        }
      }
    }
  }

  if (type === "⚽️" && round) {
    for (let i = 0; i < 1; i++) {
      const lobby = ctx.session.state.lobby;
      for (let { userId } of rivals) {
        const resMsgArr = [];
        // Отправляем каждому игроку сообщение о том, кто бьет мяч
        for (let uid of lobby.rivals) {
          if (uid !== userId) {
            try {
              const resMsg = await bot.telegram.sendMessage(
                uid,
                `Сейчас по воротам бьет игрок: ${lobby.rivalsLinks[userId]}`,
                { parse_mode: "HTML", disable_notification: true }
              );
              resMsgArr.push(resMsg);
            } catch (error) {}
          } else {
            try {
              const resMsg = await bot.telegram.sendMessage(
                uid,
                `Сейчас ваш удар по воротам`,
                {
                  disable_notification: true,
                }
              );
              resMsgArr.push(resMsg);
            } catch (error) {}
          }
        }

        let diceMsg = null;
        try {
          diceMsg = await bot.telegram.sendDice(userId, {
            emoji: "⚽️",
            disable_notification: true,
          });
        } catch (error) {}

        // Берем предыдущие результаты
        let results = [...lobby.results[round - 1][userId], diceMsg.dice.value];
        let resultsSum = lobby.resultsSum[round - 1][userId];

        // Если забиваем гол, добавляем игроку очко
        if (diceMsg.dice.value >= 3) resultsSum++;

        // Записываем результат игры
        lobby.results[round - 1] = {
          ...lobby.results[round - 1],
          [userId]: results,
        };
        lobby.resultsSum[round - 1] = {
          ...lobby.resultsSum[round - 1],
          [userId]: resultsSum,
        };
        ctx.session.state.lobby = lobby;

        // Пересылаем остальным игрокам результат броска
        lobby.rivals.map((replyTo) => {
          if (replyTo === userId) return;
          try {
            bot.telegram.forwardMessage(replyTo, userId, diceMsg.message_id, {
              disable_notification: true,
            });
          } catch (error) {}
        });

        // Ожидаем окончание анимации
        await timeout(4000);

        for (let i = 0; i < resMsgArr.length; i++) {
          const userId = resMsgArr[i].chat.id;
          const msg = `${resMsgArr[i].text}\nОбщее кол-во голов: ⚽️ ${resultsSum}`;
          bot.telegram.editMessageText(
            userId,
            resMsgArr[i].message_id,
            null,
            msg,
            {
              parse_mode: "HTML",
              disable_notification: true,
            }
          );
        }
      }
    }
  }

  // *************** BOULING ***************

  if (type === "🎳" && !round) {
    const lobby = ctx.session.state.lobby;
    for (let userId of lobby.rivals) {
      const resMsgArr = [];
      // Отправляем каждому игроку сообщение о том, кто делает бросок
      for (let uid of lobby.rivals) {
        try {
          if (uid !== userId) {
            const resMsg = await bot.telegram.sendMessage(
              uid,
              `Сейчас броски делает игрок: ${lobby.rivalsLinks[userId]}`,
              { parse_mode: "HTML", disable_notification: true }
            );
            resMsgArr.push(resMsg);
          } else {
            const resMsg = await bot.telegram.sendMessage(
              uid,
              `Сейчас ваши броски`,
              {
                disable_notification: true,
              }
            );
            resMsgArr.push(resMsg);
          }
        } catch (error) {}
      }

      let dice1 = null;
      let dice2 = null;
      let dice3 = null;
      try {
        dice1 = await bot.telegram.sendDice(userId, {
          emoji: "🎳",
          disable_notification: true,
        });
        dice2 = await bot.telegram.sendDice(userId, {
          emoji: "🎳",
          disable_notification: true,
        });
        dice3 = await bot.telegram.sendDice(userId, {
          emoji: "🎳",
          disable_notification: true,
        });
      } catch (error) {}

      const value1 = dice1.dice.value === 2 ? 1 : dice1.dice.value;
      const value2 = dice2.dice.value === 2 ? 1 : dice2.dice.value;
      const value3 = dice3.dice.value === 2 ? 1 : dice3.dice.value;

      const results = [value1, value2, value3];
      const resultsSum = value1 + value2 + value3;

      lobby.results[0] = { ...lobby.results[0], [userId]: results };
      lobby.resultsSum[0] = { ...lobby.resultsSum[0], [userId]: resultsSum };
      ctx.session.state.lobby = lobby;

      // Пересылаем остальным игрокам результат броска
      lobby.rivals.map((replyTo) => {
        if (replyTo === userId) return;
        try {
          bot.telegram.forwardMessage(replyTo, userId, dice1.message_id, {
            disable_notification: true,
          });
          bot.telegram.forwardMessage(replyTo, userId, dice2.message_id, {
            disable_notification: true,
          });
          bot.telegram.forwardMessage(replyTo, userId, dice3.message_id, {
            disable_notification: true,
          });
        } catch (error) {}
      });

      // Ожидаем окончание анимации
      await timeout(3500);

      for (let i = 0; i < resMsgArr.length; i++) {
        const userId = resMsgArr[i].chat.id;
        const msg = `${resMsgArr[i].text}\nОбщее кол-во очков: 🎳 ${resultsSum}`;
        bot.telegram.editMessageText(
          userId,
          resMsgArr[i].message_id,
          null,
          msg,
          {
            parse_mode: "HTML",
            disable_notification: true,
          }
        );
      }
    }
  }

  if (type === "🎳" && round) {
    const lobby = ctx.session.state.lobby;
    for (let { userId } of rivals) {
      const resMsgArr = [];
      // Отправляем каждому игроку сообщение о том, кто делает бросок
      for (let uid of lobby.rivals) {
        try {
          if (uid !== userId) {
            const resMsg = await bot.telegram.sendMessage(
              uid,
              `Сейчас броски делает игрок: ${lobby.rivalsLinks[userId]}`,
              { parse_mode: "HTML", disable_notification: true }
            );
            resMsgArr.push(resMsg);
          } else {
            const resMsg = await bot.telegram.sendMessage(
              uid,
              `Сейчас ваши броски`,
              {
                disable_notification: true,
              }
            );
            resMsgArr.push(resMsg);
          }
        } catch (error) {}
      }

      let dice1 = null;
      let dice2 = null;
      let dice3 = null;
      try {
        dice1 = await bot.telegram.sendDice(userId, {
          emoji: "🎳",
          disable_notification: true,
        });
        dice2 = await bot.telegram.sendDice(userId, {
          emoji: "🎳",
          disable_notification: true,
        });
        dice3 = await bot.telegram.sendDice(userId, {
          emoji: "🎳",
          disable_notification: true,
        });
      } catch (error) {}

      const value1 = dice1.dice.value === 2 ? 1 : dice1.dice.value;
      const value2 = dice2.dice.value === 2 ? 1 : dice2.dice.value;
      const value3 = dice3.dice.value === 2 ? 1 : dice3.dice.value;

      const results = [value1, value2, value3];
      const resultsSum = value1 + value2 + value3;

      lobby.results[round - 1] = {
        ...lobby.results[round - 1],
        [userId]: results,
      };
      lobby.resultsSum[round - 1] = {
        ...lobby.resultsSum[round - 1],
        [userId]: resultsSum,
      };
      ctx.session.state.lobby = lobby;

      // Пересылаем остальным игрокам результат броска
      lobby.rivals.map((replyTo) => {
        if (replyTo === userId) return;
        try {
          bot.telegram.forwardMessage(replyTo, userId, dice1.message_id, {
            disable_notification: true,
          });
          bot.telegram.forwardMessage(replyTo, userId, dice2.message_id, {
            disable_notification: true,
          });
          bot.telegram.forwardMessage(replyTo, userId, dice3.message_id, {
            disable_notification: true,
          });
        } catch (error) {}
      });

      // Ожидаем окончание анимации
      await timeout(3500);

      for (let i = 0; i < resMsgArr.length; i++) {
        const userId = resMsgArr[i].chat.id;
        const msg = `${resMsgArr[i].text}\nОбщее кол-во очков: 🎳 ${resultsSum}`;
        bot.telegram.editMessageText(
          userId,
          resMsgArr[i].message_id,
          null,
          msg,
          {
            parse_mode: "HTML",
            disable_notification: true,
          }
        );
      }
    }
  }

  // *************** BASKETBALL ***************

  if (type === "🏀" && !round) {
    for (let i = 0; i < 4; i++) {
      const lobby = ctx.session.state.lobby;
      for (let userId of lobby.rivals) {
        const resMsgArr = [];
        // Отправляем каждому игроку сообщение о том, кто бьет мяч
        for (let uid of lobby.rivals) {
          if (uid !== userId) {
            try {
              const resMsg = await bot.telegram.sendMessage(
                uid,
                `Сейчас бросок делает игрок: ${lobby.rivalsLinks[userId]}`,
                { parse_mode: "HTML", disable_notification: true }
              );
              resMsgArr.push(resMsg);
            } catch (error) {}
          } else {
            try {
              const resMsg = await bot.telegram.sendMessage(
                uid,
                `Сейчас ваш бросок`,
                {
                  disable_notification: true,
                }
              );
              resMsgArr.push(resMsg);
            } catch (error) {}
          }
        }

        let diceMsg = null;
        try {
          diceMsg = await bot.telegram.sendDice(userId, {
            emoji: "🏀",
            disable_notification: true,
          });
        } catch (error) {}

        // Берем предыдущие результаты
        let results = [...lobby.results[0][userId], diceMsg.dice.value];
        let resultsSum = lobby.resultsSum[0][userId];

        // Если забиваем гол, добавляем игроку очко
        if (diceMsg.dice.value >= 4) resultsSum++;

        // Записываем результат игры
        lobby.results[0] = { ...lobby.results[0], [userId]: results };
        lobby.resultsSum[0] = { ...lobby.resultsSum[0], [userId]: resultsSum };
        ctx.session.state.lobby = lobby;

        // Пересылаем остальным игрокам результат броска
        lobby.rivals.map((replyTo) => {
          if (replyTo === userId) return;
          try {
            bot.telegram.forwardMessage(replyTo, userId, diceMsg.message_id, {
              disable_notification: true,
            });
          } catch (error) {}
        });

        // Ожидаем окончание анимации
        await timeout(3500);

        for (let i = 0; i < resMsgArr.length; i++) {
          const userId = resMsgArr[i].chat.id;
          const msg = `${resMsgArr[i].text}\nОбщее кол-во очков: 🏀 ${resultsSum}`;
          bot.telegram.editMessageText(
            userId,
            resMsgArr[i].message_id,
            null,
            msg,
            {
              parse_mode: "HTML",
              disable_notification: true,
            }
          );
        }
      }
    }
  }

  if (type === "🏀" && round) {
    for (let i = 0; i < 1; i++) {
      const lobby = ctx.session.state.lobby;
      for (let { userId } of rivals) {
        const resMsgArr = [];
        // Отправляем каждому игроку сообщение о том, кто бьет мяч
        for (let uid of lobby.rivals) {
          if (uid !== userId) {
            try {
              const resMsg = await bot.telegram.sendMessage(
                uid,
                `Сейчас бросок делает игрок: ${lobby.rivalsLinks[userId]}`,
                { parse_mode: "HTML", disable_notification: true }
              );
              resMsgArr.push(resMsg);
            } catch (error) {}
          } else {
            try {
              const resMsg = await bot.telegram.sendMessage(
                uid,
                `Сейчас ваш бросок`,
                {
                  disable_notification: true,
                }
              );
              resMsgArr.push(resMsg);
            } catch (error) {}
          }
        }

        let diceMsg = null;
        try {
          diceMsg = await bot.telegram.sendDice(userId, {
            emoji: "🏀",
            disable_notification: true,
          });
        } catch (error) {}

        // Берем предыдущие результаты
        let results = [...lobby.results[round - 1][userId], diceMsg.dice.value];
        let resultsSum = lobby.resultsSum[round - 1][userId];

        // Если забиваем гол, добавляем игроку очко
        if (diceMsg.dice.value >= 4) resultsSum++;

        // Записываем результат игры
        lobby.results[round - 1] = {
          ...lobby.results[round - 1],
          [userId]: results,
        };
        lobby.resultsSum[round - 1] = {
          ...lobby.resultsSum[round - 1],
          [userId]: resultsSum,
        };
        ctx.session.state.lobby = lobby;

        // Пересылаем остальным игрокам результат броска
        lobby.rivals.map((replyTo) => {
          if (replyTo === userId) return;
          try {
            bot.telegram.forwardMessage(replyTo, userId, diceMsg.message_id, {
              disable_notification: true,
            });
          } catch (error) {}
        });

        // Ожидаем окончание анимации
        await timeout(3500);

        for (let i = 0; i < resMsgArr.length; i++) {
          const userId = resMsgArr[i].chat.id;
          const msg = `${resMsgArr[i].text}\nОбщее кол-во очков: 🏀 ${resultsSum}`;
          bot.telegram.editMessageText(
            userId,
            resMsgArr[i].message_id,
            null,
            msg,
            {
              parse_mode: "HTML",
              disable_notification: true,
            }
          );
        }
      }
    }
  }

  // *************** DARTS ***************

  if (type === "🎯" && !round) {
    for (let i = 0; i < 4; i++) {
      const lobby = ctx.session.state.lobby;
      for (let userId of lobby.rivals) {
        const resMsgArr = [];
        // Отправляем каждому игроку сообщение о том, кто бьет мяч
        for (let uid of lobby.rivals) {
          if (uid !== userId) {
            try {
              const resMsg = await bot.telegram.sendMessage(
                uid,
                `Сейчас бросок делает игрок: ${lobby.rivalsLinks[userId]}`,
                { parse_mode: "HTML", disable_notification: true }
              );
              resMsgArr.push(resMsg);
            } catch (error) {}
          } else {
            try {
              const resMsg = await bot.telegram.sendMessage(
                uid,
                `Сейчас ваш бросок`,
                {
                  disable_notification: true,
                }
              );
              resMsgArr.push(resMsg);
            } catch (error) {}
          }
        }

        let diceMsg = null;
        try {
          diceMsg = await bot.telegram.sendDice(userId, {
            emoji: "🎯",
            disable_notification: true,
          });
        } catch (error) {}

        // Берем предыдущие результаты
        let results = [...lobby.results[0][userId], diceMsg.dice.value];
        let resultsSum = lobby.resultsSum[0][userId];

        resultsSum += diceMsg.dice.value - 1;

        // Записываем результат игры
        lobby.results[0] = { ...lobby.results[0], [userId]: results };
        lobby.resultsSum[0] = { ...lobby.resultsSum[0], [userId]: resultsSum };
        ctx.session.state.lobby = lobby;

        // Пересылаем остальным игрокам результат броска
        lobby.rivals.map((replyTo) => {
          if (replyTo === userId) return;
          try {
            bot.telegram.forwardMessage(replyTo, userId, diceMsg.message_id, {
              disable_notification: true,
            });
          } catch (error) {}
        });

        // Ожидаем окончание анимации
        await timeout(3000);

        for (let i = 0; i < resMsgArr.length; i++) {
          const userId = resMsgArr[i].chat.id;
          const msg = `${resMsgArr[i].text}\nОбщее кол-во очков: 🎯 ${resultsSum}`;
          bot.telegram.editMessageText(
            userId,
            resMsgArr[i].message_id,
            null,
            msg,
            {
              parse_mode: "HTML",
              disable_notification: true,
            }
          );
        }
      }
    }
  }

  if (type === "🎯" && round) {
    for (let i = 0; i < 1; i++) {
      const lobby = ctx.session.state.lobby;
      for (let { userId } of rivals) {
        const resMsgArr = [];
        // Отправляем каждому игроку сообщение о том, кто бьет мяч
        for (let uid of lobby.rivals) {
          if (uid !== userId) {
            try {
              const resMsg = await bot.telegram.sendMessage(
                uid,
                `Сейчас бросок делает игрок: ${lobby.rivalsLinks[userId]}`,
                { parse_mode: "HTML", disable_notification: true }
              );
              resMsgArr.push(resMsg);
            } catch (error) {}
          } else {
            try {
              const resMsg = await bot.telegram.sendMessage(
                uid,
                `Сейчас ваш бросок`,
                {
                  disable_notification: true,
                }
              );
              resMsgArr.push(resMsg);
            } catch (error) {}
          }
        }

        let diceMsg = null;
        try {
          diceMsg = await bot.telegram.sendDice(userId, {
            emoji: "🎯",
            disable_notification: true,
          });
        } catch (error) {}

        // Берем предыдущие результаты
        let results = [...lobby.results[round - 1][userId], diceMsg.dice.value];
        let resultsSum = lobby.resultsSum[round - 1][userId];

        resultsSum += diceMsg.dice.value - 1;

        // Записываем результат игры
        lobby.results[round - 1] = {
          ...lobby.results[round - 1],
          [userId]: results,
        };
        lobby.resultsSum[round - 1] = {
          ...lobby.resultsSum[round - 1],
          [userId]: resultsSum,
        };
        ctx.session.state.lobby = lobby;

        // Пересылаем остальным игрокам результат броска
        lobby.rivals.map((replyTo) => {
          if (replyTo === userId) return;
          try {
            bot.telegram.forwardMessage(replyTo, userId, diceMsg.message_id, {
              disable_notification: true,
            });
          } catch (error) {}
        });

        // Ожидаем окончание анимации
        await timeout(3000);

        for (let i = 0; i < resMsgArr.length; i++) {
          const userId = resMsgArr[i].chat.id;
          const msg = `${resMsgArr[i].text}\nОбщее кол-во очков: 🎯 ${resultsSum}`;
          bot.telegram.editMessageText(
            userId,
            resMsgArr[i].message_id,
            null,
            msg,
            {
              parse_mode: "HTML",
              disable_notification: true,
            }
          );
        }
      }
    }
  }
}

async function playing2round(lobby, players, round, ctx) {
  const players2round = [players[0]];
  const finallPlayers = [];

  // Выбираем игроков с одинаковым результатом
  for (let i = 1; i < players.length; i++) {
    if (players[i].resultsSum === players[0].resultsSum) {
      players2round.push(players[i]);
    }
  }

  if (players2round.length === 1) {
    return { resLobby: lobby, winner: players[0].userId };
  }

  // Если одинаковые результаты
  if (players2round.length > 1) {
    const reversedResults = {};
    for (let i = 0; i < lobby.resultsSum.length; i++) {
      for (const [key, value] of Object.entries(lobby.resultsSum[i])) {
        if (reversedResults[key]) {
          reversedResults[key] = [...reversedResults[key], value];
        } else {
          reversedResults[key] = [value];
        }
      }
    }

    // Отправляем игрокам сообщение об втором раунде
    lobby.rivals.map((userId) => {
      try {
        bot.telegram.sendMessage(
          userId,
          `${lobby.typeGame} Лобби #${lobby.lobbyId} ➖ ${round} раунд

Играют:
${players2round
  .map(
    (item, i) =>
      `${i + 1}. 👤 ${lobby.rivalsLinks[item.userId]} ➖ ${
        lobby.typeGame
      } ${reversedResults[item.userId].join(` ${lobby.typeGame} `)}`
  )
  .join("\n")}`,
          { parse_mode: "HTML", disable_notification: true }
        );
      } catch (error) {}
    });

    lobby.results[round - 1] = {};
    lobby.resultsSum[round - 1] = {};

    for (let userId of lobby.rivals) {
      lobby.results[round - 1][userId] = [];
      lobby.resultsSum[round - 1][userId] = 0;
    }

    ctx.session.state.lobby = lobby;

    await sendStickers(ctx, round, players2round);

    const _lobby = ctx.session.state.lobby;

    for (let { userId } of players2round) {
      finallPlayers.push({
        userId,
        resultsSum: _lobby.resultsSum[round - 1][userId],
      });
    }

    const sortedPlayers = finallPlayers.sort(
      (a, b) => b.resultsSum - a.resultsSum
    );

    return await playing2round(_lobby, sortedPlayers, round++, ctx);
  }
}

function separate(arr) {
  let cols = 1;
  let rows = 5;

  const rowsItems = [];
  for (let i = 0, j = arr.length; i < j; i += cols) {
    const row = arr.slice(i, i + cols);
    rowsItems.push(row);
  }

  const pagesItems = [];
  for (let i = 0, j = rowsItems.length; i < j; i += rows) {
    const page = rowsItems.slice(i, i + rows);
    pagesItems.push(page);
  }

  return pagesItems;
}

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setState(ctx) {
  return new Promise((resolve) => {
    ctx.session.state.actionStatus = true;
    resolve();
  });
}

function removeState(ctx) {
  return new Promise((resolve) => {
    ctx.session.state.actionStatus = false;
    resolve();
  });
}

module.exports = { pvpAllGames };
