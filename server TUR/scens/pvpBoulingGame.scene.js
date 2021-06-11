const { bot } = require("../init/startBot");

const User = require("../models/user");
const PvpGame = require("../models/pvpBoulingGame");
const MainStats = require("../models/mainstats");

const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const isNumber = require("is-number");

const pvpBoulingGame = new Scene("pvpBoulingGame");
pvpBoulingGame.enter(async (ctx) => {
  await ctx.reply(
    "PVP-GAMES’e giriş yaptınız.",
    Extra.markup(Markup.keyboard([["🏡 Ana Menüye Dön"]]).resize())
  );

  await showMainView(ctx);
});

pvpBoulingGame.action("Lobilerim", async (ctx) => {
  const { actionStatus } = ctx.session.state;

  if (actionStatus) return;
  await setState(ctx);

  await showMyLobby(ctx);

  await removeState(ctx);
});

pvpBoulingGame.action(">", async (ctx) => {
  const { activeView, boardCountPage, boardMaxPages, actionStatus } =
    ctx.session.state;

  if (actionStatus) return;
  await setState(ctx);

  if (boardCountPage + 1 <= boardMaxPages) {
    ctx.session.state.boardCountPage = boardCountPage + 1;
  } else {
    await removeState(ctx);
    return await ctx.answerCbQuery("Son Açık Sayfa", true);
  }

  if (activeView === "main") {
    await showMainView(ctx);
  }
  if (activeView === "mylobby") {
    await showMyLobby(ctx);
  }

  await removeState(ctx);
});

pvpBoulingGame.action("<", async (ctx) => {
  const { activeView, boardCountPage, actionStatus } = ctx.session.state;

  if (actionStatus) return;
  await setState(ctx);

  if (boardCountPage - 1 !== 0) {
    ctx.session.state.boardCountPage = boardCountPage - 1;
  } else {
    await removeState(ctx);
    return await ctx.answerCbQuery("Solda görecek bir şey yok", true);
  }

  if (activeView === "main") {
    await showMainView(ctx);
  }
  if (activeView === "mylobby") {
    await showMyLobby(ctx);
  }

  await removeState(ctx);
});

pvpBoulingGame.action("Lobi oluştur", async (ctx) => {
  const { actionStatus } = ctx.session.state;

  if (actionStatus) return;
  await setState(ctx);

  ctx.session.state.createLobbyRoomSize = 2;

  await showCreateLobbyStep2(ctx);

  await removeState(ctx);
});

pvpBoulingGame.action("info", async (ctx) => {
  const { actionStatus } = ctx.session.state;

  if (actionStatus) return;
  await setState(ctx);

  await showStats(ctx);

  await removeState(ctx);
});

pvpBoulingGame.on("text", async (ctx) => {
  const msg = ctx.update.message.text;
  const { activeView, createLobbyStep, activeBoard } = ctx.session.state;

  if (activeView === "createlobby" && createLobbyStep === 2) {
    ctx.session.state.createLobbyRate = msg;
    return await showCreateLobbyStep3(ctx);
  }

  if (msg === "🏡 Ana Menüye Dön") {
    try {
      await ctx.deleteMessage(activeBoard.message_id);
    } catch (error) {}
    await ctx.scene.enter("showMainMenu");
  }
});

pvpBoulingGame.action("Lobiye katıl", async (ctx) => {
  const { actionStatus } = ctx.session.state;

  if (actionStatus) return;
  await setState(ctx);

  await joinToLobby(ctx);

  await removeState(ctx);
});

pvpBoulingGame.action("Lobiden çık", async (ctx) => {
  const { actionStatus } = ctx.session.state;

  if (actionStatus) return;
  await setState(ctx);

  await deleteLobby(ctx);

  await removeState(ctx);
});

pvpBoulingGame.action("🔄 Güncelle", async (ctx) => {
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

pvpBoulingGame.action("Geri", async (ctx) => {
  const { activeView, createLobbyStep, actionStatus } = ctx.session.state;

  if (actionStatus) return;
  await setState(ctx);

  if (activeView === "createlobby" && createLobbyStep === 2) {
    ctx.session.state.boardCountPage = 1;
    await showMyLobby(ctx);
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

pvpBoulingGame.action(/./, async (ctx) => {
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

  if (Boolean(+process.env.DEV)) {
    ctx.session.state.photoMessage = await bot.telegram.sendPhoto(
      ctx.from.id,
      "AgACAgIAAxkBAAIJMGC94R1zzGZWCZcXhzdc_mY-c4S1AALgsTEbA3jxSRK4cSd9GpiM7DYFpC4AAwEAAwIAA3MAA2MQAgABHwQ"
    );
  } else {
    ctx.session.state.photoMessage = await bot.telegram.sendPhoto(
      ctx.from.id,
      "AgACAgIAAxkBAAII-GC94Paumo_BrCfVR8d5Qk0zmXwKAAIrszEb7ozwSTraTYhjH84jvbsGpC4AAwEAAwIAA3MAA28UAgABHwQ"
    );
  }

  if (pvpGames.length === 0) {
    const newActiveBoard = await ctx.reply(
      `Şu anda rakip yok.
Lobinizi oluşturabilirsiniz: "Lobilerim" --> "Lobi oluştur"

Bakiyen: ${user[typeBalance]} TL`,
      Extra.markup((m) =>
        m.inlineKeyboard([
          [
            m.callbackButton("Lobilerim", "Lobilerim"),
            m.callbackButton("🔄 Güncelle", "🔄 Güncelle"),
            m.callbackButton("info", "info"),
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
    `Oyuna katılmak için bir lobi seçin.
Kendi lobinizi oluşturun:
Benim Lobim ---> Lobi kur

Bakiyeniz: ${user[typeBalance]} TL

Sayfa: ${boardCountPage}/${boardMaxPages}`,
    Extra.markup((m) =>
      m.inlineKeyboard([
        ...boardGames[boardCountPage - 1].map((cols) =>
          cols.map((game) =>
            m.callbackButton(
              `Lobby #${game.lobbyId} ➖ ${game.prize} TL  👤 [${game.rivals.length}/${game.size}]`,
              `lobby_id:${game.lobbyId}`
            )
          )
        ),
        [
          m.callbackButton("<", "<"),
          m.callbackButton("🔄 Güncelle", "🔄 Güncelle"),
          m.callbackButton(">", ">"),
        ],
        [
          m.callbackButton("Lobilerim", "Lobilerim"),
          m.callbackButton("info", "info"),
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

  if (Boolean(+process.env.DEV)) {
    ctx.session.state.photoMessage = await bot.telegram.sendPhoto(
      ctx.from.id,
      "AgACAgIAAxkBAAIJMGC94R1zzGZWCZcXhzdc_mY-c4S1AALgsTEbA3jxSRK4cSd9GpiM7DYFpC4AAwEAAwIAA3MAA2MQAgABHwQ"
    );
  } else {
    ctx.session.state.photoMessage = await bot.telegram.sendPhoto(
      ctx.from.id,
      "AgACAgIAAxkBAAII-GC94Paumo_BrCfVR8d5Qk0zmXwKAAIrszEb7ozwSTraTYhjH84jvbsGpC4AAwEAAwIAA3MAA28UAgABHwQ"
    );
  }

  if (pvpGames.length === 0) {
    const newActiveBoard = await ctx.reply(
      "Herhangi bir lobiye girmediniz. Kendi lobinizi mi oluşturmak istiyorsunuz?",
      Extra.markup((m) =>
        m.inlineKeyboard([
          [m.callbackButton("Lobi oluştur", "Lobi oluştur")],
          [m.callbackButton("Geri", "Geri")],
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
      ? [[m.callbackButton("Geri", "Geri")]]
      : [
          [m.callbackButton("Lobi oluştur", "Lobi oluştur")],
          [m.callbackButton("Geri", "Geri")],
        ];

  const newActiveBoard = await ctx.reply(
    `Lobiden çıkış yapabilirsiniz: Lobiye girin --> ‘Lobiden çık’ ${
      userGames.length === 10 ? "\n10 adetten fazla lobi oluşturamazsınız." : ""
    }

Sayfa: ${boardCountPage}/${boardMaxPages}`,
    Extra.markup((m) =>
      m.inlineKeyboard([
        ...boardGames[boardCountPage - 1].map((cols) =>
          cols.map((game) => {
            return m.callbackButton(
              `Lobby #${game.lobbyId} ➖ ${game.prize} TL  👤 [${game.rivals.length}/${game.size}]`,
              `lobby_id:${game.lobbyId}`
            );
          })
        ),
        [
          m.callbackButton("<", "<"),
          m.callbackButton("🔄 Güncelle", "🔄 Güncelle"),
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

  // const { pvpPercent } = await MainStats.findOne();
  // const lobbyPrize = lobby.prize * lobby.size * (1 - pvpPercent / 100);

  try {
    await ctx.deleteMessage(activeBoard.message_id);
  } catch (error) {}

  if (lobby.statusGame === "waiting") {
    const newActiveBoard = await ctx.reply(
      `Lobi henüz dolmadı. Lütfen diğer oyuncuları bekleyin. Lobi toplanır toplanmaz, bot otomatik olarak bir atış yapacak ve size sonucu gösterecektir.

Bahis: ${lobby.prize} TL

👤 Rakipler:
${[...lobby.rivals, ...new Array(lobby.size - lobby.rivals.length)]
  .map((item, i) => {
    if (!item) return `${i + 1}. Bekleniyor..`;
    return `${i + 1}. ${lobby.rivalsLinks[item]}`;
  })
  .join("\n")}`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Lobiden çık",
                callback_data: "Lobiden çık",
              },
            ],
            [
              {
                text: "Geri",
                callback_data: "Geri",
              },
            ],
          ],
        },
      }
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

  const allUsers = await User.find({ "pvpBouling.count": { $gte: 1 } })
    .sort({ "pvpBouling.winCash": -1 })
    .limit(10);

  const user = await User.findOne({ userId: ctx.from.id });
  const latestGames = await PvpGame.find({
    rivals: ctx.from.id,
    statusGame: "completed",
  })
    .sort({ _id: -1 })
    .limit(10);

  ctx.session.state.activeBoard = await ctx.reply(
    `Var olan bir lobiye katılabilir ya da kendi lobinizi oluşturup diğer oyuncular ile oynayabilirsiniz. Lobi dolduğunda size bir bildirim gelir ve oyun otomatik olarak başlar.

Her oyuncu 3 kez zar atar, toplamda en büyük zarı atan kazanır. Beraberlik durumunda ekstra raunt oynanır.

Sıralamadaki yeriniz: №${user.pvpBouling.rating}
Oynadın ${user.pvpBouling.count} toplamda ${user.pvpBouling.playCash} TL
Genel kazancınız: ${user.pvpBouling.winCash} TL

En iyi 10 oyuncu:
${allUsers
  .map(
    (item, i) =>
      `${i + 1}. ${
        item.userName
          ? "@" + item.userName
          : `<a href="tg://user?id=${item.userId}">@${item.userId}</a>`
      }`
  )
  .join("\n")}

En son oyunlarınız:
${latestGames
  .map((item) => {
    const status = item.winner === ctx.from.id ? "🟢" : "🔴";
    return `${status} 👤 ${item.rivals.length} 💰 ${
      item.prize * item.rivals.length
    } TL  🎳 ${item.reversedResults[ctx.from.id].join(" 🎳 ")}`;
  })
  .join("\n")}`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Geri",
              callback_data: "Geri",
            },
          ],
        ],
      },
    }
  );
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
    `Adım 2/2 Lütfen sohbete bahis tutarını girin.
Bu miktar hesabınızda kesilecektir.
    
Bakiyeniz: ${user[typeBalance]} TL`,
    Extra.markup((m) => m.inlineKeyboard([m.callbackButton("Geri", "Geri")]))
  );

  ctx.session.state.activeBoard = newActiveBoard;
}

async function showCreateLobbyStep3(ctx) {
  const { typeBalance, activeBoard, createLobbyRate } = ctx.session.state;

  if (!isNumber(createLobbyRate)) {
    return await ctx.reply("Lütfen sadece pozitif sayılar girin.");
  }

  const { minGameRate } = await MainStats.findOne();

  if (createLobbyRate < minGameRate) {
    return await ctx.reply(
      `Oynayabileceğiniz minimum bet tutarı: ${minGameRate} TL`
    );
  }

  const user = await User.findOne({ userId: ctx.from.id });

  if (user[typeBalance] - createLobbyRate < 0) {
    return await ctx.reply(
      "Belirli bir oranla lobi oluşturmak için yeterli bakiyeniz yok."
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

  // const { pvpPercent } = await MainStats.findOne();
  // const lobbyPrize = lobby.prize * lobby.size * (1 - pvpPercent / 100);

  if (user[typeBalance] < lobby.prize) {
    return await ctx.answerCbQuery(
      "Bir lobi seçmek için yeterli bakineyiz yok.",
      true
    );
  }

  try {
    await ctx.deleteMessage(activeBoard.message_id);
  } catch (error) {}

  const newActiveBoard = await ctx.reply(
    `Lobi başarılı bir şekilde seçildi.

Bahis: ${lobby.prize} TL
    
Rakipler:
${[...lobby.rivals, ...new Array(lobby.size - lobby.rivals.length)]
  .map((item, i) => {
    if (!item) return `${i + 1}. Bekleniyor..`;
    return `${i + 1}. ${lobby.rivalsLinks[item]}`;
  })
  .join("\n")}
`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Lobiye katıl",
              callback_data: "Lobiye katıl",
            },
          ],
          [
            {
              text: "Geri",
              callback_data: "Geri",
            },
          ],
        ],
      },
    }
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
  lobby.rivalsLinks[ctx.from.id] = ctx.from.username
    ? `@${ctx.from.username}`
    : `<a href="tg://user?id=${ctx.from.id}">@${ctx.from.id}</a>`;

  await PvpGame.updateOne(
    { lobbyId },
    {
      rivals: lobby.rivals,
      rivalsLinks: {
        ...lobby.rivalsLinks,
        [ctx.from.id]: ctx.from.username
          ? `@${ctx.from.username}`
          : `<a href="tg://user?id=${ctx.from.id}">@${ctx.from.id}</a>`,
      },
    }
  );

  const user = await User.findOne({ userId: ctx.from.id });
  await User.updateOne(
    { userId: ctx.from.id },
    { [typeBalance]: +(user[typeBalance] - lobby.prize).toFixed(2) }
  ).catch((err) => {
    console.log(err.message, "pvpBouling");
  });

  await ctx.reply(`Lobiye başarılı bir şekilde giriş yaptınız. 
Bakiyenizden çekilen tutar: ${lobby.prize} TL`);

  // Если вступил последний игрок - ЗАПУСКАЕМ ИГРУ
  checkLastPlayer(lobby, ctx);
}

async function checkLastPlayer(lobby, ctx) {
  if (lobby.rivals.length !== lobby.size) {
    return await showMainView(ctx);
  }

  lobby.rivals.map((userId) =>
    bot.telegram.sendMessage(userId, `${lobby.lobbyId} no’lu lobi toplandı.`, {
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
        pvpGames.dice.countCash + lobby.prize
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
          `Şimdi atmak bir oyuncu yapar: ${lobby.rivalsLinks[userId]}`,
          { parse_mode: "HTML", disable_notification: true }
        );
      } else {
        await bot.telegram.sendMessage(uid, `Şimdi atışın`, {
          disable_notification: true,
        });
      }
    }

    const dice1 = await bot.telegram.sendDice(userId, {
      emoji: "🎳",
      disable_notification: true,
    });
    const dice2 = await bot.telegram.sendDice(userId, {
      emoji: "🎳",
      disable_notification: true,
    });
    const dice3 = await bot.telegram.sendDice(userId, {
      emoji: "🎳",
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

    const value1 = dice1.dice.value === 2 ? 1 : dice1.dice.value;
    const value2 = dice2.dice.value === 2 ? 1 : dice2.dice.value;
    const value3 = dice3.dice.value === 2 ? 1 : dice3.dice.value;

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
      `Lobi sonucu #${lobby.lobbyId}

${
  userId === winner
    ? `Kazandınız!
Kazanılan oyunlar: ${lobbyPrize.toFixed(2)} TL`
    : `Kazandı ${winner === 0 ? "drow" : `${lobby.rivalsLinks[winner]}`}
Kazanç: ${lobbyPrize.toFixed(2)} TL`
}
   
${lobby.rivals
  .map(
    (item, i) =>
      `${i + 1}. 👤 ${lobby.rivalsLinks[item]} ➖ 🎳 ${reversedResults[
        item
      ].join(" 🎳 ")}`
  )
  .join("\n")}`,
      {
        parse_mode: "HTML",
      }
    )
  );

  if (winner === 0) {
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

    // Обновляем статистику игроков
    for (let i = 0; i < lobby.rivals.length; i++) {
      const { pvpBouling } = await User.findOne({ userId: lobby.rivals[i] });
      await User.updateOne(
        { userId: lobby.rivals[i] },
        {
          pvpBouling: {
            ...pvpBouling,
            count: pvpBouling.count + 1,
            playCash: +(pvpBouling.playCash + lobby.prize).toFixed(2),
          },
        }
      );
    }

    return await showMainView(ctx);
  }

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
  const { mainBalance, pvpBouling } = await User.findOne({ userId: winner });
  await User.updateOne(
    { userId: winner },
    {
      mainBalance: +(mainBalance + lobbyPrize).toFixed(2),
      pvpBouling: {
        ...pvpBouling,
        winCount: pvpBouling.winCount + 1,
        winCash: +(pvpBouling.winCash + lobbyPrize).toFixed(2),
      },
    }
  ).catch((err) => {
    console.log(err.message, "pvpBouling");
  });

  // Обновляем статистику игроков
  for (let i = 0; i < lobby.rivals.length; i++) {
    const { pvpBouling } = await User.findOne({ userId: lobby.rivals[i] });
    await User.updateOne(
      { userId: lobby.rivals[i] },
      {
        pvpBouling: {
          ...pvpBouling,
          count: pvpBouling.count + 1,
          playCash: +(pvpBouling.playCash + lobby.prize).toFixed(2),
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

  // ВОЗВРАТ
  if (round === 3) {
    for (let userId of lobby.rivals) {
      await bot.telegram.sendMessage(
        userId,
        `Beraberlik! Bahis tutarınız hesabınıza geri aktarılıyor.`
      );

      const { mainBalance } = await User.findOne({ userId });

      await User.updateOne(
        { userId },
        { mainBalance: +(mainBalance + lobby.prize).toFixed(2) }
      ).catch((err) => {
        console.log(err.message, "pvpBouling");
      });
    }

    return { resLobby: lobby, winner: 0 };
  }

  // Если несколько победителей
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
    lobby.rivals.map((userId) =>
      bot.telegram.sendMessage(
        userId,
        `Lobi #${lobby.lobbyId} ➖ ${round} yuvarlak

Oyna:
${players2round
  .map(
    (item, i) =>
      `${i + 1}. 👤 ${
        lobby.rivalsLinks[item.userId]
      } ➖ 🎳⚽️ ${reversedResults[item.userId].join(" 🎳 ")}`
  )
  .join("\n")}`,
        { parse_mode: "HTML", disable_notification: true }
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
            `Şimdi atmak bir oyuncu yapar: ${lobby.rivalsLinks[userId]}`,
            { parse_mode: "HTML", disable_notification: true }
          );
        } else {
          await bot.telegram.sendMessage(uid, `Şimdi atışın`, {
            disable_notification: true,
          });
        }
      }

      const diceMsg1 = await bot.telegram.sendDice(userId, {
        emoji: "🎳",
        disable_notification: true,
      });
      const diceMsg2 = await bot.telegram.sendDice(userId, {
        emoji: "🎳",
        disable_notification: true,
      });
      const diceMsg3 = await bot.telegram.sendDice(userId, {
        emoji: "🎳",
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

      const value1 = diceMsg1.dice.value === 2 ? 1 : diceMsg1.dice.value;
      const value2 = diceMsg2.dice.value === 2 ? 1 : diceMsg2.dice.value;
      const value3 = diceMsg3.dice.value === 2 ? 1 : diceMsg3.dice.value;

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

    return await playing2round(lobby, sortedPlayers, round++);
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
    rivalsLinks: {
      [ctx.from.id]: ctx.from.username
        ? `@${ctx.from.username}`
        : `<a href="tg://user?id=${ctx.from.id}">@${ctx.from.id}</a>`,
    },
    creator: ctx.from.id,
  });
  await pvpGame.save();

  // UPDATE USER BALANCE
  const user = await User.findOne({ userId: ctx.from.id });
  await User.updateOne(
    { userId: ctx.from.id },
    { [typeBalance]: +(user[typeBalance] - createLobbyRate).toFixed(2) }
  ).catch((err) => {
    console.log(err.message, "pvpBouling");
  });

  await ctx.reply(`Lobi başarılı bir şekilde oluşturuldu.

Tutar bakiyenizden çekildi: ${createLobbyRate} TL`);

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
  ).catch((err) => {
    console.log(err.message, "pvpBouling");
  });

  await ctx.reply(`Lobiden başarılı bir şekilde çıktınız.
Kesilen tutarın iadesi: ${lobby.prize} TL
Bakiyeniz: ${(user[typeBalance] + lobby.prize).toFixed(2)} TL`);

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

module.exports = { pvpBoulingGame };
