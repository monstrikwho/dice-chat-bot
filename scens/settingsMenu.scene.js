const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

// *************************** STEP 1 *******************************************
const showSettingsMenu = new Scene("showSettingsMenu");
showSettingsMenu.enter((ctx) => {
  return ctx.reply(
    "Вы вошли в настройки",
    Extra.markup(
      Markup.keyboard([
        ["Расписание преподавателя", "Расписание др. группы"],
        ["📢 Уведомления", "🔄 Сменить группу"],
        ["↪️ Вернуться назад"],
        // Сделать закладки.. в бд сохраняем 5 последних поиска (препод, группа)
      ]).resize()
    )
  );
});

showSettingsMenu.hears("Расписание преподавателя", (ctx) => {
  ctx.scene.enter("raspTeachers");
});
showSettingsMenu.hears("Расписание др. группы", (ctx) => {
  ctx.scene.enter("raspStudents");
});
showSettingsMenu.hears("↪️ Вернуться назад", (ctx) => {
  ctx.scene.enter("showMainMenu");
});

module.exports = { showSettingsMenu };
