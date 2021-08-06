require("dotenv").config();
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");
const session = require("telegraf/session");
const axios = require("axios");
const isNumber = require("is-number");
const moment = require("moment");

const Payments = require("./models/payments");

// Init
const server = require("./init/setupServer");
const { bot, startBot } = require("./init/startBot");
const setupMongoose = require("./init/setupMongoose");

// Init
startBot();
setupMongoose();
bot.use(session());

bot.start(async (ctx) => {
  if (ctx.from.id !== 1061660155 && ctx.from.id !== 364984576) return;
  ctx.session.action = "start";

  try {
    await ctx.deleteMessage(ctx.session.activeBoard.message_id);
  } catch (error) {}

  await ctx.reply(
    "Да да я",
    Extra.markup(Markup.keyboard([["TOKEN", "Пополнить", "Вывести"]]).resize())
  );
});

bot.hears("TOKEN", async (ctx) => {
  ctx.session.action = "token";

  try {
    await ctx.deleteMessage(ctx.session.activeBoard.message_id);
  } catch (error) {}

  const { token, upd } = await Payments.findOne();
  ctx.session.activeBoard = await ctx.reply(
    `Текущий токен:
${token}

Обновлен: ${upd}`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `Изменить`,
              callback_data: `change_token`,
            },
          ],
        ],
      },
    }
  );
});

bot.hears("Пополнить", async (ctx) => {
  ctx.session.action = "inmoney";

  try {
    await ctx.deleteMessage(ctx.session.activeBoard.message_id);
  } catch (error) {}

  ctx.session.activeBoard = await ctx.reply(
    `Введите в чат сумму для пополенния`
  );
});

bot.hears("Вывести", async (ctx) => {
  ctx.session.action = "outmoney";
  ctx.session.step = 1;

  try {
    await ctx.deleteMessage(ctx.session.activeBoard.message_id);
  } catch (error) {}

  ctx.session.activeBoard = await ctx.reply(`Введите сумму для вывода (КИВИ)`);
});

bot.action("change_token", async (ctx) => {
  ctx.session.action = "change_token";
  const { activeBoard } = ctx.session;

  await bot.telegram.editMessageText(
    ctx.from.id,
    activeBoard.message_id,
    null,
    "Введите новый токен в чат"
  );
});

bot.action("money_out", async (ctx) => {
  ctx.session.action = "money_out";
  const { activeBoard, amount, number } = ctx.session;

  await outMoney(amount, ctx.from.id);

  await bot.telegram.editMessageText(
    ctx.from.id,
    activeBoard.message_id,
    null,
    `ПЛАТЕЖ В ОБРАБОТКЕ

Сумма: ${amount}P
Номер: ${number}`
  );
});

bot.on("text", async (ctx) => {
  const { action, activeBoard, step } = ctx.session;

  if (action === "change_token") {
    const token = ctx.update.message.text;

    axios.defaults.headers.common["Accept"] = "application/json";
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const { hookId, hookUrl } = await Payments.findOne();

    await deleteActiveHook(hookId);
    const newHookId = await setWebHook(hookUrl);
    const wallet = await getProfileWallet();

    if (!newHookId || !wallet) {
      await ctx.reply("Что-то не сходиться.. Токен не был установлен.");
      return;
    }

    await Payments.updateOne(
      {},
      {
        wallet,
        hookId: newHookId,
        token,
        upd: moment().format("DD.MM.YYYY HH:mm:ss"),
      }
    );

    try {
      await ctx.deleteMessage(activeBoard.message_id);
    } catch (error) {}

    await ctx.reply("Вы успешно изменили токен!");
  }

  if (action === "inmoney") {
    const amount = ctx.update.message.text;

    if (!isNumber(amount)) {
      await ctx.reply("Вы ввели некорректную сумму");
    }

    const { wallet } = await Payments.findOne();
    const url = `https://qiwi.com/payment/form/99?extra%5B%27account%27%5D=${wallet}&amountInteger=${amount}&amountFraction=0&extra%5B%27comment%27%5D=${ctx.from.id}&currency=643&blocked[0]=sum&blocked[1]=account&blocked[2]=comment`;

    await bot.telegram.editMessageText(
      ctx.from.id,
      activeBoard.message_id,
      null,
      "Ваша ссылка для пополнения",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Пополнить QIWI",
                url,
              },
            ],
          ],
        },
      }
    );

    ctx.session.action = "start";
  }

  if (action === "outmoney" && step === 1) {
    const amount = ctx.update.message.text;

    if (!isNumber(amount)) {
      await ctx.reply("Вы ввели некорректную сумму");
    }

    await bot.telegram.editMessageText(
      ctx.from.id,
      activeBoard.message_id,
      null,
      `Введите номер (без знака +)
      
Ваши данные:
Сумма: ${amount}P
Номер: ???`
    );

    ctx.session.amount = amount;
    ctx.session.step = 2;
  }

  if (action === "outmoney" && step === 2) {
    const amount = ctx.session.amount;
    const number = ctx.update.message.text;

    if (!isNumber(number)) {
      await ctx.reply("Вы ввели некорректный номер");
    }

    await bot.telegram.editMessageText(
      ctx.from.id,
      activeBoard.message_id,
      null,
      `Все верно?

Ваши данные:
Сумма: ${amount} P
Номер: ${number}`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Сделать вывод",
                callback_data: `money_out`,
              },
            ],
          ],
        },
      }
    );

    ctx.session.step = 0;
    ctx.session.action = "start";
    ctx.session.number = number;
  }
});

var setWebHook = async (hookUrl) => {
  // Установить вебхук
  return await axios
    .put(
      `https://edge.qiwi.com/payment-notifier/v1/hooks?hookType=1&param=https%3A%2F%2Fdice-bots.ru/payments/${hookUrl}%2F&txnType=2`
    )
    .then((res) => res.data.hookId)
    .catch((err) => console.log(err.message));
};

var deleteActiveHook = async (hookId) => {
  // Удалить вебхук
  return await axios
    .delete(`https://edge.qiwi.com/payment-notifier/v1/hooks/${hookId}`)
    .then((res) => res.data.response)
    .catch((err) => {
      console.log(err.message);
    });
};

var getProfileWallet = async () => {
  return await axios
    .get(`https://edge.qiwi.com/person-profile/v1/profile/current`)
    .then((res) => res.data.authInfo.personId)
    .catch((err) => console.log(err.message));
};

var outMoney = async (amount, userId) => {
  const { token, wallet } = await Payments.findOne();

  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  // Перевод на кошелек киви
  const obj = {
    id: Math.round(new Date().getTime() / 1000).toString(), // макс длина 20 цифр. идшник должен быть разным
    sum: {
      amount,
      currency: "643",
    },
    paymentMethod: {
      type: "Account",
      accountId: "643",
    },
    fields: {
      account: wallet,
    },
    comment: userId.toString(),
  };

  await axios
    .post(`https://edge.qiwi.com/sinap/api/v2/terms/99/payments`, obj)
    .then((res) => res.data)
    .catch(async (err) => {
      await bot.telegram.sendMessage(
        userId,
        "Проверьте правильность введенных данных"
      );
    });
};
