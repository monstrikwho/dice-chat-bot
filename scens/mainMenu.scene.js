const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const querystring = require("querystring");
const { getBalance } = require("../helpers/freeKassaMethods");
const md5 = require("js-md5");

const showMainMenu = new Scene("showMainMenu");
showMainMenu.enter(async (ctx) => {
  return await ctx.reply(
    "Вы вошли в главное меню",
    Extra.markup(
      Markup.keyboard([
        ["Играть 🎲", "Играть 🎰", "Играть ⚽️"],
        ["Личный кабинет"],
      ]).resize()
    )
  );
});

showMainMenu.hears(/(?:Играть)/, async (ctx) => {
  const emoji = ctx.update.message.text.replace("Играть ", "");
  ctx.session.state = { diceGame: emoji };

  if (emoji === "🎰") return ctx.reply("Игра будет готова в ближайшее время");
  // if (emoji === "⚽️") return ctx.reply("Игра будет готова в ближайшее время.");

  await ctx.reply(
    "Выберите счет с которым вы хотите играть.",
    Extra.markup(
      Markup.keyboard([
        ["Основной счет", "Демо счет"],
        ["↪️ Вернуться назад"],
      ]).resize()
    )
  );
});

showMainMenu.hears("Основной счет", async (ctx) => {
  const diceGame = ctx.session.state.diceGame;

  if (diceGame === "🎲") {
    ctx.session.state.activeGame = "mainGame";
    await ctx.scene.enter("diceGame");
  }
});

showMainMenu.hears("Демо счет", async (ctx) => {
  const diceGame = ctx.session.state.diceGame;

  if (diceGame === "🎲") {
    ctx.session.state.activeGame = "demoGame";
    await ctx.scene.enter("diceGame");
  }
});

const axios = require("axios");

showMainMenu.hears("Личный кабинет", async (ctx) => {
  // await getBalance();
  // await axios
  //   .post(
  //     `https://www.fkwallet.ru/api_v1.php`,
  //     querystring.stringify({
  //       wallet_id: "F100908075",
  //       sign: md5(`${process.env.MERCHANT_ID}${process.env.SECRET_WORD}`),
  //       action: "get_balance",
  //     })
  //   )
  //   .then((res) => console.log(res.data));

  // await axios
  //   .post(
  //     `https://www.fkwallet.ru/api_v1.php`,
  //     querystring.stringify({
  //       currency: "fkw",
  //       amount: '50',
  //       s: md5(`${process.env.MERCHANT_ID}${process.env.SECRET_WORD}`),
  //       action: "payment",
  //     })
  //   )
  //   .then((res) => console.log(res.data));
  // console.log(md5(`${process.env.MERCHANT_ID}${process.env.SECRET_WORD}`))
  // console.log(md5(`${process.env.MERCHANT_ID}:10:${process.env.SECRET_WORD}:123`))
  // https://www.free-kassa.ru/merchant/cash.php?m=234900&oa=100&o=123&s=995623eb27183ad0e1e1c4aede1a45b8
  ctx.scene.enter("lkMenu");
});

showMainMenu.hears("↪️ Вернуться назад", async (ctx) => {
  return await ctx.scene.enter("showMainMenu");
});

module.exports = { showMainMenu };
