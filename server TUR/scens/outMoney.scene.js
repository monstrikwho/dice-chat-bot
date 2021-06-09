const { bot } = require("../init/startBot");

const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");
const MainStats = require("../models/mainstats");
const Order = require("../models/order");

const moment = require("moment");
const isNumber = require("is-number");

const outMoney = new Scene("outMoney");
outMoney.enter(async (ctx) => {
  const { mainBalance } = await User.findOne({ userId: ctx.from.id });
  ctx.session.outMoney = { amount: null, card: null, name: null };

  return await ctx.reply(
    `Lütfen çekmek istediğiniz tutarı girin.

Bakiyeniz: ${mainBalance} TL`,
    Extra.markup(Markup.keyboard([["↪️ Geri"]]).resize())
  );
});

outMoney.hears("↪️ Geri", async (ctx) => {
  await ctx.scene.enter("lkMenu");
});

outMoney.leave(async (ctx) => {
  try {
    await ctx.deleteMessage(ctx.session.outMoney.activeMsg.message_id);
  } catch (error) {}
});

outMoney.on("text", async (ctx) => {
  const msg = ctx.update.message.text;
  const { amount, card, name } = ctx.session.outMoney;

  if (!amount) {
    if (!isNumber(+msg)) {
      return await ctx.reply(
        "Uygun olmayan bir numara girdiniz. Tekrar deneyin."
      );
    }

    const { minOut } = await MainStats.findOne();
    const { mainBalance } = await User.findOne({ userId: ctx.from.id });

    if (+msg < minOut) {
      return await ctx.reply(`Yenilecek minimum miktar ${minOut} TL`);
    }

    if (+msg > mainBalance) {
      return await ctx.reply(
        `Bilançoda yeterli fon yok.Başka bir miktar girin.`
      );
    }

    ctx.session.outMoney.amount = +msg;

    return await ctx.reply(`Çıkışın toplamı başarıyla seçildi: ${msg}

Lütfen kart numarası girin.`);
  }

  if (!card) {
    if (!isNumber(+msg)) {
      return await ctx.reply(
        "Uygun olmayan bir numara girdiniz. Tekrar deneyin."
      );
    }

    if (+msg.length !== 16) {
      return await ctx.reply(
        "Yanlış kart numarasını belirttiniz. Tekrar deneyin."
      );
    }

    ctx.session.outMoney.card = +msg;

    return await ctx.reply(`Kart numarası başarıyla seçildi: ${msg}

Kart üzerindeki isim ve soyisim.`);
  }

  if (!name) {
    ctx.session.outMoney.name = msg;

    ctx.session.outMoney.activeMsg = await ctx.reply(
      `Verilerinizi kontrol edin:
Kart numarası: ${card}
Kart sahibi: ${msg}
Miktar: ${amount} TL`,
      Extra.markup((m) =>
        m.inlineKeyboard([
          [
            m.callbackButton("Onaylamak", "Onaylamak"),
            m.callbackButton("Tekrar yaz", "Tekrar yaz"),
          ],
        ])
      )
    );
  }
});

outMoney.action("Onaylamak", async (ctx) => {
  const { amount, card, name } = ctx.session.outMoney;

  const user = await User.findOne({ userId: ctx.from.id });
  const { orderStats, moderId } = await MainStats.findOne();

  const order = await Order.findOne({ id: orderStats.lastNumberOrder + 1 });

  // If order was created
  if (order) return;

  // Сохраняем платеж
  const saveOrder = new Order({
    id: orderStats.lastNumberOrder + 1,
    type: "OUT",
    status: "waiting",
    userId: ctx.from.id,
    amount: { tl: amount },
    card,
    name,
    date: moment().format("YYYY-MM-DD"),
  });
  await saveOrder.save();

  // Списываем сумму у пользователя
  await User.updateOne(
    { userId: ctx.from.id },
    { mainBalance: +(user.mainBalance - amount).toFixed(2) }
  );

  // Обновляем общую статистику платежей
  await MainStats.updateOne(
    {},
    {
      $inc: {
        "orderStats.lastNumberOrder": 1,
        "orderStats.countOutOrder": 1,
      },
      "orderStats.amountOutMoney": +(
        orderStats.amountOutMoney + amount
      ).toFixed(2),
    }
  );

  await ctx.reply(`Bitti! Bakiyenin hesaba aktarılması yaklaşık 1-2 saat sürecek. Paranın hesabınıza aktarılmaması durumunda lütfen destek ekibimiz ile iletişime geçin. @Zar_destek

Bakiyenizden tutarı tutuldu: ${amount} TL`);

  // Отправляем платеж модератору на обработку
  await bot.telegram.sendMessage(
    moderId,
    `Запрос на вывод №${orderStats.lastNumberOrder + 1}
userId: [@${ctx.from.id}](tg://user?id=${ctx.from.id})
card: ${card}
name: ${name}
amount: ${amount}`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Выплатил",
              callback_data: "Выплатил",
            },
          ],
        ],
      },
    }
  );

  return await ctx.scene.enter("lkMenu");
});

outMoney.action("Tekrar yaz", async (ctx) => {
  try {
    await bot.telegram.deleteMessage(
      ctx.from.id,
      ctx.session.outMoney.activeMsg.message_id
    );
  } catch (error) {}
  ctx.session.outMoney = { amount: null, card: null, name: null };

  const { mainBalance } = await User.findOne({ userId: ctx.from.id });

  await ctx.reply(`Lütfen çıktı için toplamı girin.

Bakiyeniz: ${mainBalance} TL`);
});

module.exports = { outMoney };
