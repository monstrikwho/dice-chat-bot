const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const isNumber = require("is-number");
const { outMoney } = require("../../helpers/qiwiMethods");
const MainStats = require("../../models/mainstats");

const outCardOther = new Scene("outCardOther");
outCardOther.enter(async (ctx) => {
  const { minOut, outPercent } = await MainStats.findOne({});

  return await ctx.reply(
    `Minimum para çekme tutarı: ${minOut.card}р. 
Komisyon: ${2 + outPercent}% + 100р. 
Lütfen tutarı girin.`,
    Extra.markup(Markup.keyboard([["↪️ Geri"]]).resize())
  );
});

outCardOther.on("text", async (ctx) => {
  const msg = ctx.update.message.text;

  if (msg === "↪️ Geri") {
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
    const idProvider = ctx.session.state.idProvider;
    const userInfo = ctx.session.state.userInfo;

    // Отправляем запрос на вывод
    return await outMoney(
      amount,
      `${wallet}`,
      ctx.from.id,
      idProvider,
      userInfo
    );
  }

  if (ctx.session.state.activeMsg) {
    return ctx.reply(
      'İşlemi gerçekleştirmek için lütfen sohbete "Onayla" yazın.'
    );
  }

  // Если не ввели сумму для вывода
  if (!ctx.session.state.amount) {
    const amount = +msg.trim();
    const balance = ctx.session.state.mainBalance;
    const prizeFound = ctx.session.state.prizeFound;
    if (!isNumber(amount)) {
      return await ctx.reply("Lütfen yalnızca sayı girin");
    }
    if (amount < minOut.card) {
      return await ctx.reply(
        `Minimum para çekme tutarı ${minOut.card} TL. Lütfen farklı bir tutar girin.`
      );
    }
    if (amount * (1.02 + outPercent / 100) + 100 > balance) {
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
    return await ctx.reply("Lütfen kart numarası girin.");
  }

  // Если не ввели номер карточки
  if (!ctx.session.state.wallet) {
    if (!isNumber(+msg.trim()))
      return await ctx.reply("Lütfen yalnızca sayı girin");

    ctx.session.state = {
      ...ctx.session.state,
      wallet: +msg.trim(),
    };
    return await ctx.reply(
      `Lütfen kart üzerindeki isim ve soyisimi girin.`
    );
  }

  // Ввели данные юзера
  ctx.session.state = {
    ...ctx.session.state,
    userInfo: msg.trim().split(" ", 2), // max two value
    activeMsg: await ctx.reply(
      `Tutarı çekmek üzeresiniz ${
        ctx.session.state.amount
      } TL kart numarasına ${ctx.session.state.wallet}.
Alıcı: ${msg}.
Kalan Bakiyeniz görüntülenecek: ${
        ctx.session.state.amount * (1.02 + outPercent / 100) + 100
      }
Ödemeyi yapmak için lütfen sohbete "Onayla" yazın.`
    ),
  };
});

module.exports = { outCardOther };