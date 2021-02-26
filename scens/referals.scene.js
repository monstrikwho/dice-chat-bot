const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");

const refScene = new Scene("refScene");
refScene.enter(async (ctx) => {
  const countRef = await User.find({ isRef: ctx.from.id });
  return await ctx.reply(
    `Кол-во приглашенных Вами пользователей: ${countRef.length}

Условия реферльной программы:
При первом пополнении реферала +7%, далее +5%.
+10к демо-баланаса на счет реферала


ВАЖНО! Пользователь, приглашенный не по Вашей ссылке, не будет считаться за реферала.

Ваша реферальная ссылка: t.me/luckycat_bot?start=ref${ctx.from.id}`,
    Extra.markup(Markup.keyboard([["↪️ Вернуться назад"]]).resize())
  );
});

refScene.hears("↪️ Вернуться назад", async ({ scene }) => {
  return await scene.enter("lkMenu");
});

module.exports = { refScene };
