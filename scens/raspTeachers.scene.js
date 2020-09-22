const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const getRasp = require("../helpers/getRasp");

const User = require("../models/user");
const Teachers = require("../models/teachers");

// *************************** STEP 1 *******************************************
const raspTeachers = new Scene("raspTeachers");
raspTeachers.enter((ctx) => {
  return ctx.reply(
    "Пожалуйста, введите фамилию преподавателя.",
    Extra.markup(
      Markup.keyboard([
        ["↪️ Вернуться назад"],
        // Сделать закладки.. в бд сохраняем 5 последних поиска (препод, группа)
      ]).resize()
    )
  );
});

raspTeachers.hears(/./, async (ctx) => {
  if (ctx.update.message.text === "↪️ Вернуться назад") {
    return await ctx.scene.enter("showSettingsMenu");
  }

  const status = await Teachers.findOne({
    teacher: ctx.update.message.text,
  });

  // Проверяем, выбрал ли юзер преподавателя из ctx.session
  if (status) {
    await User.updateOne(
      { userId: ctx.from.id },
      { otherTeacher: status.teacher }
    );
    ctx.reply(`Вы выбрали: ${status.teacher}`);
    return await ctx.scene.enter("setupDay");
  }

  // Ищем преподавателя, сохраняем в сессию
  const message = ctx.update.message.text.replace(/\s/g, "");
  const statusId = await Teachers.find({
    lastName: message[0].toUpperCase() + message.slice(1),
  });
  if (statusId.length !== 0) {
    return await ctx.reply(
      "Выберите преподавателя из списка",
      Extra.markup(
        Markup.keyboard([statusId.map((item) => item.teacher)]).resize()
      )
    );
  } else {
    await ctx.reply("Такой фамилии нету. Попробуйте еще раз.");
  }
});

//

//

//

//
const setupDay = new Scene("setupDay");
setupDay.enter((ctx) => {
  return ctx.reply(
    "Выберите день",
    Extra.markup(
      Markup.keyboard([
        ["Сегодня", "Завтра", "Неделя"],
        ["🏡 Вернуться на главную"],
      ]).resize()
    )
  );
});

setupDay.hears("Сегодня", async (ctx) => {
  await getRasp(ctx, 8);
});
setupDay.hears("Завтра", async (ctx) => {
  await getRasp(ctx, 9);
});
setupDay.hears("Неделя", async (ctx) => {
  await ctx.scene.enter("weekMenu");
});

setupDay.hears(/./, async (ctx) => {
  if (ctx.update.message.text === "🏡 Вернуться на главную") {
    await User.updateOne({ userId: ctx.from.id }, {$unset: {otherTeacher: 1 }});
    return await ctx.scene.enter("showMainMenu");
  }
  await ctx.reply('Пожалуйста, выберите действие.')
});

//

//
module.exports = { raspTeachers, setupDay };
