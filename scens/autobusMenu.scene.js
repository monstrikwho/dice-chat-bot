const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");

// *************************** STEP 1 *******************************************
const autobusMenu = new Scene("autobusMenu");
autobusMenu.enter(async (ctx) => {
  return await ctx.reply(
    "Вы вошли в меню автобусов",
    Extra.markup(
      Markup.keyboard([
        ["Ближайшие", "Мои автобусы"],
        ["↪️ Вернуться назад"],
      ]).resize()
    )
  );
});

autobusMenu.hears("Ближайшие", async (ctx) => {
  const status = await User.findOne({ userId: ctx.from.id });
  const autobus = Object.keys(status.autobus);
  if (!autobus.length) {
    return await ctx.reply(
      'Вы не выбрали автобусы. Пожалуйста, нажмите кнопку "Мои автобусы" - "Добавить", чтобы добавить автобус.'
    );
  }
  await ctx.scene.enter("nearestAutobus");
});
// autobusMenu.hears("Др. автобусы", async (ctx) => {
//   await ctx.scene.enter("otherAutobus");
// });
autobusMenu.hears("Мои автобусы", async (ctx) => {
  await ctx.scene.enter("yourAutobus");
});
autobusMenu.hears(/./, async (ctx) => {
  if (ctx.update.message.text === "↪️ Вернуться назад") {
    return await ctx.scene.enter("showMainMenu");
  }
  await ctx.reply("Пожалуйста, выберите действие.");
});

module.exports = { autobusMenu };
