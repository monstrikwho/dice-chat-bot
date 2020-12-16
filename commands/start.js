const setupScenes = require("../scens/setupScenes");
const moment = require("moment");
const User = require("../models/user");
const Setting = require("../models/setting");

function setupStart(bot) {
  // Setup scens
  setupScenes(bot);

  // Start command
  bot.start(async (ctx) => {
    if (+ctx.chat.id < 0) return;
    try {
      // Сохраняем статистику рекламы
      const startPayload = ctx.startPayload;
      if (startPayload.length > 0) {
        const { payload } = await Setting.findOne({});
        if (payload[startPayload]) {
          await Setting.updateOne(
            {},
            {
              payload: {
                ...payload,
                [startPayload]: payload[startPayload] + 1,
              },
            }
          );
        } else {
          await Setting.updateOne(
            {},
            { payload: { ...payload, [startPayload]: 1 } }
          );
        }
      }

      const selectUser = await User.findOne({ userId: ctx.from.id });
      if (!selectUser) {
        try {
          const user = new User({
            userId: ctx.from.id,
            demoBalance: 1000,
            mainBalance: 0,
            regDate: moment().format("DD, MM, YYYY, hh:mm:ss"),
            userName: ctx.from.username,
            isBlocked: false,
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
