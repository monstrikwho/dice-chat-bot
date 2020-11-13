const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");
const User = require("../../models/user");
const axios = require("axios");
const querystring = require('querystring')


axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common["Accept"] = "application/json";
axios.defaults.headers.common[
  "Authorization"
] = `Bearer ${process.env.QIWI_TOKEN}`;
axios.defaults.headers.post["User-Agent"] = "Android v3.2.0 MKT";

// *************************** STEP 1 *******************************************
const outQiwi = new Scene("outQiwi");
outQiwi.enter(async (ctx) => {
  const user = await User.findOne({ userId: ctx.from.id });
  ctx.session.state = {
    mainBalance: user.mainBalance,
  };
  return await ctx.reply(
    `Минималка на вывод 50р + 2% комиссии. Введите сумму вывода (цифру)`,
    Extra.markup(Markup.keyboard([["↪️ Вернуться назад"]]).resize())
  );
});

outQiwi.on("text", async (ctx) => {
  const msg = ctx.update.message.text;
  if (msg === "↪️ Вернуться назад") {
    return await ctx.scene.enter("lkMenu");
  }

  const count = +msg.replace(/\D+/, "");
  const balance = ctx.session.state.mainBalance;

  // if (!Boolean(count)) return ctx.reply("Пожалуйста, введите только цифры.");
  // if (count < 50) return ctx.reply("Минимальный вывода 50р.");
  // if (count > balance)
  //   return ctx.reply("У вас недостаточно средств на балансе.");

  const obj = {
    id: "732095792752052023985",
    sum: {
      amount: 1,
      currency: "643",
    },
    paymentMethod: {
      type: "Account",
      accountId: "643",
    },
    comment: "sdfsdf",
    fields: {
      account: "+79206020622",
    },
  };

  await axios
    .post(`https://edge.qiwi.com/sinap/api/v2/terms/99/payments`, querystring.stringify(obj))
    .then((res) => console.log(res));
  // .catch((err) => console.log(err.message));

  console.log(count);
});

outQiwi.hears("↪️ Вернуться назад", ({ scene }) => {
  scene.enter("lkMenu");
});

module.exports = { outQiwi };
