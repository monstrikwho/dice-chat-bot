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
    Extra.markup(Markup.removeKeyboard())
  );

  const autobusObj = await User.findOne({ userId: ctx.from.id });
  const autobusArr = Object.keys(autobusObj.autobus);

  const autobus = () => {
    let arr = ["6", "14", "29", "31"];
    for (let item of autobusArr) {
      if (arr.indexOf(item)) {
        arr.splice(arr.indexOf(item), 1);
      }
    }
    return arr;
  };

  await ctx.reply(
    "Пожалуйста, выберите автобусы",
    Extra.markup((m) =>
      m.inlineKeyboard([
        autobus().map((item) => m.callbackButton(item, item)),
        [m.callbackButton("↪️ Вернуться назад", "↪️ Вернуться назад")],
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
takeAutobus.action(
  "↪️ Вернуться назад",
  async (ctx) => await ctx.scene.enter("yourAutobus")
);
takeAutobus.hears(
  /./,
  async (ctx) => await ctx.reply("Вы не выбрали автобус. Попробуйте еще раз.")
);
takeAutobus.leave(async (ctx) => await ctx.deleteMessage());

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
  const user = await User.findOne({ userId: ctx.from.id });
  const data = { ...user.autobus };
  data[selectAutobus] = ctx.update.callback_query.data;
  await User.updateOne({ userId: ctx.from.id }, { autobus: data });
  await ctx.scene.enter("autobusMenu");
});

takePlaces.hears(/./, async (ctx) => {
  if (ctx.update.message.text === "↪️ Вернуться назад") {
    return await ctx.scene.enter("takeAutobus");
  }
  ctx.reply("Вы не выбрали остановку. Попробуйте еще раз.");
});
takePlaces.leave(async (ctx) => await ctx.deleteMessage());

//

//

//

// ****************************** CHANGE AUTOBUS **********************************
const changeAutobus = new Scene("changeAutobus");
changeAutobus.enter(async (ctx) => {
  const autobusObj = await User.findOne({ userId: ctx.from.id });
  const autobusArr = Object.keys(autobusObj.autobus);

  if (autobusArr.length < 1) {
    await ctx.reply("У вас нету выбранных автобусов.");
    await ctx.scene.enter("autobusMenu");
    return;
  }

  await ctx.reply(
    `Вы зашли в сцену замены остановки автобусов`,
    Extra.markup(Markup.removeKeyboard())
  );

  await ctx.reply(
    "Выберите автобус, чью остановку вы хотите изменить",
    Extra.markup((m) =>
      m.inlineKeyboard([
        autobusArr.map((item) => m.callbackButton(item, item)),
        [m.callbackButton("↪️ Вернуться назад", "↪️ Вернуться назад")],
      ])
    )
  );
});

changeAutobus.action(/(?:6|14|29|31)/, async (ctx) => {
  ctx.session.state = { autobus: ctx.match[0] };
  regex = autobusPlacesHook(ctx.match[0]);
  await ctx.scene.enter("takePlaces");
});

changeAutobus.action("↪️ Вернуться назад", async (ctx) => {
  await ctx.scene.enter("yourAutobus");
});

changeAutobus.hears(/./, async (ctx) => {
  await ctx.reply("Вы ввели что-то не то.. Попробуйте еще раз");
});
changeAutobus.leave(async (ctx) => await ctx.deleteMessage());

//

// 

//

//***************************** DELETED AUTOBUS *****************************
const deleteAutobus = new Scene("deleteAutobus");
deleteAutobus.enter(async (ctx) => {
  const autobusObj = await User.findOne({ userId: ctx.from.id });
  const autobusArr = Object.keys(autobusObj.autobus);

  if (autobusArr.length < 1) {
    await ctx.reply("У вас нету выбранных автобусов.");
    await ctx.scene.enter("autobusMenu");
    return;
  }

  await ctx.reply(
    `Вы зашли в сцену удаления автобусов`,
    Extra.markup(Markup.removeKeyboard())
  );

  await ctx.reply(
    "Выберите автобус, который хотите удалить",
    Extra.markup((m) =>
      m.inlineKeyboard([
        autobusArr.map((item) => m.callbackButton(item, item)),
        [m.callbackButton("↪️ Вернуться назад", "↪️ Вернуться назад")],
      ])
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
    await ctx.reply(`Вы успешно удалили автобус: ${ctx.match[0]}`);
  }

  await ctx.scene.enter("autobusMenu");
});

deleteAutobus.hears(/./, async (ctx) => {
  await ctx.reply("Вы ввели что-то не то.. Попробуйте еще раз");
});
deleteAutobus.action(
  "↪️ Вернуться назад",
  async (ctx) => await ctx.scene.enter("yourAutobus")
);
deleteAutobus.leave(async (ctx) => await ctx.deleteMessage());

//

//

//
module.exports = { takeAutobus, takePlaces, changeAutobus, deleteAutobus };
