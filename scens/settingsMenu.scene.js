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
        ["🔄 Сменить группу", "📷 Присылать фото"],
        ["📢 Уведомления", "🚍 Выбрать автобусы"],
        ["↪️ Вернуться назад"],
      ])
      .resize()
    )
  );
});

showSettingsMenu.hears('↪️ Вернуться назад', (ctx) => {
  ctx.scene.enter('showMainMenu')
})

module.exports = { showSettingsMenu };