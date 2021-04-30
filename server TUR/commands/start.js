const setupScenes = require("../scens/setupScenes");
const moment = require("moment");

const User = require("../models/user");
const MainStats = require("../models/mainstats");
const Error = require("../models/errors");

async function setupStart(bot) {
  // Setup scens
  setupScenes(bot);

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

  async function saveUser(ctx, startDemoBalance, bouns, isRef, constRef) {
    const user = new User({
      userId: ctx.from.id,
      userName: ctx.from.username,
      demoBalance: startDemoBalance + bouns,
      mainBalance: 0,
      userRights: "user",
      isRef,
      refCash: 0,
      countRef: 0,
      isBlocked: false,
      btnStart: true,
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
      // Откидываем возможность запуска бота в пабликах
      if (+ctx.chat.id < 0) return;

      const startPayload = ctx.startPayload;

      const {
        constRef,
        bonusRefDaughter,
        bonusRefFather,
        startDemoBalance,
      } = await MainStats.findOne({});

      let isRef = constRef;
      let bouns = 0;

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
          try {
            const refUserId = startPayload.replace("ref", "");
            if (+refUserId === ctx.from.id) return;
            const status = await User.findOne({ userId: refUserId });
            if (status) {
              isRef = refUserId;
              bouns = bonusRefDaughter;
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
      }

      try {
        const selectUser = await User.findOne({ userId: ctx.from.id });

        if (!selectUser) {
          saveUser(ctx, startDemoBalance, bouns, isRef, constRef);
        } else {
          updateUser(ctx, selectUser);
          return await ctx.scene.enter("showMainMenu");
        }

        await ctx.reply(`Hilesiz Telegram oyununa hoş geldiniz!
Burada şans sadece size bağlı!
Eğlenceli Telegram çıkartmalarıyla para kazanın! 
Demo hesabında ÜCRETSİZ olarak deneyin. İyi oyunlar!`);

        if (isRef !== constRef) {
          await ctx.reply(`Davet linkini kullanarak kayıt oldunuz.
DEMO hesabındaki bonusunuz: +${bonusRefDaughter} TL`);
        }

        return await ctx.scene.enter("showMainMenu");
      } catch (error) {}
    });
  } catch (error) {}
}

module.exports = setupStart;
