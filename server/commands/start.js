const moment = require("moment");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");
const MainStats = require("../models/mainstats");

async function saveAdsStats(ads, adsName) {
  if (ads[adsName]) {
    ads[adsName] = ads[adsName] + 1;
    await MainStats.updateOne({}, { ads });
  } else {
    await MainStats.updateOne({}, { ads: { ...ads, [adsName]: 1 } });
  }
}

async function updateRefUsers(isRef, bonusRefFather) {
  // Записываем рефералу счетчик +1 к рефералам
  await User.updateOne(
    { userId: isRef },
    { $inc: { countRef: 1, demoBalance: bonusRefFather } }
  );
  try {
    await bot.telegram.sendMessage(
      isRef,
      `По вашей реферальной ссылке зарегистрировался пользователь.
На Ваш ДЕМО-счет было зачислено ${bonusRefFather}P`
    );
  } catch (error) {}
}

async function updateUser(ctx, user) {
  await User.updateOne(
    { userId: ctx.from.id },
    { isBlocked: false, btnStart: true, userName: ctx.from.username }
  );
  await MainStats.updateOne(
    {},
    {
      $inc: {
        "usersStats.countUsersBlocked": user.isBlocked ? 1 : 0,
        "usersStats.countBtnStart": !user.btnStart ? 1 : 0,
      },
    }
  );
}

async function saveUser(ctx, startDemoBalance, bonus, isRef, constRef) {
  const pvpUsers = await User.find({ "pvp.count": { $gte: 1 } }).sort({
    "pvp.winCash": -1,
  });

  const user = new User({
    userId: ctx.from.id,
    userName: ctx.from.username,
    demoBalance: startDemoBalance + bonus,
    mainBalance: 0,
    userRights: "user",
    isRef,
    refCash: 0,
    countRef: 0,
    isBlocked: false,
    btnStart: true,
    pvp: {
      rating: pvpUsers.length + 1,
      count: 0,
      winCount: 0,
      playCash: 0,
      winCash: 0,
    },
    regDate: moment().format("YYYY-MM-DD"),
  });
  await user.save();
  await MainStats.updateOne(
    {},
    {
      $inc: {
        "usersStats.countUsers": 1,
        "usersStats.countBtnStart": 1,
        "usersStats.countRefUsers": isRef !== constRef ? 1 : 0,
      },
    }
  );
}

async function commandStart(ctx) {
  if (typeof ctx.startPayload === "undefined") {
    ctx.session.state = {};
    ctx.session.is_session = true;

    const selectUser = await User.findOne({ userId: ctx.from.id });
    if (selectUser.userRights === "moder") {
      ctx.session.state = {};
      return await showModerMenu(ctx);
    }

    return await showMainMenu(ctx);
  }

  // Откидываем возможность запуска бота в пабликах
  if (+ctx.chat.id < 0) return;

  const startPayload = ctx.startPayload;

  const { constRef, bonusRefDaughter, bonusRefFather, startDemoBalance } =
    await MainStats.findOne({});

  let isRef = constRef;
  let bonus = 0;

  // Определяем тип ссылки
  let payloadType =
    startPayload.indexOf("ref") !== -1
      ? "ref"
      : startPayload.indexOf("ads") !== -1
      ? "ads"
      : "other";

  // Если переход был по реф. ссылке
  if (payloadType !== "other") {
    // Если это реферальная ссылка
    if (payloadType === "ref") {
      const refUserId = startPayload.replace("ref", "");
      if (+refUserId === ctx.from.id) return;
      const status = await User.findOne({ userId: refUserId });
      if (status) {
        isRef = refUserId;
        bonus = bonusRefDaughter;
        updateRefUsers(isRef, bonusRefFather);
      }
    }

    // Сохраняем статистику рекламыы
    if (payloadType === "ads") {
      const { ads } = await MainStats.findOne({});
      const adsName = startPayload.replace("ads-", "");
      // Save ads stats
      saveAdsStats(ads, adsName);
    }
  }

  ctx.session.state = {};
  ctx.session.is_session = true;

  const selectUser = await User.findOne({ userId: ctx.from.id });

  if (!selectUser) {
    saveUser(ctx, startDemoBalance, bonus, isRef, constRef);
  } else {
    if (selectUser.userRights === "moder") {
      ctx.session.state = {};
      return await showModerMenu(ctx);
    }
    updateUser(ctx, selectUser);
    return await showMainMenu(ctx);
  }

  try {
    await ctx.reply(`Добро пожаловать в бот честных онлайн игр!
Здесь удача зависит только от вас!🌈

Вы сами отправляете нам игровой стикер от телеграмм, а мы считываем его результат и платим Вам деньги! 💸

Попробуйте БЕСПЛАТНО на демо-счете. Приятной игры!🎉`);

    if (isRef !== constRef) {
      await ctx.reply(`Вы зарегистрировались по пригласительной ссылке. 
Ваш бонус: +${bonusRefDaughter} на ДЕМО-счет.`);
    }
  } catch (error) {}

  await showMainMenu(ctx);
}

async function showMainMenu(ctx) {
  // if (!rules) {
  //   await ctx.reply(
  //     "Соглашение с правилами",
  //     Extra.markup(Markup.keyboard([["✅ Соглашаюсь"]]).resize())
  //   );
  // } else {
  try {
    await ctx.reply(
      "👋",
      Extra.markup(
        Markup.keyboard([
          ["👤 Соло", "👥 ПвП"],
          // ["👤 Соло", "👥 ПвП", "Спорт"],
          ["📱 Личный кабинет", "💬 Чат / Поддержка", "ℹ️ Инфо"],
        ]).resize()
      )
    );
  } catch (error) {}
}

async function showModerMenu(ctx) {
  try {
    await ctx.reply(
      "👋",
      Extra.markup(
        Markup.keyboard([
          ["Заявки банкир"],
          ["Создать промокод", "Создать фриспин"],
          ["Положить бота", "Сделать рассылку"],
        ]).resize()
      )
    );
  } catch (error) {}
}

const rateLimmiter = {};

async function setupStart(bot) {
  bot.start(async (ctx) => {
    const now = Math.floor(Date.now() / 1000);

    if (!rateLimmiter[now]) rateLimmiter[now] = 1;
    if (rateLimmiter[now]) rateLimmiter[now]++;
    if (rateLimmiter[now] > 10) return;

    await commandStart(ctx);
  });
}

module.exports = { setupStart, commandStart, showMainMenu };
