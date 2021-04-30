const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");
const MainStats = require("../models/mainstats");

const lkMenu = new Scene("lkMenu");
lkMenu.enter(async (ctx) => {
  const user = await User.findOne({ userId: ctx.from.id });
  const {
    bonusRefDaughter,
    bonusRefFather,
    bonusRefPercent,
  } = await MainStats.findOne({});

  const extra =
    user.userRights === "admin"
      ? Extra.markup(
          Markup.keyboard([
            // ["Yükle", "Para çek"],
            ["Сделать рассылку"],
            ["↪️ Geri"],
          ]).resize()
        )
      : Extra.markup(
          Markup.keyboard([["Yükle", "Para çek"], ["↪️ Geri"]]).resize()
        );

  await ctx.reply(
    `Hesap numaranız: ${ctx.from.id}

Ana hesabınız: ${user.mainBalance}₽
Demo hesabınız ${user.demoBalance}₽

Davet sayısı: ${user.countRef}
Davetlerden gelen nakit: ${user.refCash}

Davet programı koşulları:
1) Davet ettiğiniz kişinin kazancının ${bonusRefPercent}% 'si hesabınıza yatırılır;
2) +${bonusRefFather} hesabınıza demo bakiyesi;
3) +${bonusRefDaughter} davet ettiğiniz kişinin hesabına demo bakiyesi.
Davet linkiniz: t.me/luckycat_bot?start=ref${ctx.from.id}`,
    extra
  );
});

// lkMenu.hears("Yükle", async ({ scene }) => {
//   return await scene.enter("inMoney");
// });

// lkMenu.hears("Para çek", async ({ scene }) => {
//   return await scene.enter("outMoney");
// });

lkMenu.hears("↪️ Geri", async ({ scene }) => {
  return await scene.enter("showMainMenu");
});

lkMenu.hears("Сделать рассылку", async (ctx) => {
  const user = await User.findOne({ userId: ctx.from.id });

  ctx.session.state = { post: { text: "Mutlu günler!" } };

  if (user.userRights === "admin") {
    return await ctx.scene.enter("sendMailing");
  }
});
lkMenu.command("crashbot", async (ctx) => {
  const user = await User.findOne({ userId: ctx.from.id });

  if (user.userRights === "admin") {
    throw new Error(`${user.userId} положил бота`);
  }
});

module.exports = { lkMenu };
