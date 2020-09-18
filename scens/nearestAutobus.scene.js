const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const { nearest } = require("../helpers/getRaspAutobus");

const User = require("../models/user");

// *************************** STEP 1 *******************************************
const nearestAutobus = new Scene("nearestAutobus");
nearestAutobus.enter(async (ctx) => {
  return await ctx.reply(
    "Выберите направление",
    Extra.markup(
      Markup.keyboard([
        ["В университет", "С университета"],
        ["↪️ Вернуться назад"],
      ]).resize()
    )
  );
});

nearestAutobus.hears("В университет", async (ctx) => {
  const user = await User.findOne({ userId: ctx.from.id });
  if (user.autobus === {})
    return await ctx.reply("Вы не выбрали ни одного автобуса");
  await nearest(ctx, user.autobus, "in");
  await ctx.scene.enter("showMainMenu");
});
nearestAutobus.hears("С университета", async (ctx) => {
  const user = await User.findOne({ userId: ctx.from.id });
  if (user.autobus === {})
    return await ctx.reply("Вы не выбрали ни одного автобуса");
  await nearest(ctx, user.autobus, "out");
  await ctx.scene.enter("showMainMenu");
});
nearestAutobus.hears(/./, async (ctx) => {
  if (ctx.update.message.text === "↪️ Вернуться назад") {
    return await ctx.scene.enter("autobusMenu");
  }
  await ctx.reply("Пожалуйста, выберите действие.");
});
module.exports = { nearestAutobus };
