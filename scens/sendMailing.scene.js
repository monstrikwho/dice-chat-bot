const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");
const Setting = require("../models/setting");
const { bot } = require("../init/startBot");

const sendMailing = new Scene("sendMailing");
sendMailing.enter(async (ctx) => {
  return await ctx.reply(
    "Введите сообщение",
    Extra.markup(Markup.keyboard([["↪️ Вернуться назад"]]).resize())
  );
});

sendMailing.on("text", async (ctx) => {
  const msg = ctx.update.message.text;

  if (msg === "↪️ Вернуться назад") {
    return await ctx.scene.enter("lkMenu");
  }

  await ctx.reply(
    `Рассылка началась. Пожлауйста подождите, пока она завершится. (Вам придет сообщение.)`
  );

  const users = await User.find();
  let arrUsersId = users.map((item) => item.userId);

  let countBlocked = 0;

  for (let userId of arrUsersId) {
    try {
      await bot.telegram.sendMessage(userId, msg);
      await User.updateOne({ userId }, { isBlocked: false });
    } catch (err) {
      countBlocked++;
      await User.updateOne({ userId }, { isBlocked: true });
    }
  }

  await Setting.updateOne({}, { countBlocked });

  await ctx.reply(`Рассылка была завершена. countBlocked: ${countBlocked}`);
  await ctx.scene.enter("showMainMenu");
});

module.exports = { sendMailing };
