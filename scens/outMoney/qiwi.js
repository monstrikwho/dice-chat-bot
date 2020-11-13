const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");
const User = require("../../models/user");
const axios = require("axios");

// *************************** STEP 1 *******************************************
const outQiwi = new Scene("outQiwi");
outQiwi.enter(async (ctx) => {
  const user = await User.findOne({ userId: ctx.from.id });
  ctx.session.state = {
    mainBalance: user.mainBalance,
  };
  return await ctx.reply(
    `Минималка на вывод 50р. Введите сумму вывода (цифру)`,
    Extra.markup(Markup.keyboard([["↪️ Вернуться назад"]]).resize())
  );
});

outQiwi.on("text", async (ctx) => {
  const count = +ctx.update.message.text.replace(/\D+/, "");
  const balance = ctx.session.state.mainBalance;

  if (!Boolean(count)) return ctx.reply("Пожалуйста, введите только цифры.");
  if (count < 50) return ctx.reply("Минимальный вывода 50р.");
  if (count > balance)
    return ctx.reply("У вас недостаточно средств на балансе.");

  await axios.post(`https://edge.qiwi.com/sinap/api/v2/terms/99/payments`, {
    id: "14307129087409127509712409",
    sum: {
      amount: 1,
      currency: "643",
    },
    paymentMethod: {
      type: "Account",
      accountId: "643",
    },
    comment: ctx.from.id,
    fields: {
      account: "+79206020622",
    },
  });

  console.log(count);
});

outQiwi.hears("↪️ Вернуться назад", ({ scene }) => {
  scene.enter("lkMenu");
});

module.exports = { outQiwi };
