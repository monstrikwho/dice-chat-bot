const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");

const getRasp = require("../helpers/getRasp");

// *************************** STEP 1 *******************************************
const weekMenu = new Scene("weekMenu");
weekMenu.enter(async (ctx) => {
  const today = new Date().getDay();
  if(today > 3 || today === 0) {
    return await ctx.reply(
      "Выберите день недели",
      Extra.markup(
        Markup.keyboard([
          ["На текущую", "На следующую"],
          ["↪️ Вернуться назад"],
        ]).resize()
      )
    );
  } else {
    return await getRasp(ctx, 0)
  }
});

weekMenu.hears("↪️ Вернуться назад", async (ctx) => {
  const user = await User.findOne({ userId: ctx.from.id });
  // Проверяем, искали ли мы преподавателя или другую группу
  if(user.otherTeacher || user.otherStudents) {
    return await ctx.scene.enter('setupDay')
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
