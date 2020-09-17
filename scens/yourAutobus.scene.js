const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");

// *************************** STEP 1 *******************************************
const yourAutobus = new Scene("yourAutobus");
yourAutobus.enter(async (ctx) => {
  const [status] = await User.find({ userId: ctx.from.id });
  const autobus = Object.keys(status.autobus)
  return ctx.reply(
    `Ваши автобусы: ${autobus.join(', ')}`,
    Extra.markup(
      Markup.keyboard([
        ['Добавить', 'Изменить/Удалить'],
        ["↪️ Вернуться назад"],
      ]).resize()
    )
  );
});

yourAutobus.hears('Добавить', (ctx) => {
  ctx.scene.enter('takeAutobus');
});
yourAutobus.hears('Изменить/Удалить', (ctx) => {
  ctx.scene.enter('deleteAutobus');
});
yourAutobus.hears("↪️ Вернуться назад", (ctx) => {
  ctx.scene.enter("autobusMenu");
});

module.exports = { yourAutobus };
