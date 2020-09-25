const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

// *************************** STEP 1 *******************************************
const showSettingsMenu = new Scene("showSettingsMenu");
showSettingsMenu.enter(async (ctx) => {
  return await ctx.reply(
    "Вы вошли в настройки",
    Extra.markup(
      Markup.keyboard([
        ["Расписание преподавателя", "Расписание др. группы"],
        // ["📢 Уведомления", "🔄 Сменить группу"],
        ["🔄 Сменить группу", "↪️ Вернуться назад"],
        // Сделать закладки.. в бд сохраняем 5 последних поиска (препод, группа)
      ]).resize()
    )
  );
});

showSettingsMenu.hears("Расписание преподавателя", async (ctx) => {
  await ctx.scene.enter("raspTeachers");
});
showSettingsMenu.hears("Расписание др. группы", async (ctx) => {
  await ctx.scene.enter("raspStudents");
});
showSettingsMenu.hears("🔄 Сменить группу", async (ctx) => {
  ctx.session.state = { person: "Студент" };
  await ctx.scene.enter("step2");
});
showSettingsMenu.hears("↪️ Вернуться назад", async (ctx) => {
  await ctx.scene.enter("showMainMenu");
});

module.exports = { showSettingsMenu };
