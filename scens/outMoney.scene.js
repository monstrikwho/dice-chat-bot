const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

// *************************** STEP 1 *******************************************
const outMoney = new Scene("outMoney");
outMoney.enter(async (ctx) => {
  return await ctx.reply(
    "Вы вошли в главное меню",
    Extra.markup(
      Markup.keyboard([
        ["На Qiwi кошелек"],
        ["На карту Visa, MasterCard"],
        ["На моб. телефон"],
        ["↪️ Вернуться назад",],
      ]).resize()
    )
  );
});

outMoney.hears("↪️ Вернуться назад", ({ scene }) => {
  scene.enter("lkMenu");
});

module.exports = { outMoney };
