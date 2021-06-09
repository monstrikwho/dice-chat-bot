const { bot } = require("../init/startBot");

const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const isNumber = require("is-number");

const MainStats = require("../models/mainstats");

const inMoney = new Scene("inMoney");
inMoney.enter(async (ctx) => {
  const { minIn, minOut } = await MainStats.findOne();

  ctx.session.state.activeMsg = await ctx.reply(
    `Aşağıdaki tutarlardan birini seçin ya da dilediğiniz tutarı girin.

Minimum: ${minIn} TL

Çekebileceğiniz minimum tutar: ${minOut} TL`,
    Extra.markup(
      Markup.keyboard([
        ["25 TL", "50 TL", "100 TL", "500 TL"],
        ["↪️ Geri"],
      ]).resize()
    )
  );
});

inMoney.hears(/(?:25 TL|50 TL|100 TL|500 TL)/, async (ctx) => {
  const amount = +ctx.update.message.text.replace(" TL", "");

  const url = `https://donatty.com/zarouyntg`;
  const { TRYRUB, orderStats, exchangeCoef } = await MainStats.findOne();

  const exchange = Math.ceil(amount * TRYRUB * (1 + 0.01 * exchangeCoef));

  await ctx.scene.enter("lkMenu");

  if (Boolean(+process.env.DEV)) {
    ctx.session.state.photoMsg = await bot.telegram.sendPhoto(
      ctx.from.id,
      "AgACAgIAAxkBAAIJMWC_wOK5aTTde4wFb6ggU1HhcrG1AAISszEbR2sAAUpd4sWEfESsOGogA54uAAMBAAMCAANzAAMQ6AQAAR8E"
    );
  } else {
    ctx.session.state.photoMsg = await bot.telegram.sendPhoto(
      ctx.from.id,
      "AgACAgIAAxkBAAIzxmC_wKo6yL6GQ_391gE9KQjpsO9DAAKrszEbF9MAAUqQdIp60IgyE27xEqQuAAMBAAMCAANzAAM3KAIAAR8E"
    );
  }

  await MainStats.updateOne({}, { $inc: { "orderStats.lastNumberOrder": 1 } });

  await ctx.reply(
    `${amount} TL tutarı hesabınıza aktarmak için aşağıdaki adımları izleyin.

1) Kullanıcı adınız ➖ ${
      ctx.from.username ? ctx.from.username : ctx.from.first_name
    }
2) Aktarmak istediğiniz tutar ➖ ${exchange} (Rus Rublesi)
3) Notunuz ➖ ${
      !ctx.from.username ? ctx.from.id : "Dilerseniz boş bırakabilirsiniz"
    }

Yazdığınız miktar güncel Rus Rublesi  döviz kuru üzerinden sayılır, ancak bankanız ek ücret uygulayabilir (genellikle %5'ten az)

Ödemenizi gerçekleştirmek için 24 saatiniz olacak. Eğer ödemeniz 24 saat içinde gerçekleşmezse işleminiz iptal edilecektir.

Destek: @ZAR_destek

Lütfen ödemenizi gerçekleştirdikten sonra Bot'a dönüp "Ödedim"e tıklayın.👇`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `Ödemeye devam et #${orderStats.lastNumberOrder + 1}`,
              url: url,
            },
          ],
          [
            {
              text: "Iptal",
              callback_data: "Iptal",
            },
            {
              text: "Odedim",
              callback_data: `order:${orderStats.lastNumberOrder + 1}:${
                ctx.from.id
              }:${amount}:${exchange}`,
            },
          ],
        ],
      },
    }
  );

  return;
});

inMoney.on("text", async (ctx) => {
  const msg = ctx.update.message.text;

  if (msg === "↪️ Geri") {
    try {
      await ctx.deleteMessage(ctx.session.state.photoMsg.message_id);
    } catch (error) {}
    return await ctx.scene.enter("lkMenu");
  }

  const amount = +ctx.update.message.text.replace(/\D+/, "").trim();

  if (!isNumber(ctx.update.message.text)) {
    return await ctx.reply(
      "Uygun olmayan bir numara girdiniz. Tekrar deneyin."
    );
  }

  const url = `https://donatty.com/zarouyntg`;
  const { minIn, TRYRUB, orderStats, exchangeCoef } = await MainStats.findOne();

  if (amount < minIn) {
    return await ctx.reply(`Yenilecek minimum miktar ${minIn} TL`);
  }

  try {
    await ctx.deleteMessage(ctx.session.state.activeMsg.message_id);
  } catch (error) {}

  const exchange = Math.ceil(amount * TRYRUB * (1 + 0.01 * exchangeCoef));

  await ctx.scene.enter("lkMenu");

  if (Boolean(+process.env.DEV)) {
    ctx.session.state.photoMsg = await bot.telegram.sendPhoto(
      ctx.from.id,
      "AgACAgIAAxkBAAIJMWC_wOK5aTTde4wFb6ggU1HhcrG1AAISszEbR2sAAUpd4sWEfESsOGogA54uAAMBAAMCAANzAAMQ6AQAAR8E"
    );
  } else {
    ctx.session.state.photoMsg = await bot.telegram.sendPhoto(
      ctx.from.id,
      "AgACAgIAAxkBAAIzxmC_wKo6yL6GQ_391gE9KQjpsO9DAAKrszEbF9MAAUqQdIp60IgyE27xEqQuAAMBAAMCAANzAAM3KAIAAR8E"
    );
  }

  await MainStats.updateOne({}, { $inc: { "orderStats.lastNumberOrder": 1 } });

  await ctx.reply(
    `${amount} TL tutarı hesabınıza aktarmak için aşağıdaki adımları izleyin.

1) Kullanıcı adınız ➖ ${
      ctx.from.username ? ctx.from.username : ctx.from.first_name
    }
2) Aktarmak istediğiniz tutar ➖ ${exchange} (Rus Rublesi)
3) Notunuz ➖ ${
      !ctx.from.username ? ctx.from.id : "Dilerseniz boş bırakabilirsiniz"
    }

Yazdığınız miktar güncel Rus Rublesi  döviz kuru üzerinden sayılır, ancak bankanız ek ücret uygulayabilir (genellikle %5'ten az)

Ödemenizi gerçekleştirmek için 24 saatiniz olacak. Eğer ödemeniz 24 saat içinde gerçekleşmezse işleminiz iptal edilecektir.

Destek: @ZAR_destek

Lütfen ödemenizi gerçekleştirdikten sonra Bot'a dönüp "Ödedim"e tıklayın.👇`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `Ödemeye devam et #${orderStats.lastNumberOrder + 1}`,
              url: url,
            },
          ],
          [
            {
              text: "Iptal",
              callback_data: "Iptal",
            },
            {
              text: "Odedim",
              callback_data: `order:${orderStats.lastNumberOrder + 1}:${
                ctx.from.id
              }:${amount}:${exchange}`,
            },
          ],
        ],
      },
    }
  );

  return;
});

module.exports = { inMoney };
