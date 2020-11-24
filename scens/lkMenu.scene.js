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
  return await scene.enter("inMoney");
});

lkMenu.hears("Вывести", async ({ scene }) => {
  // return await scene.enter("outMoney");
  const axios = require("axios");
  const querystring = require("querystring");

  await axios
    .post(
      `https://dice-bots.ru/verify_pay`,
      querystring.stringify({ sfdsf: "dsfsdf" })
    )
    .then((res) => console.log(res))
    .catch((err) => console.log(err.message));
});
lkMenu.hears("↪️ Вернуться назад", async ({ scene }) => {
  return await scene.enter("showMainMenu");
});

module.exports = { lkMenu };
