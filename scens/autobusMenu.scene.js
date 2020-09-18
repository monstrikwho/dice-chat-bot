const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");

// *************************** STEP 1 *******************************************
const autobusMenu = new Scene("autobusMenu");
autobusMenu.enter(async (ctx) => {
  const [status] = await User.find({ userId: ctx.from.id });
  if (status.autobus) {
    return await ctx.reply(
      "Вы вошли в меню автобусов",
      Extra.markup(
        Markup.keyboard([
          ["Ближайшие", "Мои автобусы"],
          ["Др. автобусы", "↪️ Вернуться назад"],
        ]).resize()
      )
    );
  }
  return await ctx.scene.enter("takeAutobus");
});

autobusMenu.hears("Ближайшие", async (ctx) => {
  await ctx.scene.enter("nearestAutobus");
});
autobusMenu.hears("Др. автобусы", async (ctx) => {
  await ctx.scene.enter("otherAutobus");
});
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
