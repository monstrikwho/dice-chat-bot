const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const { places } = require("../keyboards/autobus");
const { autobusPlacesHook } = require("../keyboards/getGroupsHook");

const User = require("../models/user");

// *************************** STEP 1 *******************************************
const takeAutobus = new Scene("takeAutobus");
takeAutobus.enter(async (ctx) => {
  await ctx.reply(
    "Вы перешли к выбору автобусов.",
    Extra.markup(
      Markup.keyboard([
        ["↪️ Вернуться назад"],
      ]).resize()
    )
  );
  await ctx.reply(
    "Пожалуйста, выберите автобусы",
    Extra.markup((m) =>
      m.inlineKeyboard([
        [6, 14, 29, 31].map((item) => m.callbackButton(item, item)),
      ])
    )
  );
});
let regex = /./;
takeAutobus.action(/(?:6|14|29|31)/, async (ctx) => {
  ctx.session.state = { autobus: ctx.match[0] };
  regex = autobusPlacesHook(ctx.match[0]);
  await ctx.scene.enter("takePlaces");
});
takeAutobus.hears(/./, (ctx) => {
  if (ctx.update.message.text === "↪️ Вернуться назад") {
    return ctx.scene.enter("yourAutobus");
  }

  ctx.reply("Вы не выбрали автобус. Попробуйте еще раз.");
});
takeAutobus.leave(async (ctx) => ctx.deleteMessage());

// *************************** STEP 2 *******************************************
const takePlaces = new Scene("takePlaces");
takePlaces.enter(async (ctx) => {
  await ctx.reply(
    "Выберите остановку",
    Extra.markup((m) =>
      m.inlineKeyboard([
        ...places[ctx.session.state.autobus].map((item) => [
          m.callbackButton(item, item),
        ]),
      ])
    )
  );
});

takePlaces.action(regex, async (ctx) => {
  const selectAutobus = ctx.session.state.autobus;
  const [user] = await User.find({ userId: ctx.from.id });
  const data = { ...user.autobus };
  data[selectAutobus] = ctx.update.callback_query.data;
  await User.updateOne({ userId: ctx.from.id }, { autobus: data });
  ctx.scene.enter("autobusMenu");
});

takePlaces.hears(/./, (ctx) => {
  if (ctx.update.message.text === "↪️ Вернуться назад") {
    return ctx.scene.enter("takeAutobus");
  }
  ctx.reply("Вы не выбрали остановку. Попробуйте еще раз.");
});
takePlaces.leave((ctx) => ctx.deleteMessage());

// 

// 

// 

// ****************************** DELETED AUTOBUS **********************************
const deleteAutobus = new Scene("deleteAutobus");
deleteAutobus.enter(async (ctx) => {
  const autobusObj = await User.findOne({ userId: ctx.from.id });
  const autobusArr = Object.keys(autobusObj.autobus);

  await ctx.reply(
    `Вы зашли в сцену удаления автобусов`,
    Extra.markup(Markup.keyboard([["↪️ Вернуться назад"]]).resize())
  );

  await ctx.reply(
    "Выберите автобус, который хотите удалить",
    Extra.markup((m) =>
      m.inlineKeyboard([autobusArr.map((item) => m.callbackButton(item, item))])
    )
  );
});

deleteAutobus.action(/(?:6|14|29|31)/, async (ctx) => {
  const user = await User.findOne({ userId: ctx.from.id });
  const userAutobus = Object.keys(user.autobus);
  if (userAutobus.indexOf(ctx.match[0]) >= 0) {
    const autobus = user.autobus;
    delete autobus[ctx.match[0]];
    await User.updateOne({ userId: ctx.from.id }, { autobus });
  }
  ctx.deleteMessage()
  ctx.scene.enter('yourAutobus')
});

deleteAutobus.hears(/./, async (ctx) => {
  if (ctx.update.message.text === "↪️ Вернуться назад") {
    return ctx.scene.enter("yourAutobus");
  }
  await ctx.reply("Вы ввели что-то не то.. Попробуйте еще раз");
});

// 

// 

//
module.exports = { takeAutobus, takePlaces, deleteAutobus };
