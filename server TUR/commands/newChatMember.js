const { bot } = require("../init/startBot");
const Extra = require("telegraf/extra");

const User = require("../models/user");
const MainStats = require("../models/mainstats");

bot.on("new_chat_members", async (ctx) => {
  if (ctx.update.message.chat.id !== -1001402888875) return;
  if (!ctx.update.message.new_chat_member.id) return;

  const newChatMember = ctx.update.message.new_chat_member;

  const kanalStatus = await bot.telegram.getChatMember(
    "-1001294985813",
    newChatMember.id
  );

  const user = await User.findOne({ userId: newChatMember.id });
  if (!user) return;

  if (kanalStatus.status !== "member") {
    await bot.telegram.sendMessage(
      newChatMember.id,
      `Aramıza katıldığınız için teşekkürler! DEMO bonusunuz için lütfen her iki sayfaya da abone olduğunuzdan emin olun:
https://t.me/joinchat/iW9U-P6q-Z4yMGM6
https://t.me/joinchat/wdgqdldMxj1iNTNk

Abone olduktan sonra ‘kontrol et’ butonuna basın.`,
      Extra.markup((m) =>
        m.inlineKeyboard([[m.callbackButton("Kontrol et", "Kontrol et")]])
      )
    );
  }

  if (kanalStatus.status === "member") {
    const { kanalBonus } = await MainStats.findOne();

    await User.updateOne(
      { userId: newChatMember.id },
      { $inc: { demoBalance: kanalBonus }, getBonus: true }
    );

    await bot.telegram.sendMessage(
      newChatMember.id,
      `Abone olduğunuz için teşekkürler. Demo hesabınız için ${kanalBonus} TL hediye paranız hazır!`
    );
  }

  ctx.reply(`Hoş geldiniz, ${newChatMember.first_name}!`);
});

bot.action("Kontrol et", async (ctx) => {
  const { status: kanalStatus } = await bot.telegram.getChatMember(
    "-1001294985813",
    ctx.from.id
  );

  const { status: sohbetStatus } = await bot.telegram.getChatMember(
    "-1001402888875",
    ctx.from.id
  );

  if (kanalStatus === "member" && sohbetStatus === "member") {
    const { kanalBonus } = await MainStats.findOne();

    try {
      await ctx.deleteMessage(ctx.update.callback_query.message.message_id);
    } catch (error) {}

    await User.updateOne(
      { userId: ctx.from.id },
      { $inc: { demoBalance: kanalBonus }, getBonus: true }
    );

    return await ctx.answerCbQuery(
      `Abone olduğunuz için teşekkürler. Demo hesabınız için ${kanalBonus} TL hediye paranız hazır!`,
      true
    );
  }

  if (kanalStatus !== "member" || sohbetStatus !== "member") {
    try {
      await ctx.answerCbQuery(
        "Bonus gelmedi. Lütfen her iki sayfaya da abone olup olmadığınızı kontrol edin.",
        true
      );
    } catch (error) {}
  }
});
