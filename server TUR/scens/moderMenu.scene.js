const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");

const moderMenu = new Scene("moderMenu");
moderMenu.enter(async (ctx) => {
  return await ctx.reply(
    "Вы вошли в главное меню",
    Extra.markup(
      Markup.keyboard([["Начислить баланс", "Сделать рассылку"]]).resize()
    )
  );
});

moderMenu.hears("Начислить баланс", async (ctx) => {
  const user = await User.findOne({ userId: ctx.from.id });

  if (user.userRights === "moder") {
    return await ctx.scene.enter("addBalance");
  }
});

moderMenu.hears("Сделать рассылку", async (ctx) => {
  const user = await User.findOne({ userId: ctx.from.id });

  if (user.userRights === "moder") {
    ctx.session.state = { post: { text: "Mutlu günler!" } };
    await ctx.reply(
      `Вы открыли меню для рассылки`,
      Extra.markup(Markup.keyboard([["↪️ Вернуться назад"]]).resize())
    );
    return await ctx.scene.enter("sendMailing");
  }
});

module.exports = { moderMenu };
