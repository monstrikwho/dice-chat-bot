const Scene = require("telegraf/scenes/base");

const User = require("../models/user");
const MainStats = require("../models/mainstats");
const Payeer = require("../models/payeer");
const Banker = require("../models/banker");

const { client, Api } = require("../init/telegram");
const { bot } = require("../init/startBot");
const { mainMenuActions } = require("./mainMenu.scene");
const { getProfileBalance, outMoney } = require("../helpers/qiwiMethods");

const axios = require("axios");
const moment = require("moment");
const isNumber = require("is-number");
const random = require("random-bigint");
const querystring = require("querystring");
axios.defaults.headers.common["Content-Type"] =
  "application/x-www-form-urlencoded";

const lkMenu = new Scene("lkMenu");
mainMenuActions(lkMenu);

lkMenu.enter(async (ctx) => {
  await MainMenu(ctx);
});

lkMenu.leave((ctx) => {
  const state = ctx.session.state;
  delete state.amount;
  delete state.qiwi;
  delete state.cardsRu;
  delete state.cardsOther;
  delete state.confirmStatus;
  delete state.selectBalance;
  delete state.outAmount;
  delete state.userCard;
  delete state.userBio;
  delete state.type;
  delete state.activeView;
  delete state.accessibleBalance;
  ctx.session.state = state;
});

lkMenu.action("Пополнить", async (ctx) => {
  ctx.session.state.activeView = "inMoney";
  const { activeBoard } = ctx.session.state;

  const { minIn } = await MainStats.findOne({});

  const extra = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "50₽",
            callback_data: "in50₽",
          },
          {
            text: "100₽",
            callback_data: "in100₽",
          },
          {
            text: "250₽",
            callback_data: "in250₽",
          },
          {
            text: "500₽",
            callback_data: "in500₽",
          },
        ],
        [
          {
            text: "↪️ Вернуться назад",
            callback_data: "↪️ Вернуться назад",
          },
        ],
      ],
    },
  };

  try {
    await bot.telegram.editMessageText(
      ctx.from.id,
      activeBoard.message_id,
      null,
      `Выберите либо введите в чат сумму пополнения
Минимальная сумма для пополнения: ${minIn} ₽

❕Пополнение начисляется автоматически
❕Для пополнение через Banker, отправьте BTC (RUB) чек в чат`,
      extra
    );
  } catch (error) {}
});

lkMenu.action("Вывести", async (ctx) => {
  await OutMoneyMenu(ctx);
});

const regex =
  /(?:Qiwi \(RUB\)|Visa \(RU\)|Visa \(Other\)|MC \(RU\)|MC \(Other\)|Payeer \(RUB\))/;
lkMenu.action(regex, async (ctx) => {
  ctx.session.state.activeView = "outMoney";
  const { activeBoard, accessibleBalance } = ctx.session.state;
  const type = ctx.update.callback_query.data;
  ctx.session.state.type = type;

  let balance = null;

  if (type === "Qiwi (RUB)") {
    ctx.session.state.idProvider = 99;
    balance = accessibleBalance.qiwi;
  }
  if (type === "Visa (RU)") {
    ctx.session.state.idProvider = 1963;
    balance = accessibleBalance.cardsRu;
  }
  if (type === "Visa (Other)") {
    ctx.session.state.idProvider = 1960;
    balance = accessibleBalance.cardsOther;
  }
  if (type === "MC (RU)") {
    ctx.session.state.idProvider = 21013;
    balance = accessibleBalance.cardsRu;
  }
  if (type === "MC (Other)") {
    ctx.session.state.idProvider = 21012;
    balance = accessibleBalance.cardsOther;
  }
  if (type === "Payeer (RUB)") {
    ctx.session.state.idProvider = 999;
    balance = accessibleBalance.qiwi;
  }
  ctx.session.state.selectBalance = balance;

  try {
    await bot.telegram.editMessageText(
      ctx.from.id,
      activeBoard.message_id,
      null,
      `Напишите в чат сумму

Вывод на ${type}
Ваш доступный для вывода баланс: ${balance}`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "↪️ Вернуться назад",
                callback_data: "↪️ Вернуться назад",
              },
            ],
          ],
        },
      }
    );
  } catch (error) {}
});

lkMenu.action(/(?:in50₽|in100₽|in250₽|in500₽)/, async (ctx) => {
  const amount = +ctx.update.callback_query.data.replace(/\D+/g, "");
  const comment = ctx.from.id;

  const { webhook } = await MainStats.findOne({});

  const urlQiwi = `https://qiwi.com/payment/form/99?extra%5B%27account%27%5D=${webhook.qiwiWallet}&amountInteger=${amount}&amountFraction=0&extra%5B%27comment%27%5D=${comment}&currency=643&blocked[0]=sum&blocked[1]=account&blocked[2]=comment`;
  const urlPayeer = await axios
    .post(
      "https://payeer.com/ajax/api/api.php?invoiceCreate",
      querystring.stringify({
        account: "P1051197168",
        apiId: 1407343849,
        apiPass: 1234,
        action: "invoiceCreate",
        m_shop: 1405684803,
        m_orderid: ctx.from.id,
        m_amount: amount,
        m_curr: "RUB",
        m_desc: ctx.from.id,
      })
    )
    .then((res) => res.data.url)
    .catch((err) => console.log(err.message));

  try {
    await ctx.deleteMessage(ctx.session.state.activeBoard.message_id);
  } catch (error) {}

  try {
    await ctx.reply(
      `Вы собираетесь пополнить игровой баланс на сумму ${amount} ₽.
Пожалуйста, нажмите "Пополнить", чтобы перейти на страницу пополнения.

Что бы пополнить баланс, совершите рублёвый перевод на желанную сумму (QIWI)
▪️ Кошелёк: +${webhook.qiwiWallet}
▪️ Комментарий к переводу: ${comment}`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Пополнить QIWI",
                url: urlQiwi,
              },
              {
                text: "Пополнить PAYEER",
                url: urlPayeer,
              },
            ],
          ],
        },
      }
    );
  } catch (error) {}
});

lkMenu.action("↪️ Вернуться назад", async (ctx) => {
  try {
    const { activeView } = ctx.session.state;

    if (activeView === "inMoney") {
      return await MainMenu(ctx);
    }
    if (activeView === "preOutMoney") {
      return await MainMenu(ctx);
    }
    if (activeView === "outMoney") {
      ctx.session.state = {
        ...ctx.session.state,
        selectBalance: null,
        outAmount: null,
        idProvider: null,
        userCard: null,
        userBio: null,
        type: null,
      };
      return await OutMoneyMenu(ctx);
    }
  } catch (error) {}
});

lkMenu.action("✅ Подтвердить", async (ctx) => {
  const { confirmStatus, activeBoard } = ctx.session.state;

  if (confirmStatus) return;
  ctx.session.state.confirmStatus = true;

  try {
    await ctx.deleteMessage(activeBoard.message_id);
  } catch (error) {}

  const { outAmount, idProvider, qiwiWallet, userCard, userBio, payeerWallet } =
    ctx.session.state;

  if (idProvider === 99) {
    await outMoney(outAmount, qiwiWallet, ctx.from.id, 99);
  }

  if (idProvider === 999) {
    await axios
      .post(
        "https://payeer.com/ajax/api/api.php?payout",
        querystring.stringify({
          account: "P1051197168",
          apiId: 1407343849,
          apiPass: 1234,
          action: "payout",
          ps: 1136053,
          sumOut: outAmount,
          curIn: "RUB",
          curOut: "RUB",
          param_ACCOUNT_NUMBER: payeerWallet,
        })
      )
      .then(async (res) => {
        if (!res.data.errors) {
          const { outPercent } = await MainStats.findOne();
          const { mainBalance } = await User.findOne({ userId: ctx.from.id });

          const amount = outAmount * (1 + outPercent / 100);

          await User.updateOne(
            { userId: ctx.from.id },
            { mainBalance: +(mainBalance - amount).toFixed(2) }
          );

          const order = new Payeer({
            m_amount: amount,
            m_desc: ctx.from.id,
            m_operation_date: moment().format("DD.MM.YYYY HH:mm:ss"),
            m_curr: "RUB",
            type: "OUT",
          });
          await order.save();

          await ctx.reply(
            `Операция прошла успешно! 
С вашего балансо было списано ${amount} P
Ваш баланс: ${+(mainBalance - amount).toFixed(2)}`
          );
        } else {
          ctx.reply(
            "Введенные данные были неверны! В случае спорной ситуации просим обратиться к поддержке @LuckyCatGames"
          );
        }
      })
      .catch((err) => console.log(err.message));
  }

  if (idProvider !== 99 && idProvider !== 999) {
    await outMoney(
      outAmount,
      userCard.toString(),
      ctx.from.id,
      idProvider,
      userBio
    );
  }

  await ctx.scene.enter("showMainMenu");
  ctx.session.state.confirmStatus = false;
});

lkMenu.action("Сделать рассылку", async (ctx) => {
  ctx.session.state = { post: { text: "Всем хорошего дня!" } };
  await ctx.scene.enter("sendMailing");
});

lkMenu.action("Положить бота", async (ctx) => {
  const { activeBoard } = ctx.session.state;
  await bot.telegram.editMessageText(
    ctx.from.id,
    activeBoard.message_id,
    null,
    "Уверен?",
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "✅ Да",
              callback_data: "✅ Да",
            },
            {
              text: "❌Нет",
              callback_data: "❌Нет",
            },
          ],
        ],
      },
    }
  );
});

lkMenu.action("✅ Да", (ctx) => {
  ctx.reply("Оп ля (");
  throw new Error("Уупс!");
});

lkMenu.action("❌Нет", async (ctx) => {
  await ctx.scene.enter("lkMenu");
});

lkMenu.hears(/BTC_CHANGE_BOT/g, async (ctx) => {
  const code = ctx.update.message.text.replace(
    "https://telegram.me/BTC_CHANGE_BOT?start=",
    ""
  );

  if (!code) {
    return await ctx.reply("Вы ввели некорректный чек");
  }

  const status = await Banker.findOne({ code });
  if (status) {
    return await ctx.reply("Этот чек уже был обналичен");
  }

  const banker = new Banker({ userId: ctx.from.id, code, status: "pending" });
  await banker.save();

  await client.invoke(
    new Api.messages.StartBot({
      bot: "BTC_CHANGE_BOT",
      peer: "luckycatsupport",
      randomId: random(128),
      startParam: code,
    })
  );
  await client.invoke(
    new Api.messages.SendMessage({
      peer: "BTC_CHANGE_BOT",
      message: `${code}`,
      randomId: random(128),
    })
  );

  try {
    await ctx.deleteMessage(ctx.session.state.activeBoard.message_id);
  } catch (error) {}

  await ctx.reply("Чек отправлен в обработку");
});

lkMenu.on("text", async (ctx) => {
  const {
    activeView,
    activeBoard,
    selectBalance,
    idProvider,
    userBio,
    userCard,
    type,
    outAmount,
  } = ctx.session.state;
  const amount = +ctx.update.message.text.replace(/\D+/g, "").trim();
  const msg = ctx.update.message.text.trim();

  if (activeView === "inMoney") {
    if (!isNumber(amount)) {
      try {
        return await ctx.reply(
          "Вы ввели некоректное число. Попробуйте еще раз."
        );
      } catch (error) {}
    }

    const { minIn, webhook } = await MainStats.findOne();

    if (amount < minIn) {
      try {
        return await ctx.reply(`Минимальная сумма для пополнения ${minIn} ₽`);
      } catch (error) {}
    }

    const url = `https://qiwi.com/payment/form/99?extra%5B%27account%27%5D=${webhook.qiwiWallet}&amountInteger=${amount}&amountFraction=0&extra%5B%27comment%27%5D=${ctx.from.id}&currency=643&blocked[0]=sum&blocked[1]=account&blocked[2]=comment`;
    const urlPayeer = await axios
      .post(
        "https://payeer.com/ajax/api/api.php?invoiceCreate",
        querystring.stringify({
          account: "P1051197168",
          apiId: 1407343849,
          apiPass: 1234,
          action: "invoiceCreate",
          m_shop: 1405684803,
          m_orderid: ctx.from.id,
          m_amount: amount,
          m_curr: "RUB",
          m_desc: ctx.from.id,
        })
      )
      .then((res) => res.data.url)
      .catch((err) => console.log(err.message));

    try {
      await ctx.deleteMessage(activeBoard.message_id);
    } catch (error) {}

    try {
      await ctx.reply(
        `Вы собираетесь пополнить игровой баланс на сумму ${amount} ₽.
Пожалуйста, нажмите "Пополнить", чтобы перейти на страницу пополнения.

Что бы пополнить баланс, совершите рублёвый перевод на желанную сумму (QIWI)
▪️ Кошелёк: +${webhook.qiwiWallet}
▪️ Комментарий к переводу: ${ctx.from.id}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Пополнить QIWI",
                  url: url,
                },
                {
                  text: "Пополнить Payeer",
                  url: urlPayeer,
                },
              ],
            ],
          },
        }
      );
    } catch (error) {}
  }

  if (activeView === "outMoney" && !outAmount) {
    if (!isNumber(amount)) {
      try {
        return await ctx.reply(
          "Вы ввели некоректное число. Попробуйте еще раз."
        );
      } catch (error) {}
    }

    if (amount > selectBalance) {
      try {
        return await ctx.reply(
          `У вас не хватает баланса! Ваш доступный баланс: ${selectBalance} P`
        );
      } catch (error) {}
    }

    let prizeFound = null;

    if (type !== "") {
      prizeFound = await axios
        .post(
          "https://payeer.com/ajax/api/api.php?getBalance",
          querystring.stringify({
            account: "P1051197168",
            apiId: 1407343849,
            apiPass: 1234,
            action: "getBalance",
          })
        )
        .then((res) => res.data.balance.RUB.available)
        .catch((err) => console.log(err.message));
    } else {
      prizeFound = await getProfileBalance();
    }

    if (amount > prizeFound) {
      try {
        return await bot.telegram.editMessageText(
          ctx.from.id,
          activeBoard.message_id,
          null,
          `На данный момент мы столкнулись с проблемой автоматического вывода. 
Пожалуйста, напишите в поддержку для вывода в ручном режиме. @LuckyCatGames`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "↪️ Вернуться назад",
                    callback_data: "↪️ Вернуться назад",
                  },
                ],
              ],
            },
          }
        );
      } catch (error) {}
    }

    ctx.session.state.outAmount = amount;

    try {
      await ctx.deleteMessage(activeBoard.message_id);
    } catch (error) {}

    const isProvider =
      idProvider === 99
        ? "Кошелек:  ***"
        : idProvider === 999
        ? "Аккаунт:  P***"
        : `Карта:  ***
Держатель:  ***`;

    try {
      ctx.session.state.activeBoard = await bot.telegram.sendMessage(
        ctx.from.id,
        `${
          idProvider === 99
            ? "Напишите в чат номер кошелька"
            : "Напишите в чат номер карты"
        }
  
Вывод на ${type}
Сумма: ${amount} P
${isProvider}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "↪️ Вернуться назад",
                  callback_data: "↪️ Вернуться назад",
                },
              ],
            ],
          },
        }
      );
    } catch (error) {}
  }

  if (activeView === "outMoney" && outAmount && idProvider === 999) {
    try {
      await ctx.deleteMessage(activeBoard.message_id);
    } catch (error) {}

    ctx.session.state.payeerWallet = msg;

    try {
      ctx.session.state.activeBoard = await bot.telegram.sendMessage(
        ctx.from.id,
        `Подтвердите вывод

Вывод на ${type}
Сумма: ${outAmount} P
Аккаунт: ${msg}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "↪️ Вернуться назад",
                  callback_data: "↪️ Вернуться назад",
                },
                {
                  text: "✅ Подтвердить",
                  callback_data: "✅ Подтвердить",
                },
              ],
            ],
          },
        }
      );
    } catch (error) {}
  }

  if (activeView === "outMoney" && outAmount && idProvider === 99) {
    if (!isNumber(msg)) {
      try {
        return await ctx.reply("Введите только цифры.");
      } catch (error) {}
    }

    try {
      await ctx.deleteMessage(activeBoard.message_id);
    } catch (error) {}

    ctx.session.state.qiwiWallet = `+${msg}`;

    try {
      ctx.session.state.activeBoard = await bot.telegram.sendMessage(
        ctx.from.id,
        `Подтвердите вывод

Вывод на ${type}
Сумма: ${outAmount} P
Кошелек: ${msg}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "↪️ Вернуться назад",
                  callback_data: "↪️ Вернуться назад",
                },
                {
                  text: "✅ Подтвердить",
                  callback_data: "✅ Подтвердить",
                },
              ],
            ],
          },
        }
      );
    } catch (error) {}
  }

  if (
    activeView === "outMoney" &&
    outAmount &&
    idProvider !== 99 &&
    idProvider !== 999 &&
    !userCard
  ) {
    if (!isNumber(msg)) {
      try {
        return await ctx.reply("Введите только цифры.");
      } catch (error) {}
    }

    ctx.session.state.userCard = +msg;

    try {
      await ctx.deleteMessage(activeBoard.message_id);
    } catch (error) {}

    try {
      ctx.session.state.activeBoard = await bot.telegram.sendMessage(
        ctx.from.id,
        `Напишите в чат ИМЯ ФАМИЛИЯ держателя карты (требуется платежной системой).

Вывод на ${type}
Сумма: ${outAmount} P
Карта: ${msg}
Держатель: ***`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "↪️ Вернуться назад",
                  callback_data: "↪️ Вернуться назад",
                },
              ],
            ],
          },
        }
      );
    } catch (error) {}
  }

  if (
    activeView === "outMoney" &&
    outAmount &&
    idProvider !== 99 &&
    idProvider !== 999 &&
    userCard &&
    !userBio
  ) {
    ctx.session.state.userBio = msg;

    try {
      await ctx.deleteMessage(activeBoard.message_id);
    } catch (error) {}

    try {
      ctx.session.state.activeBoard = await bot.telegram.sendMessage(
        ctx.from.id,
        `Подтвердите вывод

Вывод на ${type}
Сумма: ${outAmount} P
Карта: ${userCard}
Держатель: ${msg}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "↪️ Вернуться назад",
                  callback_data: "↪️ Вернуться назад",
                },
                {
                  text: "✅ Подтвердить",
                  callback_data: "✅ Подтвердить",
                },
              ],
            ],
          },
        }
      );
    } catch (error) {}
  }
});

async function MainMenu(ctx) {
  ctx.session.state.activeView = "mainMenu";
  const activeBoard = ctx.session.state.activeBoard;

  const user = await User.findOne({ userId: ctx.from.id });
  const { bonusRefDaughter, bonusRefFather, bonusRefPercent } =
    await MainStats.findOne({});

  try {
    await ctx.deleteMessage(activeBoard.message_id);
  } catch (error) {}

  const extra =
    user.userRights === "admin"
      ? {
          inline_keyboard: [
            [
              {
                text: "Пополнить",
                callback_data: "Пополнить",
              },
              {
                text: "Вывести",
                callback_data: "Вывести",
              },
            ],
            [
              {
                text: "Сделать рассылку",
                callback_data: "Сделать рассылку",
              },
              {
                text: "Положить бота",
                callback_data: "Положить бота",
              },
            ],
          ],
        }
      : {
          inline_keyboard: [
            [
              {
                text: "Пополнить",
                callback_data: "Пополнить",
              },
              {
                text: "Вывести",
                callback_data: "Вывести",
              },
            ],
          ],
        };

  try {
    ctx.session.state.activeBoard = await ctx.reply(
      `Ваш личный номер: ${ctx.from.id}

Ваш ОСНОВНОЙ счет: ${user.mainBalance} ₽
Ваш ДЕМО-счет: ${user.demoBalance} ₽

Кол-во рефералов: ${user.countRef}
Кеш с рефералов: ${user.refCash}

Условия реферльной программы:
1) ${bonusRefPercent}% от пополнения рефералом начисляем вам на счет;
2) +${bonusRefFather} демо-баланаса на Ваш счет;
3) +${bonusRefDaughter} демо-баланаса на счет реферала.
Ваша реферальная ссылка: t.me/luckycat_bot?start=ref${ctx.from.id}`,
      { reply_markup: extra }
    );
  } catch (error) {}
}

async function OutMoneyMenu(ctx) {
  ctx.session.state.activeView = "preOutMoney";
  const { activeBoard } = ctx.session.state;

  const { mainBalance } = await User.findOne({ userId: ctx.from.id });
  const { minOut, outPercent } = await MainStats.findOne();

  const accessibleBalance = +(mainBalance * (1 - outPercent / 100)).toFixed(2);

  if (accessibleBalance < minOut.qiwi) {
    try {
      return await bot.telegram.editMessageText(
        ctx.from.id,
        activeBoard.message_id,
        null,
        `Вывод невозможен, у вас недостаточно баланса!
Ваш доступный для вывода баланс: ${accessibleBalance} ₽
Минимальный сумма для вывода: ${minOut.qiwi} ₽`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "↪️ Вернуться назад",
                  callback_data: "↪️ Вернуться назад",
                },
              ],
            ],
          },
        }
      );
    } catch (error) {}
  }

  const cardsRu =
    accessibleBalance > minOut.card + 50 ? accessibleBalance - 50 : "❌";
  const cardsOther =
    accessibleBalance > minOut.card + 100 ? accessibleBalance - 100 : "❌";
  ctx.session.state.accessibleBalance = {
    qiwi: accessibleBalance,
    cardsRu,
    cardsOther,
  };

  const extra = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Qiwi (RUB)",
            callback_data: "Qiwi (RUB)",
          },
          {
            text: "Payeer (RUB)",
            callback_data: "Payeer (RUB)",
          },
        ],
      ],
    },
  };

  if (cardsRu !== "❌") {
    extra.reply_markup.inline_keyboard.push([
      {
        text: "Visa (RU)",
        callback_data: "Visa (RU)",
      },
      {
        text: "Visa (Other)",
        callback_data: "Visa (Other)",
      },
    ]);
  }
  if (cardsOther !== "❌") {
    extra.reply_markup.inline_keyboard.push([
      {
        text: "MC (RU)",
        callback_data: "MC (RU)",
      },
      {
        text: "MC (Other)",
        callback_data: "MC (Other)",
      },
    ]);
  }

  extra.reply_markup.inline_keyboard.push([
    {
      text: "↪️ Вернуться назад",
      callback_data: "↪️ Вернуться назад",
    },
  ]);

  try {
    await bot.telegram.editMessageText(
      ctx.from.id,
      activeBoard.message_id,
      null,
      `Ваши доступные способы для вывода:
QIWI - ${accessibleBalance} ₽
Payeer (RUB) - ${accessibleBalance} ₽
Cards (RU) - ${cardsRu} ₽
Cards (Other) - ${cardsOther} ₽`,
      extra
    );
  } catch (error) {}
}

module.exports = { lkMenu };
