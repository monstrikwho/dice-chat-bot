const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const isNumber = require("is-number");
const { outMoney } = require("../../helpers/qiwiMethods");
const MainStats = require("../../models/mainstats");

const outQiwi = new Scene("outQiwi");
outQiwi.enter(async (ctx) => {
  const { minOut, outPercent } = await MainStats.findOne({});

  return await ctx.reply(
    `Minimum para çekme tutarı: ${minOut.qiwi}p
Komisyon: ${outPercent}%. 
Lütfen tutarı girin.`,
    Extra.markup(Markup.keyboard([["↪️ Geri"]]).resize())
  );
});

outQiwi.on("text", async (ctx) => {
  const msg = ctx.update.message.text;

  if (msg === "↪️ Geri") {
    ctx.session.state = {};
    return await ctx.scene.enter("outMoney");
  }

  const { minOut, outPercent } = await MainStats.findOne({});

  if (ctx.session.state.payFlag) return;

  if (msg === "Onayla") {
    if (!ctx.session.state.activeMsg) return;
    ctx.session.state = {
      ...ctx.session.state,
      payFlag: true,
    };

    try {
      await ctx.deleteMessage(ctx.session.state.activeMsg.message_id);
    } catch (error) {}

    await ctx.scene.enter("lkMenu");

    const amount = ctx.session.state.amount;
    const wallet = ctx.session.state.wallet;

    // Отправляем запрос на вывод
    return await outMoney(amount, `+${wallet}`, ctx.from.id, 99);
  }

  if (ctx.session.state.activeMsg) {
    return ctx.reply(
      'İşlemi gerçekleştirmek için lütfen sohbete "Onayla" yazın.'
    );
  }

  // Если не ввели сумму
  if (!ctx.session.state.amount) {
    const amount = +msg.trim();
    const balance = ctx.session.state.mainBalance;
    const prizeFound = ctx.session.state.prizeFound;
    if (!isNumber(amount)) {
      return await ctx.reply("Lütfen yalnızca sayı girin");
    }
    if (amount < minOut.qiwi) {
      return await ctx.reply(
        `Minimum para çekme tutarı ${minOut.qiwi} TL. Lütfen farklı bir tutar girin.`
      );
    }
    if (amount * (1 + outPercent / 100) > balance) {
      return await ctx.reply("Yeterli bakiyeniz yok.");
    }
    if (amount > prizeFound) {
      return await ctx.reply(
        "Şu anda otomatik para çekme sisteminde bir sorun yaşıyoruz. Lütfen manuel para çekme için desteğe yazın. @LuckyCatGames"
      );
    }

    ctx.session.state = {
      ...ctx.session.state,
      amount,
    };
    return await ctx.reply("Lütfen QIWI cüzdan numaranızı girin.");
  }

  // Если не ввели номер кошелька
  if (!isNumber(+msg.trim())) {
    return await ctx.reply("Lütfen yalnızca sayı girin");
  }

  ctx.session.state = {
    ...ctx.session.state,
    wallet: msg,
    activeMsg: await ctx.reply(
      `Tutarı çekmek üzeresiniz ${
        ctx.session.state.amount
      } TL kart numarasına  +${msg}.
Kalan Bakiyeniz görüntülenecek: ${ctx.session.state.amount * (1 + outPercent / 100)}
Ödemeyi yapmak için lütfen sohbete "Onayla" yazın.`
    ),
  };
});

module.exports = { outQiwi };
