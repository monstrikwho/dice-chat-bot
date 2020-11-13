const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");
const User = require("../../models/user");

// *************************** STEP 1 *******************************************
const outQiwi = new Scene("outQiwi");
outQiwi.enter(async (ctx) => {
  const user = await User.findOne({ userId: ctx.from.id });
  ctx.session.state = {
    mainBalance: ctx.mainBalance,
  };
  return await ctx.reply(
    `Ваш баланс: ${user.mainBalance}
Минималка на вывод 50р. Введите сумму вывода (цифру)`,
    Extra.markup(Markup.keyboard([["↪️ Вернуться назад"]]).resize())
  );
});

outQiwi.on("text", (ctx) => {
  const count = +ctx.update.message.text.replace(/\D+/, "");
  const balance = ctx.session.state.mainBalance;
  if (!Boolean(count)) return ctx.reply("Пожалуйста, введите только цифры.");
  if (count < 50 || count > balance) return ctx.reply("У вас недостаточно средств на балансе.");
  if (balance - count < 50)
    return ctx.reply("У вас недостаточно средств, чтобы ввывести такую сумму.");
  console.log(count);
});

outQiwi.hears("↪️ Вернуться назад", ({ scene }) => {
  scene.enter("lkMenu");
});

module.exports = { outQiwi };
