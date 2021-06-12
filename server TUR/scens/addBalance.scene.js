const { bot } = require("../init/startBot");

const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");
const MainStats = require("../models/mainstats");
const Order = require("../models/order");

const moment = require("moment");
const isNumber = require("is-number");

const addBalance = new Scene("addBalance");
addBalance.enter(async (ctx) => {
  await ctx.reply(
    `Пожалуйста, введите данные в формате:
m:(uid||userName):amount

Example:
m:364984576:1000 (основной счет)
d:364984576:1000 (демо-счет)`,
    Extra.markup(Markup.keyboard([["↪️ Вернуться назад"]]).resize())
  );
});

addBalance.hears("↪️ Вернуться назад", async ({ scene }) => {
  return await scene.enter("moderMenu");
});

addBalance.on("text", async (ctx) => {
  const msg = ctx.update.message.text;

  const type = msg.split(":")[0].toLowerCase();
  const link = msg.split(":")[1].toLowerCase();
  const amount = +msg.split(":")[2];

  if (type !== "m" && type !== "d") {
    return await ctx.reply("Вы неверно указали данные (тип баланса)");
  }

  const user = isNumber(+link)
    ? await User.findOne({ userId: link })
    : await User.findOne({ userName: link });

  if (!user) {
    return ctx.reply(`Пользователь ${link} не был найден.
Пожалуйста, введите данные заново.`);
  }

  if (!isNumber(amount) || amount < 1) {
    return ctx.reply(`Вы некорректно ввели сумму.
Пожалуйста, введите данные заново.`);
  }

  if (type === "m") {
    const { orderStats, bonusRefPercent } = await MainStats.findOne();

    // Обновляем общую статистику пополнений
    await MainStats.updateOne(
      {},
      {
        $inc: {
          "orderStats.lastNumberOrder": 1,
          "orderStats.countInOrder": 1,
          "orderStats.amountInMoney": +(
            orderStats.amountInMoney + amount
          ).toFixed(2),
        },
      }
    );

    // Зачисляем баланс юзеру
    await User.updateOne(
      { userId: user.userId },
      { mainBalance: +(user.mainBalance + amount).toFixed(2) }
    );

    // Отправляем сообщение юзеру
    await bot.telegram.sendMessage(
      user.userId,
      `${amount} TL ana hesabınıza aktarıldı.`
    );

    await ctx.reply(`Вы успешно начислили баланс!
Игровой баланс: основной
Сумма: ${amount} TL
Пользователь: ${user.userId} ${user.userName ? `@${user.userName}` : ""}
Текущий баланс: ${(user.mainBalance + amount).toFixed(2)} TL`);

    // Если это реферал, начисляем процент пригласившему
    if (user.isRef !== 0) {
      const { mainBalance, refCash } = await User.findOne({
        userId: user.isRef,
      });

      // Начисляем процент пополениня пригласившему реферала
      await User.updateOne(
        { userId: user.isRef },
        {
          mainBalance: +(
            mainBalance +
            (amount * bonusRefPercent) / 100
          ).toFixed(2),
          refCash: +(refCash + (amount * bonusRefPercent) / 100).toFixed(2),
        }
      );

      // Отправляем сообщение пригласившему
      await bot.telegram.sendMessage(
        user.isRef,
        `Ana hesabınız kayıtlı ${((amount * bonusRefPercent) / 100).toFixed(
          2
        )} TL İstenen sevk için.`
      );
    }

    // Сохраняем ордер
    const order = new Order({
      id: orderStats.lastNumberOrder + 1,
      status: "IN",
      amount,
      userId: user.userId,
      date: moment().format("YYYY-MM-DD"),
    });
    await order.save();
  }

  if (type === "d") {
    // Зачисляем баланс юзеру
    await User.updateOne(
      { userId: user.userId },
      { demoBalance: +(user.demoBalance + amount).toFixed(2) }
    );

    // Отправляем сообщение юзеру
    await bot.telegram.sendMessage(
      user.userId,
      `${amount} TL demo hesabınıza aktarıldı.`
    );

    await ctx.reply(`Вы успешно начислили баланс!
Игровой баланс: демо
Пользователь: ${user.userId} ${user.userName ? `@${user.userName}` : ""}
Сумма: ${amount} TL
Текущий баланс: ${(user.demoBalance + amount).toFixed(2)} TL`);
  }
});

module.exports = { addBalance };
