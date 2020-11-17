const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");
const User = require("../models/user");
const axios = require("axios");

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
        ["Qiwi кошелек"],
        ["Яндекс.Деньги"],
        ["Visa & MC (RUB)"],
        ["↪️ Вернуться назад"],
      ]).resize()
    )
  );
});

outMoney.hears("Qiwi кошелек", ({ scene }) => {
  scene.enter("outQiwi");
});
outMoney.hears("Яндекс.Деньги", ({ scene }) => {
  scene.enter("visaRu");
});
outMoney.hears("Visa & MC (RUB)", ({ scene }) => {
  scene.enter("mcRu");
});
// outMoney.hears("Visa (др. страны)", ({ scene }) => {
//   scene.enter("visaOther");
// });
// outMoney.hears("MC (др. страны)", ({ scene }) => {
//   scene.enter("mcOther");
// });
outMoney.hears("↪️ Вернуться назад", ({ scene }) => {
  scene.enter("lkMenu");
});

module.exports = { outMoney };
