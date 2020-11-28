const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const { getProfileBalance } = require("../helpers/qiwiMethods");
const User = require("../models/user");

const outMoney = new Scene("outMoney");
outMoney.enter(async (ctx) => {
  const { mainBalance } = await User.findOne({ userId: ctx.from.id });
  const prizeFound = await getProfileBalance();

  ctx.session.state = {
    mainBalance,
    prizeFound,
  };

  return await ctx.reply(
    `Ваш баланс: ${mainBalance} ₽`,
    Extra.markup(
      Markup.keyboard([
        ["Qiwi кошелек"],
        ["Visa (RU)", "MC (RU)"],
        ["Visa (Other)", "MC (Other)"],
        ["↪️ Вернуться назад"],
      ]).resize()
    )
  );
});

outMoney.hears("Qiwi кошелек", async (ctx) => {
  return await ctx.scene.enter("outQiwi");
});
outMoney.hears("Visa (RU)", async (ctx) => {
  ctx.session.state = {
    ...ctx.session.state,
    idProvider: 1963,
  };
  return await ctx.scene.enter("outCardRu");
});
outMoney.hears("MC (RU)", async (ctx) => {
  ctx.session.state = {
    ...ctx.session.state,
    idProvider: 21013,
  };
  return await ctx.scene.enter("outCardRu");
});
outMoney.hears("Visa (Other)", async (ctx) => {
  ctx.session.state = {
    ...ctx.session.state,
    idProvider: 1960,
  };
  return await ctx.scene.enter("outCardOther");
});
outMoney.hears("MC (Other)", async (ctx) => {
  ctx.session.state = {
    ...ctx.session.state,
    idProvider: 21012,
  };
  return await ctx.scene.enter("outCardOther");
});
outMoney.hears("↪️ Вернуться назад", (ctx) => {
  ctx.scene.enter("lkMenu");
});

module.exports = { outMoney };
