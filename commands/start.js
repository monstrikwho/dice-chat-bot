const setupScenes = require("../scens/setupScenes");
const moment = require("moment");
const User = require("../models/user");
const MainStats = require("../models/mainStats");

function setupStart(bot) {
  // Setup scens
  setupScenes(bot);

  // Start command
  bot.start(async (ctx) => {
    if (+ctx.chat.id < 0) return; // Откидываем возможность запуска бота в пабликах

    try {
      const startPayload = ctx.startPayload;

      let isRef = 1; // id or 1
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
        if (payloadType === "ref") {
          const refUserId = startPayload.replace("ref", "");
          try {
            const status = await User.findOne({ userId: refUserId });
            if (status) {
              isRef = refUserId;
              bouns = 10000;
            }
            await MainStats.updateOne(
              {},
              { $inc: { "usersStats.countRefUsers": 1 } }
            );
          } catch (error) {}
        }

        // Записываем статистику рекламы
        if (payloadType === "ads") {
          const { ads } = await MainStats.findOne({});
          const adsName = startPayload.replace("ads", "");
          if (ads[adsName]) {
            await MainStats.updateOne(
              {},
              {
                ads: {
                  ...ads,
                  [adsName]: ads[adsName] + 1,
                },
              }
            );
          } else {
            await MainStats.updateOne({}, { ads: { ...ads, [adsName]: 1 } });
          }
        }
      }

      const selectUser = await User.findOne({ userId: ctx.from.id });
      if (!selectUser) {
        try {
          const user = new User({
            userId: ctx.from.id,
            demoBalance: 2000 + bouns,
            mainBalance: 0,
            isBlocked: false,
            isRef,
            regDate: moment().format("YYYY-MM-DD"),
          });
          await user.save();
          
          await MainStats.updateOne(
            {},
            { $inc: { "usersStats.countUsers": 1 } }
          );
        } catch (error) {
          console.log(error.message);
        }
      } else {
        await User.findOne({ userId: ctx.from.id }, { isBlocked: false });
        return await ctx.scene.enter("showMainMenu");
      }

      await ctx.reply(`Добро пожаловать в бот честных онлайн игр!
Здесь удача зависит только от вас!🌈

Вы сами отправляете нам игровой стикер от телеграмм, а мы считываем его результат и платим Вам деньги! 💸

Попробуйте БЕСПЛАТНО на демо-счете. Приятной игры!🎉`);
      return await ctx.scene.enter("showMainMenu");
    } catch (err) {
      console.log("Не удалось пройти регистрацию", err.message);
    }
  });
}

// Exports
module.exports = setupStart;
