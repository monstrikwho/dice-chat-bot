const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");
const { bot } = require("../init/startBot");

const sendMailing = new Scene("sendMailing");
sendMailing.enter(async (ctx) => {
  return await ctx.reply(
    "Введите сообщение или добавьте фото (в сжатом формате!), чтобы прикрепить его к сообщению.",
    Extra.markup(Markup.keyboard([["↪️ Вернуться назад"]]).resize())
  );
});

sendMailing.on("photo", async (ctx) => {
  const photoId = ctx.update.message.photo[0].file_id;
  ctx.session.state = {
    ...ctx.session.state,
    photoId,
  };
  await ctx.reply("Вы успешно прикрепили фото.");
});

sendMailing.on("text", async (ctx) => {
  const msg = ctx.update.message.text;

  if (msg === "↪️ Вернуться назад") {
    return await ctx.scene.enter("lkMenu");
  }

  await ctx.reply(
    `Рассылка началась. Пожлауйста подождите, пока она завершится. (Вам придет сообщение.)`
  );

  const users = await User.find({ isBlocked: false });
  let arrUsersId = users.map((item) => item.userId);

  for (let userId of arrUsersId) {
    try {
      if (ctx.session.state.photoId) {
        await bot.telegram.sendPhoto(userId, ctx.session.state.photoId);
      }
      await bot.telegram.sendMessage(userId, msg);
    } catch (err) {}
  }

  await ctx.reply(`Рассылка завершена.`);
  await ctx.scene.enter("showMainMenu");
});

module.exports = { sendMailing };
