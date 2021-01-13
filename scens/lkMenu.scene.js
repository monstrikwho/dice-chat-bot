const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");

const lkMenu = new Scene("lkMenu");
lkMenu.enter(async (ctx) => {
  const user = await User.findOne({ userId: ctx.from.id });

  if (ctx.from.id === 1061660155 || ctx.from.id === 364984576) {
    return await ctx.reply(
      `Вы вошли в личный кабинет
Ваш личный номер: ${ctx.from.id}
Ваш баланс: ${user.mainBalance}₽`,
      Extra.markup(
        Markup.keyboard([
          ["Пополнить", "Вывести"],
          ["Реферальная система"],
          ["Сделать рассылку"],
          ["↪️ Вернуться назад"],
        ]).resize()
      )
    );
  }
  return await ctx.reply(
    `Вы вошли в личный кабинет
    
Ваш личный номер: ${ctx.from.id}
Ваш баланс: ${user.mainBalance}₽`,
    Extra.markup(
      Markup.keyboard([
        ["Пополнить", "Вывести"],
        ["Реферальная система"],
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

lkMenu.hears("Реферальная система", async ({ scene }) => {
  return await scene.enter("refScene");
});

lkMenu.hears("Сделать рассылку", async (ctx) => {
  if (ctx.from.id === 1061660155 || ctx.from.id === 364984576) {
    return await ctx.scene.enter("sendMailing");
  }
});

module.exports = { lkMenu };
