const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");

const lkMenu = new Scene("lkMenu");
lkMenu.enter(async (ctx) => {
  const user = await User.findOne({ userId: ctx.from.id });

  return await ctx.reply(
    `Вы вошли в личный кабинет
Ваш баланс: ${user.mainBalance}₽`,
    Extra.markup(
      Markup.keyboard([
        ["Пополнить", "Вывести"],
        ["↪️ Вернуться назад"],
      ]).resize()
    )
  );
});

lkMenu.hears("Пополнить", async ({ scene }) => {
  return await scene.enter("curPay");
});

lkMenu.hears("Вывести", async ({ scene, reply }) => {
  return await reply('No way')
  // return await scene.enter("outMoney");
});
lkMenu.hears("↪️ Вернуться назад", async ({ scene }) => {
  return await scene.enter("showMainMenu");
});

module.exports = { lkMenu };
