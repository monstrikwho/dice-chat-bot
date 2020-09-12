const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const { bot } = require("../init/startBot");

const { places } = require("../keyboards/autobus");

// *************************** STEP 1 *******************************************
const takeAutobus = new Scene("takeAutobus");
takeAutobus.enter(async (ctx) => {
  await ctx.reply(
    "Вы перешли к выбору автобусов.",
    Markup.removeKeyboard().extra()
  );
  await ctx.reply(
    "Пожалуйста, выберите автобусы",
    Extra.HTML().markup((m) =>
      m.inlineKeyboard([
        [6, 11, 14].map((item) => m.callbackButton(item, item)),
        [22, 29, 31].map((item) => m.callbackButton(item, item)),
        [m.callbackButton("back", "back")],
      ])
    )
  );
});

// takeAutobus.hears("↪️ Вернуться назад", (ctx) => {
//   ctx.scene.enter("showMainMenu");
// });
// takeAutobus.hears("Выбрать автобусы", (ctx) => {
//   ctx.scene.enter("showMainMenu");
// });

takeAutobus.action(/(?:31)/, (ctx) => {
  ctx.scene.enter("takePlaces");
});
takeAutobus.action(/(?:back)/, (ctx) => {
  ctx.scene.enter("autobusMenu");
});

//
const takePlaces = new Scene("takePlaces");
takePlaces.enter(async (ctx) => {
  await ctx.reply(
    "Выберите остановку",
    Extra.HTML().markup((m) =>
      m.inlineKeyboard([
        ...places[31].map((item) => [m.callbackButton(item, item)]),
        [m.callbackButton("back", "back")],
      ])
    )
  );
});

takePlaces.action(/(?:back)/, (ctx) => {
  ctx.scene.enter("takeAutobus");
});

module.exports = { takeAutobus, takePlaces };
