const setupScenes = require("../scens/setupScenes");
const moment = require("moment");

const User = require("../models/user");
const MainStats = require("../models/mainstats");

async function setupStart(bot) {
  // Setup scens
  setupScenes(bot);
  const rateLimmiter = {};

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
    await bot.telegram.sendMessage(
      isRef,
      `Bir kullanıcı, davet linkinizi kullanarak kaydoldu.
${bonusRefFather} TL DEMO hesabınıza yatırıldı`
    );
  }

  async function updateUser(ctx, user) {
    await User.updateOne(
      { userId: ctx.from.id },
      {
        isBlocked: false,
        btnStart: true,
        userName: ctx.from.username ? ctx.from.username.toLowerCase() : "",
      }
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
    const user = new User({
      userId: ctx.from.id,
      userName: ctx.from.username ? ctx.from.username.toLowerCase() : "",
      demoBalance: startDemoBalance + bonus,
      mainBalance: 0,
      userRights: "user",
      isRef,
      refCash: 0,
      countRef: 0,
      isBlocked: false,
      btnStart: true,
      pvpDice: {
        rating: "Hiç bir oyun oynamadınız",
        count: 0,
        winCount: 0,
        playCash: 0,
        winCash: 0,
      },
      pvpFootball: {
        rating: "Hiç bir oyun oynamadınız",
        count: 0,
        winCount: 0,
        playCash: 0,
        winCash: 0,
      },
      pvpBouling: {
        rating: "Hiç bir oyun oynamadınız",
        count: 0,
        winCount: 0,
        playCash: 0,
        winCash: 0,
      },
      getBonus: false,
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

  try {
    // Start command
    bot.start(async (ctx) => {
      const userId = ctx.from.id;

      // Откидываем возможность запуска бота в пабликах
      if (+ctx.chat.id < 0) return;

      // ******************* RATE LIMITER *******************
      if (!rateLimmiter[userId]) {
        rateLimmiter[userId] = {};
      }

      const now = Math.floor(Date.now() / 1000);

      if (!rateLimmiter[userId][now]) {
        rateLimmiter[userId] = {};
        rateLimmiter[userId][now] = 0;
      }

      rateLimmiter[userId][now]++;

      if (rateLimmiter[userId][now] > 2) return;
      // ******************* RATE LIMITER *******************

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

      // Если это реферальная ссылка
      if (payloadType === "ref") {
        try {
          const refUserId = startPayload.replace("ref", "");
          if (+refUserId === ctx.from.id) return;
          const status = await User.findOne({ userId: refUserId });
          if (status) {
            isRef = refUserId;
            bonus = bonusRefDaughter;
            updateRefUsers(isRef, bonusRefFather);
          }
        } catch (error) {}
      }

      // Сохраняем статистику рекламыы
      if (payloadType === "ads") {
        try {
          const { ads } = await MainStats.findOne({});
          const adsName = startPayload.replace("ads-", "");
          // Save ads stats
          saveAdsStats(ads, adsName);
        } catch (error) {}
      }

      const selectUser = await User.findOne({ userId: ctx.from.id });

      if (selectUser && selectUser.userRights === "moder") {
        return await ctx.scene.enter("moderMenu");
      }

      // Если юзер есть в базе
      if (selectUser) {
        if (!selectUser.getBonus) {
          await ctx.reply(
            `Demo hesabında 1000 TL hediye para ile oynamaya başlamak için kanalımıza ve sohbet sayfamıza katılın.

<a href="https://t.me/zar_sohbet">💬 Sohbet sayfamız</a>
<a href="https://t.me/zar_kanal">📬 Kanalımız</a>`,
            {
              parse_mode: "HTML",
              disable_web_page_preview: true,
            }
          );
        }
        updateUser(ctx, selectUser);
      }

      // Если юзера нету в базе
      if (!selectUser) {
        saveUser(ctx, startDemoBalance, bonus, isRef, constRef);

        await ctx.reply(`Hilesiz Telegram oyununa hoş geldiniz!
Burada şans sadece size bağlı!
Eğlenceli Telegram çıkartmalarıyla para kazanın! 
Demo hesabında ÜCRETSİZ olarak deneyin. İyi oyunlar!`);

        await ctx.reply(
          `Demo hesabında 1000 TL hediye para ile oynamaya başlamak için kanalımıza ve sohbet sayfamıza katılın.
    
<a href="https://t.me/zar_sohbet">💬 Sohbet sayfamız</a>
<a href="https://t.me/zar_kanal">📬 Kanalımız</a>`,
          {
            parse_mode: "HTML",
            disable_web_page_preview: true,
          }
        );

        if (isRef !== constRef && bonusRefDaughter > 0) {
          await ctx.reply(`Davet linkini kullanarak kayıt oldunuz.
DEMO hesabındaki bonusunuz: +${bonusRefDaughter} TL`);
        }
      }

      return await ctx.scene.enter("showMainMenu");
    });
  } catch (error) {}
}

module.exports = setupStart;
