const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const { places } = require("../keyboards/autobus");
const { autobusPlacesHook } = require("../keyboards/getGroupsHook");

const User = require("../models/user");

let deleteMsg = null;
let deleteMsgRm = null;

// *************************** STEP 1 *******************************************
const takeAutobus = new Scene("takeAutobus");
takeAutobus.enter(async (ctx) => {
  deleteMsgRm = await ctx.reply(
    "Вы перешли к выбору автобусов.",
    Extra.markup(Markup.removeKeyboard())
  );

  const autobusObj = await User.findOne({ userId: ctx.from.id });
  const autobusArr = Object.keys(autobusObj.autobus);

  const autobus = () => {
    let arr = ["6", "14", "29", "31", "32"];
    for (let item of autobusArr) {
      if (arr.indexOf(item) || arr.indexOf(item) === 0) {
        arr.splice(arr.indexOf(item), 1);
      }
    }
    return arr;
  };

  deleteMsg = await ctx.reply(
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
takeAutobus.action(/(?:6|14|29|31|32)/, async (ctx) => {
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
takeAutobus.leave(async (ctx) => {
  try {
    await ctx.deleteMessage(deleteMsgRm.message_id);
    await ctx.deleteMessage(deleteMsg.message_id);
  } catch (error) {
    console.log(error);
  }
});

// *************************** STEP 2 *******************************************
const takePlaces = new Scene("takePlaces");
takePlaces.enter(async (ctx) => {
  deleteMsg = await ctx.reply(
    "Выберите остановку",
    Extra.markup((m) =>
      m.inlineKeyboard([
        ...places[ctx.session.state.autobus].map((item) => [
          m.callbackButton(item, item),
        ]),
        [m.callbackButton("↪️ Вернуться назад", "↪️ Вернуться назад")],
      ])
    )
  );
});

takePlaces.action(regex, async (ctx) => {
  if (ctx.update.callback_query.data === "↪️ Вернуться назад") {
    return await ctx.scene.enter("takeAutobus");
  }
  const selectAutobus = ctx.session.state.autobus;
  const user = await User.findOne({ userId: ctx.from.id });
  const data = { ...user.autobus };
  data[selectAutobus] = ctx.update.callback_query.data;
  await User.updateOne({ userId: ctx.from.id }, { autobus: data });
  await ctx.scene.enter("autobusMenu");
});

takePlaces.hears(/./, async (ctx) => {
  await ctx.reply("Вы не выбрали остановку. Попробуйте еще раз.");
});

takePlaces.leave(async (ctx) => {
  try {
    await ctx.deleteMessage(deleteMsg.message_id);
  } catch (error) {
    console.log(error)
  }
});

//

//

//

// ****************************** CHANGE AUTOBUS **********************************
const changeAutobus = new Scene("changeAutobus");
changeAutobus.enter(async (ctx) => {
  const autobusObj = await User.findOne({ userId: ctx.from.id });
  const autobusArr = Object.keys(autobusObj.autobus);

  deleteMsgRm = await ctx.reply(
    `Вы хотите изменить остановку автобуса.`,
    Extra.markup(Markup.removeKeyboard())
  );

  deleteMsg = await ctx.reply(
    "Выберите автобус, чью остановку вы хотите изменить",
    Extra.markup((m) =>
      m.inlineKeyboard([
        autobusArr.map((item) => m.callbackButton(item, item)),
        [m.callbackButton("↪️ Вернуться назад", "↪️ Вернуться назад")],
      ])
    )
  );
});

changeAutobus.action(/(?:6|14|29|31|32)/, async (ctx) => {
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
changeAutobus.leave(async (ctx) => {
  try {
    await ctx.deleteMessage(deleteMsgRm.message_id);
    await ctx.deleteMessage(deleteMsg.message_id);
  } catch (error) {
    console.log(error)
  }
});

//

//

//

//***************************** DELETED AUTOBUS *****************************
const deleteAutobus = new Scene("deleteAutobus");
deleteAutobus.enter(async (ctx) => {
  const autobusObj = await User.findOne({ userId: ctx.from.id });
  const autobusArr = Object.keys(autobusObj.autobus);

  deleteMsgRm = await ctx.reply(
    `Вы хотите удалить автобус.`,
    Extra.markup(Markup.removeKeyboard())
  );

  deleteMsg = await ctx.reply(
    "Выберите автобус, который хотите удалить",
    Extra.markup((m) =>
      m.inlineKeyboard([
        autobusArr.map((item) => m.callbackButton(item, item)),
        [m.callbackButton("↪️ Вернуться назад", "↪️ Вернуться назад")],
      ])
    )
  );
});

deleteAutobus.action(/(?:6|14|29|31|32)/, async (ctx) => {
  const user = await User.findOne({ userId: ctx.from.id });

  const autobus = user.autobus;
  delete autobus[ctx.match[0]];
  await User.updateOne({ userId: ctx.from.id }, { autobus });
  await ctx.reply(`Вы успешно удалили автобус: ${ctx.match[0]}`);

  await ctx.scene.enter("autobusMenu");
});

deleteAutobus.hears(/./, async (ctx) => {
  await ctx.reply("Вы ввели что-то не то.. Попробуйте еще раз");
});
deleteAutobus.action(
  "↪️ Вернуться назад",
  async (ctx) => await ctx.scene.enter("yourAutobus")
);
deleteAutobus.leave(async (ctx) => {
  try {
    await ctx.deleteMessage(deleteMsgRm.message_id);
    await ctx.deleteMessage(deleteMsg.message_id);
  } catch (error) {
    console.log(error)
  }
});

//

//

//
module.exports = { takeAutobus, takePlaces, changeAutobus, deleteAutobus };
