const { bot } = require("../init/startBot");

const moment = require("moment");

const User = require("../models/user");
const Order = require("../models/order");
const MainStats = require("../models/mainstats");

bot.action("Iptal", async (ctx) => {
  const cbMsgId = ctx.update.callback_query.message.message_id;
  try {
    await ctx.deleteMessage(cbMsgId - 1);
  } catch (error) {}
  try {
    await ctx.deleteMessage(cbMsgId);
  } catch (error) {}
});

bot.action("Начислить", async (ctx) => {
  const text = ctx.update.callback_query.message.text;
  const cbMsgId = ctx.update.callback_query.message.message_id;

  const textArr = text.split("\n");
  const orderId = +textArr[0].match(/\d+/)[0];
  const userId = +textArr[1].match(/\d+/)[0];
  const amountTl = +textArr[2].match(/\d+/)[0];
  const amountRub = +textArr[3].match(/\d+/)[0];

  const user = await User.findOne({ userId });
  const order = await Order.findOne({ id: orderId });
  const { orderStats, bonusRefPercent } = await MainStats.findOne();

  // Обновляем ордер
  if (order.status === "paid") return;
  await Order.updateOne({ id: orderId }, { status: "paid" });

  // Зачисляем баланс юзеру
  await User.updateOne(
    { userId: user.userId },
    { mainBalance: +(user.mainBalance + amountTl).toFixed(2) }
  );

  // Обновляем общую статистику пополнений
  await MainStats.updateOne(
    {},
    {
      $inc: {
        "orderStats.lastNumberOrder": 1,
        "orderStats.countInOrder": 1,
      },
      "orderStats.amountInMoney": +(
        orderStats.amountInMoney + amountTl
      ).toFixed(2),
    }
  );

  // Если это реферал, начисляем процент пригласившему
  if (user.isRef !== 0) {
    const { mainBalance, refCash } = await User.findOne({
      userId: user.isRef,
    });

    // Начисляем процент пополениня пригласившему реферала
    await User.updateOne(
      { userId: user.isRef },
      {
        mainBalance: +(
          mainBalance +
          (amountTl * bonusRefPercent) / 100
        ).toFixed(2),
        refCash: +(refCash + (amountTl * bonusRefPercent) / 100).toFixed(2),
      }
    );

    // Отправляем сообщение пригласившему
    await bot.telegram.sendMessage(
      user.isRef,
      `Ana hesabınız kayıtlı ${((amountTl * bonusRefPercent) / 100).toFixed(
        2
      )} TL İstenen sevk için.`
    );
  }

  // Отправляем сообщение юзеру
  await bot.telegram.sendMessage(
    userId,
    `${amountTl} TL ana hesabınıza aktarıldı.`
  );

  for (let i = 0; i < order.userMsgId.length; i++) {
    try {
      await bot.telegram.deleteMessage(userId, order.userMsgId[i]);
    } catch (error) {}
  }

  // Изменяем сообщение модератору
  await ctx.editMessageText(cbMsgId.message_id, {
    text: text + "\n\n🟢 НАЧИСЛЕНО",
  });
});

bot.action("Выплатил", async (ctx) => {
  const text = ctx.update.callback_query.message.text;
  const cbMsgId = ctx.update.callback_query.message.message_id;

  const textArr = text.split("\n");
  const orderId = +textArr[0].match(/\d+/)[0];
  const userId = +textArr[1].match(/\d+/)[0];

  const order = await Order.findOne({ id: orderId });

  // Обновляем ордер
  if (order.status === "passed") return;
  await Order.updateOne({ id: orderId }, { status: "passed" });

  // Изменяем сообщение модератору
  await ctx.editMessageText(cbMsgId.message_id, {
    text: text + "\n\n🟢 ВЫПЛАЧЕНО",
  });
});

bot.on("callback_query", async (ctx) => {
  const cbDataArr = ctx.update.callback_query.data.split(":");
  const cbFromMsgId = ctx.update.callback_query.message.message_id;

  // Отбрасываем другие колбеки
  if (cbDataArr[0] !== "order") return;

  const { moderId } = await MainStats.findOne();
  const orderStatus = await Order.findOne({ id: cbDataArr[1] });

  // Если ордер создан
  if (orderStatus) {
    return ctx.answerCbQuery(
      `İsteğiniz alındı! Bakiyenizin hesaba aktarılması birkaç dakika sürecek. Eğer 30 dakika içinde aktarılmazsa lütfen ödeme görüntüsünü desteğe gönderin.`,
      true
    );
  }

  const order = new Order({
    id: cbDataArr[1],
    type: "IN",
    status: "waiting",
    userId: cbDataArr[2],
    amount: {
      tl: cbDataArr[3],
      rub: cbDataArr[4],
    },
    userMsgId: [cbFromMsgId, cbFromMsgId - 1],
    date: moment().format("YYYY-MM-DD"),
  });
  await order.save();

  await bot.telegram.sendMessage(
    moderId,
    `Пополение №${cbDataArr[1]}
userId: [@${cbDataArr[2]}](tg://user?id=${cbDataArr[2]})
tl: ${cbDataArr[3]}
rub: ${cbDataArr[4]}`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Начислить",
              callback_data: "Начислить",
            },
          ],
        ],
      },
    }
  );

  return ctx.answerCbQuery(
    `İsteğiniz alındı! Bakiyenizin hesaba aktarılması birkaç dakika sürecek. Eğer 30 dakika içinde aktarılmazsa lütfen ödeme görüntüsünü desteğe gönderin.`,
    true
  );
});
