const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");
const isNumber = require("is-number");
const request = require("request");

const MainStats = require("../models/mainstats");

const inMoney = new Scene("inMoney");
inMoney.enter(async (ctx) => {
  const { minIn } = await MainStats.findOne();

  return await ctx.reply(
    `Yenileme miktarını seçin.
Yenileme için minimum miktar: ${minIn} TL`,
    Extra.markup(
      Markup.keyboard([
        ["50TL", "100TL", "500TL", "1000TL"],
        ["↪️ geri gelmek"],
      ]).resize()
    )
  );
});

inMoney.hears(/(?:50TL|100TL|500TL|1000TL)/, async (ctx) => {
  const amount = +ctx.update.message.text.replace("TL", "");
  const comment = ctx.from.id;

  const account = "P1051197168";
  const apiId = "1407343849";
  const apiPass = "1234";
  const m_shop = "1405684803";

  const dataInvoice = {
    account,
    apiId,
    apiPass,
    action: "invoiceCreate",
    m_shop,
    m_orderid: "121331",
    m_amount: amount,
    m_curr: "USD",
    m_desc: comment,
  };

  const url = await req(dataInvoice);

  await ctx.scene.enter("lkMenu");

  return await ctx.reply(
    `Oyun dengesini yenileyeceksiniz ${amount} TL.
Lütfen yenileme sayfasına gitmek için "Doldurmak" düğmesine tıklayın.`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Doldurmak",
              url: url,
            },
          ],
        ],
      },
    }
  );
});

inMoney.on("text", async (ctx) => {
  const msg = ctx.update.message.text;

  if (msg === "↪️ geri gelmek") {
    return await ctx.scene.enter("lkMenu");
  }

  const amount = +ctx.update.message.text.replace(/\D+/, "").trim();

  const { minIn } = await MainStats.findOne();

  if (isNumber(amount)) {
    if (amount < minIn) {
      return await ctx.reply(`Yenilecek minimum miktar ${minIn} TL`);
    }

    const account = "P1051197168";
    const apiId = "1407343849";
    const apiPass = "1234";
    const m_shop = "1405684803";
    const comment = ctx.from.id;

    const dataInvoice = {
      account,
      apiId,
      apiPass,
      action: "invoiceCreate",
      m_shop,
      m_orderid: "121331",
      m_amount: amount,
      m_curr: "USD",
      m_desc: comment,
    };

    const url = await req(dataInvoice);

    await ctx.scene.enter("lkMenu");

    return await ctx.reply(
      `Oyun dengesini yenileyeceksiniz ${amount} TL.
Lütfen yenileme sayfasına gitmek için "Doldurmak" düğmesine tıklayın.`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Doldurmak",
                url: url,
              },
            ],
          ],
        },
      }
    );
  } else {
    return await ctx.reply("Uygun olmayan bir numara girdiniz.Tekrar deneyin.");
  }
});

function req(data) {
  return new Promise((resolve, reject) => {
    request(
      {
        method: "POST",
        url: "https://payeer.com/ajax/api/api.php?invoiceCreate",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `account=${data.account}&apiId=${data.apiId}&apiPass=${data.apiPass}&action=invoiceCreate&m_shop=${data.m_shop}&m_orderid=${data.m_orderid}&m_amount=${data.m_amount}&m_curr=USD&m_desc=${data.m_desc}`,
      },
      function (error, response, body) {
        const data = JSON.parse(body);
        resolve(data.url);
      }
    );
  });
}

module.exports = { inMoney };
