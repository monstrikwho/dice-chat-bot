const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");
const User = require("../models/user");
const axios = require("axios");

// *************************** STEP 1 *******************************************
const outMoney = new Scene("outMoney");
outMoney.enter(async (ctx) => {
  const { mainBalance } = await User.findOne({ userId: ctx.from.id });
  const prizeFound = await axios
    .get(
      `https://edge.qiwi.com/funding-sources/v2/persons/${process.env.QIWI_WALLET}/accounts`
    )
    .then((res) => res.data.accounts[0].balance.amount);

  return await ctx.reply(
    `Призовой фонд: ${prizeFound} ₽
Ваш баланс: ${mainBalance} ₽`,
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
outMoney.hears("Visa (RU)", ({ scene }) => {
  scene.enter("visaRu");
});
outMoney.hears("MC (RU)", ({ scene }) => {
  scene.enter("mcRu");
});
outMoney.hears("Visa (др. страны)", ({ scene }) => {
  scene.enter("visaOther");
});
outMoney.hears("MC (др. страны)", ({ scene }) => {
  scene.enter("mcOther");
});
outMoney.hears("↪️ Вернуться назад", ({ scene }) => {
  scene.enter("lkMenu");
});

module.exports = { outMoney };
