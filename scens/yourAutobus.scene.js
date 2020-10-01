const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");

// *************************** STEP 1 *******************************************
const yourAutobus = new Scene("yourAutobus");
yourAutobus.enter(async (ctx) => {
  const status = await User.findOne({ userId: ctx.from.id });
  const autobus = Object.keys(status.autobus);
  if(!autobus.length) {
    return await ctx.reply(
      `У вас нету выбранных автобусов.`,
      Extra.markup(
        Markup.keyboard([
          ["Добавить"],
          ["↪️ Вернуться назад"],
        ]).resize()
      )
    );
  }
  return await ctx.reply(
    `Ваши автобусы:\n${autobus
      .map((item) => `${item}  -  ${status.autobus[item]}`)
      .join(", \n")}`,
    Extra.markup(
      Markup.keyboard([
        ["Добавить", "Изменить", "Удалить"],
        ["↪️ Вернуться назад"],
      ]).resize()
    )
  );
});

yourAutobus.hears("Добавить", async (ctx) => {
  const status = await User.findOne({ userId: ctx.from.id });
  const autobus = Object.keys(status.autobus);
  if (autobus.length === 5) {
    return await ctx.reply("Вы выбрали все автобусы.");
  }
  await ctx.scene.enter("takeAutobus");
});

yourAutobus.hears("Изменить", async (ctx) => {
  await ctx.scene.enter("changeAutobus");
});

yourAutobus.hears("Удалить", async (ctx) => {
  await ctx.scene.enter("deleteAutobus");
});

yourAutobus.hears(/./, async (ctx) => {
  if (ctx.update.message.text === "↪️ Вернуться назад") {
    return await ctx.scene.enter("autobusMenu");
  }
  await ctx.reply("Пожалуйста, выберите действие.");
});

module.exports = { yourAutobus };
