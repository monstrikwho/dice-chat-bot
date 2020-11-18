const User = require("../models/user");
const { checkOrder } = require("../helpers/freeKassaMethods");

module.exports = (scene) => {
  scene.action(/./, async (ctx) => {
    const orderId = +ctx.update.callback_query.data;
    const order = await checkOrder(orderId);

    if (order.status === "new")
      return await ctx.answerCbQuery(
        `Пожалуйста, подождите минуту. Ваш платеж №${orderId} обрабатывается.`,
        true
      );
  
    if (order.status === "fast")
      return await ctx.answerCbQuery(
        `Слишком часто! Пожалуйста, попробуйте через 10 секунд.`,
        true
      );
  
    if (order.status) {
      const user = await User.findOne({ userId: ctx.from.id });
      const toTransfer = +order.amount + user.mainBalance
      await User.updateOne(
        { userId: ctx.from.id },
        { mainBalance: toTransfer }
      );
       await ctx.answerCbQuery(
        `Ваш платеж №${orderId} успешно оплачен.`,
        true
      );
      return await ctx.reply(`На ваш баланс зачислено 💰 ${+order.amount}₽
Ваш баланс: ${toTransfer}`)
    }
    return await ctx.answerCbQuery(
      `Ваш платеж №${orderId} не был оплачен.`,
      true
    );
  });
}
