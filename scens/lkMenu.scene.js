const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const lkMenu = new Scene("lkMenu");
lkMenu.enter(async (ctx) => {
  return await ctx.reply(
    "Вы вошли в личный кабинет",
    Extra.markup(
      Markup.keyboard([
        ["Пополнить", "Вывести"],
        ["↪️ Вернуться назад"],
      ]).resize()
    )
  );
});

lkMenu.hears("Пополнить", async ({ scene }) => {
  return await scene.enter("inMoney");
});

lkMenu.hears("Вывести", async ({ scene }) => {
  return await scene.enter("outMoney");
});
lkMenu.hears("↪️ Вернуться назад", async ({ scene }) => {
  return await scene.enter("showMainMenu");
});

module.exports = { lkMenu };
