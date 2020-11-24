const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const CryptoJS = require("crypto-js");
// const base64 = require("crypto-js/enc-base64");


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


  // const hash = 'fa30f09aafa6aefeb40fa841fcc91b689dd52196daa570c32f0c8a1c8d01c2b1'
  // const code = '643|10|IN||20322489466'

  
  // const code = '643|1|IN|+79165238345|13353941550' // '76687ffe5c516c793faa46fafba0994e7ca7a6d735966e0e0c0b65eaa43bdca0'
  // var code3 = CryptoJS.enc.Base64.parse(process.env.HOOK_KEY)
  // var code2 = CryptoJS.SHA256(code, code3)
  // var base64 = CryptoJS.HmacSHA256(code, process.env.HOOK_KEY)
  // code2.update(code3)
  // var hash = code2.finalize()
  // "sum.currency,sum.amount,type,account,txnId"

  // console.log(base64.toString())

  return await ctx.reply(
    `Призовой фонд: ${prizeFound} ₽
Ваш баланс: ${mainBalance} ₽`,
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
