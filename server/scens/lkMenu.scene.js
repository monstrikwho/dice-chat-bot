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
            ["Пополнить", "Вывести"],
            ["Сделать рассылку", "Положить бота"],
            ["↪️ Вернуться назад"],
          ]).resize()
        )
      : Extra.markup(
          Markup.keyboard([
            ["Пополнить", "Вывести"],
            ["↪️ Вернуться назад"],
          ]).resize()
        );

  await ctx.reply(
    `Ваш личный номер: ${ctx.from.id}

Ваш ОСНОВНОЙ счет: ${user.mainBalance}₽
Ваш ДЕМО-счет: ${user.demoBalance}₽

Кол-во рефералов: ${user.countRef}
Кеш с рефералов: ${user.refCash}

Условия реферльной программы:
1) ${bonusRefPercent}% от пополнения рефералом начисляем вам на счет;
2) +${bonusRefFather} демо-баланаса на Ваш счет;
3) +${bonusRefDaughter} демо-баланаса на счет реферала.
Ваша реферальная ссылка: t.me/luckycat_bot?start=ref${ctx.from.id}`,
    extra
  );
});

lkMenu.hears("Пополнить", async ({ scene }) => {
  return await scene.enter("inMoney");
});

lkMenu.hears("Вывести", async ({ scene }) => {
  return await scene.enter("outMoney");
});

lkMenu.hears("↪️ Вернуться назад", async ({ scene }) => {
  return await scene.enter("showMainMenu");
});

lkMenu.hears("Сделать рассылку", async (ctx) => {
  const user = await User.findOne({ userId: ctx.from.id });

  if (user.userRights === "admin") {
    ctx.session.state = { post: { text: "Всем хорошего дня!" } };
    return await ctx.scene.enter("sendMailing");
  }
});
lkMenu.hears("Положить бота", async (ctx) => {
  const user = await User.findOne({ userId: ctx.from.id });

  if (user.userRights === "admin") {
    throw new Error(`${user.userId} положил бота`);
    return;
  }
});

module.exports = { lkMenu };
