const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");
const { bot } = require("../init/startBot");

const showMainMenu = new Scene("showMainMenu");
showMainMenu.enter(async (ctx) => {
  ctx.session.state = {};
  try {
    await ctx.reply(
      "Вы вошли в главное меню",
      Extra.markup(
        Markup.keyboard([
          ["👤 Соло", "👥 ПвП"],
          ["📱 Личный кабинет", "💬 Чат", "ℹ️ Инфо"],
        ]).resize()
      )
    );
  } catch (error) {}
});

mainMenuActions(showMainMenu);

function mainMenuActions(scene) {
  scene.hears("👤 Соло", async (ctx) => {
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
    const activeBoard = ctx.session.state.activeBoard;
    try {
      await ctx.deleteMessage(activeBoard.message_id);
    } catch (error) {}

    await ctx.scene.enter("pvpAllGames");
  });

  scene.action(/(?:playGame)/, async (ctx) => {
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
    return await ctx.scene.enter("lkMenu");
  });

  // scene.hears("Спорт", async (ctx) => {
  //   const activeBoard = ctx.session.state.activeBoard;
  //   try {
  //     await ctx.deleteMessage(activeBoard.message_id);
  //   } catch (error) {}
  //   return await ctx.scene.enter("sportMenu");
  // });

  scene.hears("ℹ️ Инфо", async (ctx) => {
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
  
  <a href="http://t.me/LuckyCatGames">❓ Поддержка</a>
  <a href="http://t.me/joinchat/P0el-xuDN6g-ZsY7decv7A">💬 Чат для общения с игроками</a>
  <a href="http://t.me/luckycat_orders">💳 Чат, в котором публикуются платежи</a>`,
        {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }
      );
    } catch (error) {}
  });

  scene.hears("💬 Чат", async (ctx) => {
    const activeBoard = ctx.session.state.activeBoard;
    try {
      await ctx.deleteMessage(activeBoard.message_id);
    } catch (error) {}

    try {
      ctx.reply(
        `Вы можете общаться с игроками в нашем общем чате
    <a href="http://t.me/joinchat/P0el-xuDN6g-ZsY7decv7A">💬 Чат для общения с игроками</a>`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Перейти в чат",
                  url: "http://t.me/joinchat/P0el-xuDN6g-ZsY7decv7A",
                },
              ],
            ],
          },
        }
      );
    } catch (error) {}
  });
}

module.exports = { showMainMenu, mainMenuActions };
