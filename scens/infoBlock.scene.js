const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const infoBlock = new Scene("infoBlock");
infoBlock.enter(async (ctx) => {
  return await ctx.reply(
    `Правила игры:


Поддержка: @LuckyCatGames
Наш чат: https://t.me/joinchat/P0el-xuDN6g-ZsY7decv7A`,
    Extra.markup(Markup.keyboard([["↪️ Вернуться назад"]]).resize())
  );
});

infoBlock.hears("↪️ Вернуться назад", async ({ scene }) => {
  return await scene.enter("lkMenu");
});

module.exports = { infoBlock };
