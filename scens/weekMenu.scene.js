const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");

const getRasp = require("../helpers/getRasp");
const checkRasp = require("../helpers/checkRasp");

// *************************** STEP 1 *******************************************
const weekMenu = new Scene("weekMenu");
weekMenu.enter(async (ctx) => {
  const today = new Date().getDay();

  let statusRasp = false;
  if (today === 3) statusRasp = await checkRasp();

  if (statusRasp || today > 4 || today === 5) {
    return await ctx.reply(
      "Выберите на какую неделю вы хотите получить расписание",
      Extra.markup(
        Markup.keyboard([
          ["На текущую", "На следующую"],
          ["↪️ Вернуться назад"],
        ]).resize()
      )
    );
  }

  if (today === 6 || today === 0) return await getRasp(ctx, 1);
  return await getRasp(ctx, 0);
});

weekMenu.hears("↪️ Вернуться назад", async (ctx) => {
  const user = await User.findOne({ userId: ctx.from.id });
  // Проверяем, искали ли мы преподавателя или другую группу
  if (user.otherTeacher || user.otherStudents) {
    return await ctx.scene.enter("setupDay");
  }
  await ctx.scene.enter("showMainMenu");
});
weekMenu.hears("На текущую", async (ctx) => {
  await getRasp(ctx, 0);
});
weekMenu.hears("На следующую", async (ctx) => {
  await getRasp(ctx, 1);
});

module.exports = { weekMenu };
