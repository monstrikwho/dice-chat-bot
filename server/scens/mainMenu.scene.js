const { bot } = require("../init/startBot");
const { commandStart, showMainMenu } = require("../commands/start");

const User = require("../models/user");
const Banker = require("../models/banker");

function mainMenuActions(scene) {
  scene.hears("✅ Соглашаюсь", async (ctx) => {
    if (!ctx.session.is_session) {
      await commandStart(ctx);
    }

    await User.updateOne({ userId: ctx.from.id }, { rules: true });
    await showMainMenu(ctx);
  });

  scene.hears("👤 Соло", async (ctx) => {
    if (!ctx.session.is_session) {
      await commandStart(ctx);
    }

    const activeBoard = ctx.session.state.activeBoard;
    try {
      await ctx.deleteMessage(activeBoard.message_id);
    } catch (error) {}

    const extra = {
      inline_keyboard: [
        [
          { text: "Играть 🎲", callback_data: "playGame 🎲" },
          { text: "Играть ⚽️", callback_data: "playGame ⚽️" },
          { text: "Играть 🎰", callback_data: "playGame 🎰" },
        ],
      ],
    };

    const imgId =
      process.env.DEV !== "true"
        ? "AgACAgIAAxkBAAEL9IZhFCAwn_RSNa45MTOmnFSmwdGflAACjrYxG5IOoUjHX8Zz0VzrgAEAAwIAA3MAAyAE"
        : "AgACAgIAAxkBAAJNt2EUIJwUTZttWomM3YAapaRDXrWeAAJ_tzEbVqCgSJKNIiO7FoYrAQADAgADcwADIAQ";

    try {
      ctx.session.state.activeBoard = await bot.telegram.sendPhoto(
        ctx.from.id,
        imgId,
        {
          caption: `Добро пожаловать в одиночный режим! Выберите игру`,
          reply_markup: extra,
        }
      );
    } catch (error) {}
  });

  scene.hears("👥 ПвП", async (ctx) => {
    if (!ctx.session.is_session) {
      await commandStart(ctx);
    }

    const activeBoard = ctx.session.state.activeBoard;
    try {
      await ctx.deleteMessage(activeBoard.message_id);
    } catch (error) {}

    await ctx.scene.enter("pvpAllGames");
  });

  scene.action(/(?:playGame)/, async (ctx) => {
    if (!ctx.session.is_session) {
      await commandStart(ctx);
    }

    const emoji = ctx.update.callback_query.data.split(" ")[1];

    ctx.session.state = {
      ...ctx.session.state,
      typeGame: emoji,
      typeBalance: "mainBalance",
    };

    const activeBoard = ctx.session.state.activeBoard;
    try {
      await ctx.deleteMessage(activeBoard.message_id);
    } catch (error) {}

    if (emoji === "🎲") {
      return await ctx.scene.enter("diceGame");
    }
    if (emoji === "⚽️") {
      return await ctx.scene.enter("footballGame");
    }
    if (emoji === "🎰") {
      return await ctx.scene.enter("slotGame");
    }
  });

  scene.hears("📱 Личный кабинет", async (ctx) => {
    if (!ctx.session.is_session) {
      await commandStart(ctx);
    }
    await ctx.scene.enter("lkMenu");
  });

  scene.hears("Спорт", async (ctx) => {
    if (!ctx.session.is_session) {
      await commandStart(ctx);
    }
    const activeBoard = ctx.session.state.activeBoard;
    try {
      await ctx.deleteMessage(activeBoard.message_id);
    } catch (error) {}
    await ctx.scene.enter("sportMenu");
  });

  scene.hears("ℹ️ Инфо", async (ctx) => {
    if (!ctx.session.is_session) {
      await commandStart(ctx);
    }
    const activeBoard = ctx.session.state.activeBoard;
    try {
      await ctx.deleteMessage(activeBoard.message_id);
    } catch (error) {}

    try {
      await bot.telegram.sendMessage(
        ctx.from.id,
        `Lucky Cat Games - бот с мини-играми основанный на механике смайлов от телеграмм.
  Именно по-этому Вы можете сразу исключить вероятность каких-либо накруток или мошенничества с нашей стороны, так как мы не можем влиять на то что вам выпадет. Вы просто отправляете нам смайл (можно вручную, но для Вашего удобства сделана кнопка) а по результатам случайного выпадения - мы выплачиваем Вам выигрыш. 
  
  💦 Вы можете играть на демо счете БЕСПЛАТНО.
  🔥 Моментальный вывод средств на кошелек QIWI, карты российских и банков других стран.
  ⚠️ Деньги с демо-счета не выводятся. 
  
  Как играть?
  1) Выбираете размер ставки;
  2) Делаете ставку;
  3) Отправляете смайлик.
  
  <a href="http://t.me/luckycatsupport">❓ Поддержка</a>
  <a href="http://t.me/joinchat/P0el-xuDN6g-ZsY7decv7A">💬 Чат для общения с игроками</a>
  <a href="http://t.me/luckycat_orders">💳 Чат, в котором публикуются платежи</a>`,
        {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }
      );
    } catch (error) {}
  });

  scene.hears("💬 Чат / Поддержка", async (ctx) => {
    if (!ctx.session.is_session) {
      await commandStart(ctx);
    }
    const activeBoard = ctx.session.state.activeBoard;
    try {
      await ctx.deleteMessage(activeBoard.message_id);
    } catch (error) {}

    try {
      await ctx.reply(
        `<a href="tg://user?id=1498018305">👨‍💻 Поддержка</a>
<a href="http://t.me/joinchat/P0el-xuDN6g-ZsY7decv7A">💬 Чат для общения с игроками</a>`,
        {
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Перейти в чат",
                  url: "http://t.me/joinchat/P0el-xuDN6g-ZsY7decv7A",
                },
                {
                  text: "Написать в поддержку",
                  url: "http://t.me/luckycatsupport",
                },
              ],
            ],
          },
        }
      );
    } catch (error) {}
  });

  scene.action(/Выплатить/g, async (ctx) => {
    if (!ctx.session.is_session) {
      await commandStart(ctx);
    }

    if (ctx.from.id !== 1498018305) return;

    const orderId = ctx.update.callback_query.data.split(":")[1];

    ctx.session.m_order_id = orderId;
    ctx.session.m_message_id = ctx.update.callback_query.message.message_id;

    await ctx.reply(`Отправьте ссылку на чек для заказа №${orderId}
ОБЯЗАТЕЛЬНО нужно добавить точку перед ссылкой
.https://telegram...`);
  });

  scene.hears(/\.https\:\/\/telegram\.me\/BTC_CHANGE_BOT/g, async (ctx) => {
    if (!ctx.session.is_session) {
      return await ctx.reply("Сессия была потеряна. Выберите заявку занаво!");
    }

    if (ctx.from.id !== 1498018305) return;

    const code = ctx.update.message.text.split("https://")[1];

    const orderId = ctx.session.m_order_id;
    const messageId = ctx.session.m_message_id;
    const order = await Banker.findOne({ id: orderId });

    if (order.status === "succes") {
      return await ctx.reply("Заявка уже была обработана!");
    }

    await Banker.updateOne(
      { id: orderId },
      {
        order: "succes",
        code: code.replace("https://telegram.me/BTC_CHANGE_BOT?start=", ""),
      }
    );

    await bot.telegram.sendMessage(
      order.userId,
      `Ваш чек на сумму: ${order.amount} P
https://${code}`
    );

    await bot.telegram.editMessageText(
      1498018305,
      messageId,
      null,
      `Заявка №${orderId} обработана
Вывод на сумму ${order.amount} P успешно проведен
Чек: https://${code}
🟢 ВЫПЛАЧЕНО`,
      { disable_web_page_preview: true }
    );
  });
}

module.exports = { mainMenuActions };
