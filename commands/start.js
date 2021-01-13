const setupScenes = require("../scens/setupScenes");
const moment = require("moment");
const User = require("../models/user");
const Setting = require("../models/setting");

function setupStart(bot) {
  // Setup scens
  setupScenes(bot);

  // Start command
  bot.start(async (ctx) => {
    if (+ctx.chat.id < 0) return; // Откидываем возможность запуска бота в пабликах

    try {
      // Сохраняем статистику рекламы
      const startPayload = ctx.startPayload;

      let isRef = 1; // number or 1
      let isAds = null;
      let bouns = 0;

      let payloadType =
        startPayload.indexOf("ref") !== -1
          ? "ref"
          : startPayload.indexOf("ads") !== -1
          ? "ads"
          : "other";

      if (payloadType !== "other") {
        if (payloadType === "ref") {
          const refUserId = startPayload.replace("ref", "");
          try {
            const status = await User.findOne({ userId: refUserId });
            if (status) {
              isRef = refUserId;
              bouns = 10000;
            }
          } catch (error) {
            console.log(error.message);
          }
        }

        if (payloadType === "ads") {
          isAds = true;
        }
      }

      const selectUser = await User.findOne({ userId: ctx.from.id });
      if (!selectUser) {
        try {
          const user = new User({
            userId: ctx.from.id,
            userName: ctx.from.username,
            demoBalance: 2000 + bouns,
            mainBalance: 0,
            regDate: moment().format("DD, MM, YYYY, hh:mm:ss"),
            isBlocked: false,
            isRef,
          });
          await user.save();
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
