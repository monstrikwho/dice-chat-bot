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
        ["Visa (RU)", "MC (RU)"],
        ["Visa (др. страны)", "MC (др. страны)"],
        ["↪️ Вернуться назад"],
      ]).resize()
    )
  );
});

outMoney.hears("На Qiwi кошелек", ({ scene }) => {
  scene.enter("outQiwi");
});
outMoney.hears("↪️ Вернуться назад", ({ scene }) => {
  scene.enter("lkMenu");
});

module.exports = { outMoney };
