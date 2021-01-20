const setupScenes = require("../scens/setupScenes");

const moment = require("moment");

const User = require("../models/user");
const MainStats = require("../models/mainStats");
const DayStats = require("../models/dayStats");

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

            await DayStats.updateOne(
              { date: moment().format("YYYY-MM-DD") },
              { $inc: { "users.refUsers": 1 } }
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
                  $inc: {
                    [adsName]: 1,
                  },
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
            amountRefCash: 0,
            regDate: moment().format("YYYY-MM-DD"),
          });
          await user.save();

          // Send stats
          await axios
            .post("https://dice-bots.ru/api/post_stats", {
              type: "users",
            })
            .then((res) => console.log(res))
            .catch((e) => console.log(e));
        } catch (error) {}
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

module.exports = setupStart;
