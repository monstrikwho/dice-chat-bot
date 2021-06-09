const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");
const MainStats = require("../models/mainstats");

const lkMenu = new Scene("lkMenu");
lkMenu.enter(async (ctx) => {
  ctx.session.state = { photoMsg: null };
  const user = await User.findOne({ userId: ctx.from.id });
  const { bonusRefDaughter, bonusRefFather, bonusRefPercent } =
    await MainStats.findOne({});

  ctx.session.state.activeMsg = await ctx.reply(
    `Hesap numaranız: ${ctx.from.id}

Ana hesabınız: ${user.mainBalance} TL
Demo hesabınız ${user.demoBalance} TL

Davet sayısı: ${user.countRef}
Davetlerden gelen nakit: ${user.refCash} TL

Davet programı koşulları:
1) Davet ettiğiniz kişinin kazancının ${bonusRefPercent}% 'si hesabınıza yatırılır;
2) +${bonusRefFather} hesabınıza demo bakiyesi;
3) +${bonusRefDaughter} davet ettiğiniz kişinin hesabına demo bakiyesi.
Davet linkiniz: t.me/zaroyunu_bot?start=ref${ctx.from.id}`,
    Extra.markup(Markup.keyboard([["Yükle", "Para çek"], ["↪️ Geri"]]).resize())
  );
});

lkMenu.hears("Yükle", async ({ scene }) => {
  return await scene.enter("inMoney");
});

lkMenu.hears("Para çek", async ({ scene }) => {
  return await scene.enter("outMoney");
});

lkMenu.hears("↪️ Geri", async (ctx) => {
  try {
    await ctx.deleteMessage(ctx.session.state.activeMsg.message_id);
  } catch (error) {}
  return await ctx.scene.enter("showMainMenu");
});

// lkMenu.command("crashbot", async (ctx) => {
//   const user = await User.findOne({ userId: ctx.from.id });

//   if (user.userRights === "admin") {
//     throw new Error(`${user.userId} положил бота`);
//   }
// });

module.exports = { lkMenu };
