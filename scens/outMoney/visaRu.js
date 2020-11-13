const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");
const User = require("../../models/user");
const axios = require("axios");

axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common["Accept"] = "application/json";
axios.defaults.headers.common[
  "Authorization"
] = `Bearer ${process.env.QIWI_TOKEN}`;
axios.defaults.headers.post["Host"] = "edge.qiwi.com";

// *************************** STEP 1 *******************************************
const visaRu = new Scene("visaRu");
visaRu.enter(async (ctx) => {
  const user = await User.findOne({ userId: ctx.from.id });
  ctx.session.state = {
    mainBalance: user.mainBalance,
  };
  return await ctx.reply(
    `Минималка на вывод 50р + коммисия 2% и 50р. Введите сумму вывода (цифру)`,
    Extra.markup(Markup.keyboard([["↪️ Вернуться назад"]]).resize())
  );
});

visaRu.on("text", async (ctx) => {
  const msg = ctx.update.message.text
  if(msg === '↪️ Вернуться назад') {
    return await ctx.scene.enter('lkMenu')
  }

  const count = +msg.replace(/\D+/, "");
  const balance = ctx.session.state.mainBalance;

  // if (!Boolean(count)) return ctx.reply("Пожалуйста, введите только цифры.");
  // if (count < 50) return ctx.reply("Минимальный вывода 50р.");
  // if (count > balance)
  //   return ctx.reply("У вас недостаточно средств на балансе.");

  const obj = {
    "id":"2113132480274343",
    "sum": {
          "amount":1,
          "currency":"643"
    },
    "paymentMethod": {
        "type":"Account",
        "accountId":"643"
    },
    "fields": {
        "account": "4255190103543289",
        "rec_address": "Ленинский проспект 131, 56",
        "rec_city": "Москва",
        "rec_country": "Россия",
        "reg_name": "Никита",
        "reg_name_f": "Концевич",
        "rem_name": "Александр",
        "rem_name_f": "Тарасюк"
    }
  }
  return await axios
    .post(`https://edge.qiwi.com/sinap/providers/1963/onlineCommission`, {
      account: "79206020622",
      paymentMethod: {
        type: "Account",
        accountId: "643",
      },
      purchaseTotals: {
        total: {
          amount: 1,
          currency: "643",
        },
      },
    })
    .then((res) => console.log(res.data.qwCommission.amount))
    .catch((err) => console.log(err.message));


  await axios
    .post(`https://edge.qiwi.com/sinap/api/v2/terms/1963/payments`, obj)
    .then((res) => console.log(res))
    // .catch((err) => console.log(err.message));

  console.log(count);
});

module.exports = { visaRu };
