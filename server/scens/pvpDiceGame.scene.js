const { bot } = require("../init/startBot");
const User = require("../models/user");
const PvpGame = require("../models/pvpDiceGame");
const MainStats = require("../models/mainstats");

const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const isNumber = require("is-number");

const pvpDiceGame = new Scene("pvpDiceGame");
pvpDiceGame.enter(async (ctx) => {
  await ctx.reply(
    "Вы вошли в режим pvp-игры",
    Extra.markup(Markup.keyboard([["🏡 Вернуться на главную"]]).resize())
  );

  await showMainView(ctx);
});

pvpDiceGame.action("Мои лобби", async (ctx) => {
  const { actionStatus } = ctx.session.state;

  if (actionStatus) return;
  await setState(ctx);

  await showMyLobby(ctx);

  await removeState(ctx);
});

pvpDiceGame.action(">", async (ctx) => {
  const { activeView, boardCountPage, boardMaxPages, actionStatus } =
    ctx.session.state;

  if (actionStatus) return;
  await setState(ctx);

  if (boardCountPage + 1 <= boardMaxPages) {
    ctx.session.state.boardCountPage = boardCountPage + 1;
  } else {
    await removeState(ctx);
    return await ctx.answerCbQuery("Это была последняя страница", true);
  }

  if (activeView === "main") {
    await showMainView(ctx);
  }
  if (activeView === "mylobby") {
    await showMyLobby(ctx);
  }

  await removeState(ctx);
});

pvpDiceGame.action("<", async (ctx) => {
  const { activeView, boardCountPage, actionStatus } = ctx.session.state;

  if (actionStatus) return;
  await setState(ctx);

  if (boardCountPage - 1 !== 0) {
    ctx.session.state.boardCountPage = boardCountPage - 1;
  } else {
    await removeState(ctx);
    return await ctx.answerCbQuery("Левее некуда..", true);
  }

  if (activeView === "main") {
    await showMainView(ctx);
  }
  if (activeView === "mylobby") {
    await showMyLobby(ctx);
  }

  await removeState(ctx);
});

pvpDiceGame.action("Создать лобби", async (ctx) => {
  const { actionStatus } = ctx.session.state;

  if (actionStatus) return;
  await setState(ctx);

  await showCreateLobbyStep1(ctx);

  await removeState(ctx);
});

pvpDiceGame.action("Статистика", async (ctx) => {
  const { actionStatus } = ctx.session.state;

  if (actionStatus) return;
  await setState(ctx);

  await showStats(ctx);

  await removeState(ctx);
});

pvpDiceGame.on("text", async (ctx) => {
  const msg = ctx.update.message.text;
  const { activeView, createLobbyStep, activeBoard } = ctx.session.state;

  if (activeView === "createlobby" && createLobbyStep === 2) {
    ctx.session.state.createLobbyRate = msg;
    return await showCreateLobbyStep3(ctx);
  }

  if (msg === "🏡 Вернуться на главную") {
    try {
      await ctx.deleteMessage(activeBoard.message_id);
    } catch (error) {}
    await ctx.scene.enter("showMainMenu");
  }
});

pvpDiceGame.action(/(?:2 игрока|3 игрока|5 игроков)/, async (ctx) => {
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

pvpDiceGame.action("Вступить в лобби", async (ctx) => {
  const { actionStatus } = ctx.session.state;

  if (actionStatus) return;
  await setState(ctx);

  await joinToLobby(ctx);

  await removeState(ctx);
});

pvpDiceGame.action("Выйти из лобби", async (ctx) => {
  const { actionStatus } = ctx.session.state;

  if (actionStatus) return;
  await setState(ctx);

  await deleteLobby(ctx);

  await removeState(ctx);
});

pvpDiceGame.action("🔄 Обновить", async (ctx) => {
  const { activeView, actionStatus } = ctx.session.state;

  if (actionStatus) return;
  await setState(ctx);

  ctx.session.state.boardCountPage = 1;

  if (activeView === "mylobby") {
    await showMyLobby(ctx);
  }
  if (activeView === "main") {
    await showMainView(ctx);
  }

  await removeState(ctx);
});

pvpDiceGame.action("Вернуться назад", async (ctx) => {
  const { activeView, createLobbyStep, actionStatus } = ctx.session.state;

  if (actionStatus) return;
  await setState(ctx);

  if (activeView === "createlobby" && createLobbyStep === 1) {
    ctx.session.state.boardCountPage = 1;
    await showMyLobby(ctx);
  }
  if (activeView === "createlobby" && createLobbyStep === 2) {
    await showCreateLobbyStep1(ctx);
  }
  if (
    activeView === "mylobby" ||
    activeView === "showStats" ||
    activeView === "playwithrials"
  ) {
    ctx.session.state.boardCountPage = 1;
    await showMainView(ctx);
  }
  if (activeView === "select-mylobby") {
    await showMyLobby(ctx);
  }

  await removeState(ctx);
});

pvpDiceGame.action(/./, async (ctx) => {
  const { activeView, actionStatus } = ctx.session.state;
  const btnData = ctx.update.callback_query.data;

  if (actionStatus) return;
  await setState(ctx);

  if (btnData.indexOf("lobby_id:") >= 0) {
    const lobbyId = btnData.replace("lobby_id:", "");
    ctx.session.state.lobbyId = lobbyId;

    if (activeView === "mylobby") {
      await selectMyLobby(ctx);
    }

    if (activeView === "main") {
      await showSelectRivals(ctx);
    }
  }

  await removeState(ctx);
});

async function showMainView(ctx) {
  const {
    typeGame,
    typeBalance,
    activeBoard,
    boardCountPage = 1,
    photoMessage,
  } = ctx.session.state;
  ctx.session.state.activeView = "main";

  const pvpGames = await PvpGame.find({
    typeGame,
    typeBalance,
    statusGame: "waiting",
    rivals: {
      $ne: ctx.from.id,
    },
  });

  const user = await User.findOne({ userId: ctx.from.id });

  try {
    await ctx.deleteMessage(activeBoard.message_id);
  } catch (error) {}
  try {
    await ctx.deleteMessage(photoMessage.message_id);
  } catch (error) {}

  const newPhotoMessage = await bot.telegram.sendPhoto(
    ctx.from.id,
    "AgACAgIAAxkBAAIWbGCZQ2YINkXL_u5KDZMtsXr3ylGRAAJlsjEbmEzQSByhDFghgy-XgQuaoi4AAwEAAwIAA20AA1_5AQABHwQ"
  );

  ctx.session.state.photoMessage = newPhotoMessage;

  if (pvpGames.length === 0) {
    const newActiveBoard = await ctx.reply(
      `На данный момент нету соперников.
Вы можете создать свое лобби: "Мои лобби" --> "Создать лобби"

Ваш баланс: ${user[typeBalance]}p`,
      Extra.markup((m) =>
        m.inlineKeyboard([
          [
            m.callbackButton("Мои лобби", "Мои лобби"),
            m.callbackButton("🔄 Обновить", "🔄 Обновить"),
            m.callbackButton("Статистика", "Статистика"),
          ],
        ])
      )
    );
    ctx.session.state.activeBoard = newActiveBoard;
    return;
  }

  const boardGames = separate(pvpGames);
  const boardMaxPages = boardGames.length;

  const newActiveBoard = await ctx.reply(
    `Выберите лобби, чтобы присоединиться к игре.
Вы можете создать свое лобби: "Мои лобби" --> "Создать лобби"

Ваш баланс: ${user[typeBalance]}p

Страница: ${boardCountPage}/${boardMaxPages}`,
    Extra.markup((m) =>
      m.inlineKeyboard([
        ...boardGames[boardCountPage - 1].map((cols) =>
          cols.map((game) =>
            m.callbackButton(
              `Lobby #${game.lobbyId} ➖ ${game.prize}р  👤 [${game.rivals.length}/${game.size}]`,
              `lobby_id:${game.lobbyId}`
            )
          )
        ),
        [
          m.callbackButton("<", "<"),
          m.callbackButton("🔄 Обновить", "🔄 Обновить"),
          m.callbackButton(">", ">"),
        ],
        [
          m.callbackButton("Мои лобби", "Мои лобби"),
          m.callbackButton("Статистика", "Статистика"),
        ],
      ])
    )
  );

  ctx.session.state = {
    ...ctx.session.state,
    activeBoard: newActiveBoard,
    boardGames,
    boardCountPage,
    boardMaxPages,
  };
}

async function showMyLobby(ctx) {
  const {
    typeGame,
    typeBalance,
    activeBoard,
    boardCountPage = 1,
    photoMessage,
  } = ctx.session.state;
  ctx.session.state.activeView = "mylobby";

  const pvpGames = await PvpGame.find({
    typeGame,
    typeBalance,
    statusGame: { $in: ["waiting", "final"] },
    rivals: ctx.from.id,
  });

  const userGames = await PvpGame.find({
    typeGame,
    typeBalance,
    statusGame: "waiting",
    creator: ctx.from.id,
  });

  try {
    await ctx.deleteMessage(activeBoard.message_id);
  } catch (error) {}
  try {
    await ctx.deleteMessage(photoMessage.message_id);
  } catch (error) {}

  const newPhotoMessage = await bot.telegram.sendPhoto(
    ctx.from.id,
    "AgACAgIAAxkBAAIWbGCZQ2YINkXL_u5KDZMtsXr3ylGRAAJlsjEbmEzQSByhDFghgy-XgQuaoi4AAwEAAwIAA20AA1_5AQABHwQ"
  );

  ctx.session.state.photoMessage = newPhotoMessage;

  if (pvpGames.length === 0) {
    const newActiveBoard = await ctx.reply(
      "Вы не участвуйте ни в одном лобби. Хотите создать свое?",
      Extra.markup((m) =>
        m.inlineKeyboard([
          [m.callbackButton("Создать лобби", "Создать лобби")],
          [m.callbackButton("Вернуться назад", "Вернуться назад")],
        ])
      )
    );
    ctx.session.state.activeBoard = newActiveBoard;
    return;
  }

  const boardGames = separate(pvpGames);
  const boardMaxPages = boardGames.length;

  const isCreate = (m) =>
    userGames.length === 10
      ? [[m.callbackButton("Вернуться назад", "Вернуться назад")]]
      : [
          [m.callbackButton("Создать лобби", "Создать лобби")],
          [m.callbackButton("Вернуться назад", "Вернуться назад")],
        ];

  const newActiveBoard = await ctx.reply(
    `Вы можете выйти из лобби: войдите в лобби --> "Выйти из лобби" ${
      userGames.length === 10
        ? "\nВы не можете создать еще одно лобби. Макс. 10шт"
        : ""
    }

Страница: ${boardCountPage}/${boardMaxPages}`,
    Extra.markup((m) =>
      m.inlineKeyboard([
        ...boardGames[boardCountPage - 1].map((cols) =>
          cols.map((game) => {
            const status =
              game.rivals.length === game.size ? "Готово" : "Ожидание";
            return m.callbackButton(
              `Lobby #${game.lobbyId} ➖ ${game.prize}р  👤 [${game.rivals.length}/${game.size}] ➖ ${status}`,
              `lobby_id:${game.lobbyId}`
            );
          })
        ),
        [
          m.callbackButton("<", "<"),
          m.callbackButton("🔄 Обновить", "🔄 Обновить"),
          m.callbackButton(">", ">"),
        ],
        ...isCreate(m),
      ])
    )
  );

  ctx.session.state = {
    ...ctx.session.state,
    activeBoard: newActiveBoard,
    boardGames,
    boardCountPage,
    boardMaxPages,
  };
}

async function selectMyLobby(ctx) {
  const { lobbyId, activeBoard } = ctx.session.state;
  ctx.session.state.activeView = "select-mylobby";

  const lobby = await PvpGame.findOne({ lobbyId });
  const { pvpPercent } = await MainStats.findOne();

  const lobbyPrize = lobby.prize * lobby.size * (1 - pvpPercent / 100);

  try {
    await ctx.deleteMessage(activeBoard.message_id);
  } catch (error) {}

  if (lobby.statusGame === "waiting") {
    const newActiveBoard = await ctx.reply(
      `Лобби еще не собрано, пожалуйста дождитесь остальных игроков..
Как только лобби собирется, бот автоматически сделает бросок и пришлет вам результат игры.

Призовой фонд: ${lobbyPrize}p

👤 Соперники:
${[...lobby.rivals, ...new Array(lobby.size - lobby.rivals.length)]
  .map((item, i) => {
    if (!item) return `${i + 1}. Ожидание..`;
    return `${i + 1}. ${item}`;
  })
  .join("\n")}`,
      Extra.markup((m) =>
        m.inlineKeyboard([
          [
            m.callbackButton("Выйти из лобби", "Выйти из лобби"),
            m.callbackButton("Вернуться назад", "Вернуться назад"),
          ],
        ])
      )
    );
    ctx.session.state.activeBoard = newActiveBoard;
  }
}

async function showStats(ctx) {
  const { activeBoard } = ctx.session.state;
  ctx.session.state.activeView = "showStats";

  try {
    await ctx.deleteMessage(activeBoard.message_id);
  } catch (error) {}

  const allUsers = await User.find({ "pvpDice.count": { $gte: 1 } })
    .sort({ "pvpDice.winCash": -1 })
    .limit(10);

  const user = await User.findOne({ userId: ctx.from.id });
  const latestGames = await PvpGame.find({
    rivals: ctx.from.id,
    statusGame: "completed",
  })
    .sort({ _id: -1 })
    .limit(10);

  ctx.session.state.activeBoard = await ctx.reply(
    `ОБЩИЙ РЕЙТИНГ
Ваше место в рейтинге: №${user.pvpDice.rating}
Вы сыграли ${user.pvpDice.count} на сумму ${user.pvpDice.playCash}p
Ваш общий выигрыш: ${user.pvpDice.winCash}p

ТОП-10 игроков:
${allUsers
  .map(
    (item, i) =>
      `${i + 1}. ${item.userName ? "@" + item.userName : item.userId}`
  )
  .join("\n")}

Ваши последние игры:
${latestGames
  .map((item) => {
    const status = item.winner === ctx.from.id ? "🟢" : "🔴";
    return `${status} 👤 ${item.rivals.length} 💰 ${
      item.prize * item.rivals.length
    }p  🎲 ${item.reversedResults[ctx.from.id].join(" 🎲 ")}`;
  })
  .join("\n")}`,
    Extra.markup((m) =>
      m.inlineKeyboard([
        [m.callbackButton("Вернуться назад", "Вернуться назад")],
      ])
    )
  );
}

async function showCreateLobbyStep1(ctx) {
  const { activeBoard } = ctx.session.state;
  ctx.session.state.activeView = "createlobby";
  ctx.session.state.createLobbyStep = 1;

  try {
    await ctx.deleteMessage(activeBoard.message_id);
  } catch (error) {}

  const newActiveBoard = await ctx.reply(
    `Step 1/2 - Выберите количество игроков`,
    Extra.markup((m) =>
      m.inlineKeyboard([
        [
          m.callbackButton("2 игрока", "2 игрока"),
          m.callbackButton("3 игрока", "3 игрока"),
          m.callbackButton("5 игроков", "5 игроков"),
        ],
        [m.callbackButton("Вернуться назад", "Вернуться назад")],
      ])
    )
  );

  ctx.session.state.activeBoard = newActiveBoard;
}

async function showCreateLobbyStep2(ctx) {
  const { typeBalance, activeBoard } = ctx.session.state;
  ctx.session.state.activeView = "createlobby";
  ctx.session.state.createLobbyStep = 2;

  try {
    await ctx.deleteMessage(activeBoard.message_id);
  } catch (error) {}

  const user = await User.findOne({ userId: ctx.from.id });

  const newActiveBoard = await ctx.reply(
    `Step 2/2 - Напишите в чат ставку
_Указанная сумма будет удержана с вашего аккаунта_

Ваш баланс: ${user[typeBalance]}`,
    Extra.markup((m) =>
      m.inlineKeyboard([m.callbackButton("Вернуться назад", "Вернуться назад")])
    )
  );

  ctx.session.state.activeBoard = newActiveBoard;
}

async function showCreateLobbyStep3(ctx) {
  const { typeBalance, activeBoard, createLobbyRate } = ctx.session.state;

  if (!isNumber(createLobbyRate)) {
    return await ctx.reply("Пожалуйста, введите только положительные цифры.");
  }

  const { minGameRate } = await MainStats.findOne();

  if (createLobbyRate < minGameRate) {
    return await ctx.reply(
      `Минимальная сумма ставки составляет ${minGameRate}₽`
    );
  }

  const user = await User.findOne({ userId: ctx.from.id });

  if (user[typeBalance] - createLobbyRate < 0) {
    return await ctx.reply(
      "У вас недостаточно баланса, чтобы создать лобби c указанной ставкой"
    );
  }

  try {
    await ctx.deleteMessage(activeBoard.message_id);
  } catch (error) {}

  await createLobby(ctx);

  ctx.session.state = {
    ...ctx.session.state,
    createLobbyStep: 0,
  };
}

async function showSelectRivals(ctx) {
  const { activeBoard, lobbyId, typeBalance } = ctx.session.state;
  ctx.session.state.activeView = "playwithrials";

  const lobby = await PvpGame.findOne({ lobbyId });
  const user = await User.findOne({ userId: ctx.from.id });
  const { pvpPercent } = await MainStats.findOne();

  const lobbyPrize = lobby.prize * lobby.size * (1 - pvpPercent / 100);

  if (user[typeBalance] < lobby.prize) {
    return await ctx.answerCbQuery(
      "У вас недостаточно баланса, чтобы выбрать данное лобби.",
      true
    );
  }

  try {
    await ctx.deleteMessage(activeBoard.message_id);
  } catch (error) {}

  const newActiveBoard = await ctx.reply(
    `Вы успешно выбрали лобби.

Призовой фонд: ${lobbyPrize}p
    
Соперники:
${[...lobby.rivals, ...new Array(lobby.size - lobby.rivals.length)]
  .map((item, i) => {
    if (!item) return `${i + 1}. Ожидание..`;
    return `${i + 1}. ${item}`;
  })
  .join("\n")}
`,
    Extra.markup((m) =>
      m.inlineKeyboard([
        [m.callbackButton("Вступить в лобби", "Вступить в лобби")],
        [m.callbackButton("Вернуться назад", "Вернуться назад")],
      ])
    )
  );

  ctx.session.state = {
    ...ctx.session.state,
    activeBoard: newActiveBoard,
  };
}

async function joinToLobby(ctx) {
  const { lobbyId, typeBalance } = ctx.session.state;

  const lobby = await PvpGame.findOne({ lobbyId });

  if (lobby.rivals.indexOf(ctx.from.id) > 0) return;

  lobby.rivals.push(ctx.from.id);
  await PvpGame.updateOne({ lobbyId }, { rivals: lobby.rivals });

  const user = await User.findOne({ userId: ctx.from.id });
  await User.updateOne(
    { userId: ctx.from.id },
    { [typeBalance]: +(user[typeBalance] - lobby.prize).toFixed(2) }
  );

  await ctx.reply(`Вы успешно вступили в лобби.
С вашего баланса была удержана сумма: ${lobby.prize}p`);

  // Если вступил последний игрок - ЗАПУСКАЕМ ИГРУ
  checkLastPlayer(lobby, ctx);
}

async function checkLastPlayer(lobby, ctx) {
  if (lobby.rivals.length !== lobby.size) {
    return await showMainView(ctx);
  }

  lobby.rivals.map((userId) =>
    bot.telegram.sendMessage(userId, `Лобби #${lobby.lobbyId} было собрано`, {
      disable_notification: true,
    })
  );

  const { pvpGames, pvpPercent } = await MainStats.findOne();

  const lobbyPrize = lobby.prize * lobby.size * (1 - pvpPercent / 100);

  // Обновляем статус игры на "pending"
  await PvpGame.updateOne(
    { lobbyId: lobby.lobbyId },
    {
      statusGame: "pending",
    }
  );
  await MainStats.updateOne(
    {},
    {
      $inc: { "pvpGames.dice.countLobby": 1 },
      "pvpGames.dice.countCash": +(
        pvpGames.dice.countCash + lobbyPrize
      ).toFixed(2),
    }
  );

  // Записываем ключи объекта
  lobby.results[0] = {};
  lobby.resultsSum[0] = {};

  for (let userId of lobby.rivals) {
    lobby.results[0][userId] = [];
    lobby.resultsSum[0][userId] = 0;
  }

  // Делаем бросок каждому игроку
  for (let userId of lobby.rivals) {
    // Отправляем каждому игроку сообщение о том, кто делает бросок
    for (let uid of lobby.rivals) {
      if (uid !== userId) {
        await bot.telegram.sendMessage(
          uid,
          `Сейчас бросок делает игрок: ${userId}`,
          { disable_notification: true }
        );
      } else {
        await bot.telegram.sendMessage(uid, `Сейчас ваш бросок`, {
          disable_notification: true,
        });
      }
    }

    const dice1 = await bot.telegram.sendDice(userId, {
      emoji: "🎲",
      disable_notification: true,
    });
    const dice2 = await bot.telegram.sendDice(userId, {
      emoji: "🎲",
      disable_notification: true,
    });
    const dice3 = await bot.telegram.sendDice(userId, {
      emoji: "🎲",
      disable_notification: true,
    });

    // Пересылаем остальным игрокам результат броска
    lobby.rivals.map((replyTo) => {
      if (replyTo === userId) return;
      bot.telegram.forwardMessage(replyTo, userId, dice1.message_id, {
        disable_notification: true,
      });
      bot.telegram.forwardMessage(replyTo, userId, dice2.message_id, {
        disable_notification: true,
      });
      bot.telegram.forwardMessage(replyTo, userId, dice3.message_id, {
        disable_notification: true,
      });
    });

    const value1 = dice1.dice.value;
    const value2 = dice2.dice.value;
    const value3 = dice3.dice.value;

    const results = [value1, value2, value3];
    const resultsSum = value1 + value2 + value3;

    lobby.results[0] = { ...lobby.results[0], [userId]: results };
    lobby.resultsSum[0] = { ...lobby.resultsSum[0], [userId]: resultsSum };

    // Ожидаем окончание анимации
    await timeout(4000);
  }

  // Сформируем массив с результатами игроков
  // Выбираем по убыванию
  const players = lobby.rivals
    .map((item) => ({
      userId: item,
      resultsSum: lobby.resultsSum[0][item],
    }))
    .sort((a, b) => b.resultsSum - a.resultsSum);

  let { resLobby, winner } = await playing2round(lobby, players);

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

  // Отправляем игрокам общий результат
  lobby.rivals.map((userId) =>
    bot.telegram.sendMessage(
      userId,
      `Результат лобби #${lobby.lobbyId}

${
  userId === winner
    ? `Вы выиграли!
Ваш выигрыш: ${lobbyPrize}p`
    : `Выиграл ${winner}
Выигрыш составил: ${lobbyPrize}p`
}
   
${lobby.rivals
  .map(
    (item, i) =>
      `${i + 1}. 👤 ${item} ➖ 🎲 ${reversedResults[item].join(" 🎲 ")}`
  )
  .join("\n")}`
    )
  );

  // Обновляем статус игры на "completed"
  await PvpGame.updateOne(
    { lobbyId: lobby.lobbyId },
    {
      winner,
      statusGame: "completed",
      results: resLobby.results,
      resultsSum: resLobby.resultsSum,
      reversedResults,
    }
  );

  // Начисляем выигрыш победителю
  const { mainBalance, pvpDice } = await User.findOne({ userId: winner });
  await User.updateOne(
    { userId: winner },
    {
      mainBalance: +(mainBalance + lobbyPrize).toFixed(2),
      pvpDice: {
        ...pvpDice,
        winCount: pvpDice.winCount + 1,
        winCash: +(pvpDice.winCash + lobbyPrize).toFixed(2),
      },
    }
  );

  // Обновляем статистику игроков
  for (let i = 0; i < lobby.rivals.length; i++) {
    const { pvpDice } = await User.findOne({ userId: lobby.rivals[i] });
    await User.updateOne(
      { userId: lobby.rivals[i] },
      {
        pvpDice: {
          ...pvpDice,
          count: pvpDice.count + 1,
          playCash: +(pvpDice.playCash + lobby.prize).toFixed(2),
        },
      }
    );
  }

  await showMainView(ctx);
}

async function playing2round(lobby, players, round = 2) {
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

  // Если несколько победителей
  if (players2round.length > 1) {
    // Отправляем игрокам сообщение об втором раунде
    lobby.rivals.map((userId) =>
      bot.telegram.sendMessage(
        userId,
        `Лобби #${lobby.lobbyId} ➖ ${round} раунд

Играют:
${players2round.map((item, i) => `${i + 1}. 👤 ${item.userId}`).join("\n")}`,
        { disable_notification: true }
      )
    );

    lobby.results[round - 1] = {};
    lobby.resultsSum[round - 1] = {};

    for (let userId of lobby.rivals) {
      lobby.results[round - 1][userId] = [];
      lobby.resultsSum[round - 1][userId] = 0;
    }

    // Делаем бросок каждому игроку
    for (let { userId } of players2round) {
      // Отправляем каждому игроку сообщение о том, кто бьет мяч
      for (let uid of lobby.rivals) {
        if (uid !== userId) {
          await bot.telegram.sendMessage(
            uid,
            `Бросок делает игрок: ${userId}`,
            { disable_notification: true }
          );
        } else {
          await bot.telegram.sendMessage(uid, `Сейчас ваш бросок`, {
            disable_notification: true,
          });
        }
      }

      const diceMsg1 = await bot.telegram.sendDice(userId, {
        emoji: "🎲",
        disable_notification: true,
      });
      const diceMsg2 = await bot.telegram.sendDice(userId, {
        emoji: "🎲",
        disable_notification: true,
      });
      const diceMsg3 = await bot.telegram.sendDice(userId, {
        emoji: "🎲",
        disable_notification: true,
      });

      // Пересылаем остальным игрокам результат броска
      lobby.rivals.map((replyTo) => {
        if (replyTo === userId) return;
        bot.telegram.forwardMessage(replyTo, userId, diceMsg1.message_id, {
          disable_notification: true,
        });
        bot.telegram.forwardMessage(replyTo, userId, diceMsg2.message_id, {
          disable_notification: true,
        });
        bot.telegram.forwardMessage(replyTo, userId, diceMsg3.message_id, {
          disable_notification: true,
        });
      });

      const value1 = diceMsg1.dice.value;
      const value2 = diceMsg2.dice.value;
      const value3 = diceMsg3.dice.value;

      const results = [value1, value2, value3];
      const resultsSum = value1 + value2 + value3;

      // Записываем результат игры
      lobby.results[round - 1] = {
        ...lobby.results[round - 1],
        [userId]: results,
      };
      lobby.resultsSum[round - 1] = {
        ...lobby.resultsSum[round - 1],
        [userId]: resultsSum,
      };

      // Ожидаем окончание анимации
      await timeout(4000);
    }

    for (let { userId } of players2round) {
      finallPlayers.push({
        userId,
        resultsSum: lobby.resultsSum[round - 1][userId],
      });
    }

    const sortedPlayers = finallPlayers.sort(
      (a, b) => b.resultsSum - a.resultsSum
    );

    return await playing2round(lobby, sortedPlayers);
  }
}

async function createLobby(ctx) {
  const { typeGame, typeBalance, createLobbyRate, createLobbyRoomSize } =
    ctx.session.state;

  const { pvpGames } = await MainStats.findOne();
  await MainStats.updateOne({}, { $inc: { "pvpGames.prevLobbyId": 1 } });

  const pvpGame = new PvpGame({
    lobbyId: pvpGames.prevLobbyId + 1,
    typeGame,
    typeBalance,
    statusGame: "waiting",
    size: createLobbyRoomSize,
    prize: createLobbyRate,
    rivals: [ctx.from.id],
    creator: ctx.from.id,
  });
  await pvpGame.save();

  // UPDATE USER BALANCE
  const user = await User.findOne({ userId: ctx.from.id });
  await User.updateOne(
    { userId: ctx.from.id },
    { [typeBalance]: +(user[typeBalance] - createLobbyRate).toFixed(2) }
  );

  await ctx.reply(`Лобби успешно созданно.

С вашего баланса было удеражна сумма: ${createLobbyRate}p`);
  ctx.session.state.createLobbyStep = 0;

  await showMyLobby(ctx);
}

async function deleteLobby(ctx) {
  const { lobbyId, typeBalance } = ctx.session.state;

  const lobby = await PvpGame.findOne({ lobbyId });

  if (!lobby || lobby.rivals.indexOf(ctx.from.id) === -1) return;

  const user = await User.findOne({ userId: ctx.from.id });
  const userIndex = lobby.rivals.indexOf(ctx.from.id);

  lobby.rivals.splice(userIndex, 1);

  if (lobby.rivals.length !== 0) {
    await PvpGame.updateOne({ lobbyId }, { rivals: lobby.rivals });
  } else {
    await PvpGame.deleteOne({ lobbyId });
  }

  await User.updateOne(
    { userId: ctx.from.id },
    { [typeBalance]: +(user[typeBalance] + lobby.prize).toFixed(2) }
  );

  await ctx.reply(`Вы успешно вышли из лобби.
Возврат удержанной суммы: ${lobby.prize}
Ваш баланс: ${(user[typeBalance] + lobby.prize).toFixed(2)}`);

  await showMyLobby(ctx);
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

module.exports = { pvpDiceGame };
