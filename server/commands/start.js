const setupScenes = require("../scens/setupScenes");
const moment = require("moment");
const User = require("../models/user");
const MainStats = require("../models/mainstats");

function setupStart(bot) {
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

  // Start command
  bot.start(async (ctx) => {
    // Откидываем возможность запуска бота в пабликах
    if (+ctx.chat.id < 0) return;

    const startPayload = ctx.startPayload;

    const { constRef } = await MainStats.findOne({});

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
        const refUserId = startPayload.replace("ref", "");
        const status = await User.findOne({ userId: refUserId });
        if (status) {
          isRef = refUserId;
          bouns = 10000;
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

    try {
      const selectUser = await User.findOne({ userId: ctx.from.id });
      if (!selectUser) {
        const user = new User({
          userId: ctx.from.id,
          demoBalance: 2000 + bouns,
          mainBalance: 0,
          isBlocked: false,
          regDate: moment().format("YYYY-MM-DD"),
          userRights: "user",
          isRef,
          refCash: 0,
          countRef: 0,
        });
        await user.save();
        await User.updateOne({ userId: isRef }, { $inc: { countRef: 1 } });
        await bot.telegram.sendMessage(
          isRef,
          "По вашей реферальной ссылке зарегистрировался пользователь."
        );
      } else {
        await User.findOne({ userId: ctx.from.id }, { isBlocked: false });
        return await ctx.scene.enter("showMainMenu");
      }

      await ctx.reply(`Добро пожаловать в бот честных онлайн игр!
Здесь удача зависит только от вас!🌈

Вы сами отправляете нам игровой стикер от телеграмм, а мы считываем его результат и платим Вам деньги! 💸

Попробуйте БЕСПЛАТНО на демо-счете. Приятной игры!🎉`);

      if (isRef !== constRef) {
        await ctx.reply(`Вы зарегистрировались по пригласительной ссылке. 
Ваш бонус: +10к на ДЕМО счет.`);
      }

      return await ctx.scene.enter("showMainMenu");
    } catch (err) {
      console.log("Не удалось пройти регистрацию", err.message);
    }
  });
}

module.exports = setupStart;
