const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const infoBlock = new Scene("infoBlock");
infoBlock.enter(async (ctx) => {
  return await ctx.reply(
    `Lucky Cat Games - бот с мини-играми основанный на механике смайлов от телеграмм.
Именно по-этому Вы можете сразу исключить вероятность каких-либо накруток или мошенничества с нашей стороны, так как мы не можем влиять на то что вам выпадет. Вы просто отправляете нам смайл (можно вручную, но для Вашего удобства сделана кнопка) а по результатам случайного выпадения - мы выплачиваем Вам выигрыш. 

Вы можете играть как бесплатно, так и на основном счете. Деньги с демо-счета не выводятся. 
Вывод с основного счета на киви кошелек - моментальный, комиссия 2%.
Вывод на карту может занять от 30м до суток, комиссия 50р+2%.

Как играть?
1) Выбираете размер ставки;
2) Делаете ставку;
3) Отправляете смайлик.

Поддержка: @LuckyCatGames
Наш чат: https://t.me/joinchat/P0el-xuDN6g-ZsY7decv7A`,
    Extra.markup(Markup.keyboard([["↪️ Вернуться назад"]]).resize())
  );
});

infoBlock.hears("↪️ Вернуться назад", async ({ scene }) => {
  return await scene.enter("showMainMenu");
});

module.exports = { infoBlock };
