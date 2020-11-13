const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");
const User = require("../../models/user");

// *************************** STEP 1 *******************************************
const outQiwi = new Scene("outQiwi");
outQiwi.enter(async (ctx) => {
  const user = await User.findOne({ userId: ctx.from.id });
  ctx.session.state = {
    mainBalance: user.mainBalance,
  };
  return await ctx.reply(
    `Ваш баланс: ${user.mainBalance}
Минималка на вывод 50р. Введите сумму вывода (цифру)`,
    Extra.markup(Markup.keyboard([["↪️ Вернуться назад"]]).resize())
  );
});

outQiwi.on("text", async (ctx) => {
  const count = +ctx.update.message.text.replace(/\D+/, "");
  const balance = ctx.session.state.mainBalance

  if (!Boolean(count)) return ctx.reply("Пожалуйста, введите только цифры.");
  if (count < 50) return ctx.reply("Минимальный вывода 50р.");
  if (count > balance)
    return ctx.reply("У вас недостаточно средств на балансе.");

  
  console.log(count);
});

outQiwi.hears("↪️ Вернуться назад", ({ scene }) => {
  scene.enter("lkMenu");
});

module.exports = { outQiwi };
