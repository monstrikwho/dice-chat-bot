const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const { bot } = require("../init/startBot");

const User = require("../models/user");

// *************************** STEP 1 *******************************************
const otherAutobus = new Scene("otherAutobus");
otherAutobus.enter(async (ctx) => {
  return ctx.reply(
    "Данного раздела нету. Мне нужен ваш отклик: надо ли КОНКРЕТНО ВАМ расписание других автобусов? ",
    // "Введите номер автобуса, чтобы посмотреть рассписание",
    Extra.markup(
      Markup.keyboard([
        ["Да, нужно", "Нет, не нужно"],
        ["↪️ Вернуться назад"],
      ]).resize()
    )
  );
});

otherAutobus.hears(/./, async (ctx) => {
  if (ctx.update.message.text === "↪️ Вернуться назад") {
    return ctx.scene.enter("autobusMenu");
  }

  const user = await User.findOne({ userId: ctx.from.id });

  if (ctx.update.message.text === "Нет, не нужно") {
    await bot.telegram.sendMessage(-423364008, `@${user.userName} - Не нужно`);
    ctx.reply("Спасибо за ваш отклик");
    return ctx.scene.enter("autobusMenu");
  }
  if (ctx.update.message.text === "Да, нужно") {
    await bot.telegram.sendMessage(-423364008, `@${user.userName} - Нужно`);
    ctx.reply("Спасибо за ваш отклик");
    return ctx.scene.enter("autobusMenu");
  }

  ctx.reply("Вы ввели что-то непонятное..");
});


module.exports = { otherAutobus };
