const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

// *************************** STEP 1 *******************************************
const showMainMenu = new Scene("showMainMenu");
showMainMenu.enter((ctx) => {
  return ctx.reply(
    "Вы вошли в главное меню",
    Extra.markup(
      Markup.keyboard([
        ["Сегодня", "Завтра", "Неделю"],
        ["⚙️ Настройки", "🚌 Автобусы"],
      ])
      .resize()
    )
  );
});

showMainMenu.hears('⚙️ Настройки', (ctx) => {
  ctx.scene.enter('showSettingsMenu')
})
showMainMenu.hears('Сегодня', (ctx) => {
  ctx.reply('Сейчас скинем')
})
showMainMenu.hears('Завтра', (ctx) => {
  ctx.reply('Сейчас скинем')
})
showMainMenu.hears('Неделю', (ctx) => {
  ctx.scene.enter('weekMenu')
})

module.exports = { showMainMenu };
