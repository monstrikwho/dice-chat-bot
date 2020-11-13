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
const visaOther = new Scene("visaOther");
visaOther.enter(async (ctx) => {
  const user = await User.findOne({ userId: ctx.from.id });
  ctx.session.state = {
    mainBalance: user.mainBalance,
  };
  return await ctx.reply(
    `Минималка на вывод 50р. Введите сумму вывода (цифру)`,
    Extra.markup(Markup.keyboard([["↪️ Вернуться назад"]]).resize())
  );
});

visaOther.on("text", async (ctx) => {
  const count = +ctx.update.message.text.replace(/\D+/, "");
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


  await axios
    .post(`https://edge.qiwi.com/sinap/api/v2/terms/1960/payments`, obj)
    .then((res) => console.log(res))
    // .catch((err) => console.log(err.message));

  console.log(count);
});

visaOther.hears("↪️ Вернуться назад", ({ scene }) => {
  scene.enter("lkMenu");
});

module.exports = { visaOther };
