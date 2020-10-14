const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const getRasp = require("../helpers/getRasp");

const buttonNames = require("../keyboards/buttonNames");
const groupsHook = require("../keyboards/getGroupsHook");

const User = require("../models/user");
const Teachers = require("../models/teachers");

const checkRasp = require('../helpers/checkRasp')

let regex = /./;
let deleteMsg = null;

// *************************** TEACHERS *******************************************
const raspTeachers = new Scene("raspTeachers");
raspTeachers.enter(async (ctx) => {
  return await ctx.reply(
    "Пожалуйста, введите фамилию преподавателя.",
    Extra.markup(Markup.keyboard([["↪️ Вернуться назад"]]).resize())
  );
});

raspTeachers.hears(/./, async (ctx) => {
  if (ctx.update.message.text === "↪️ Вернуться назад") {
    return await ctx.scene.enter("showSettingsMenu");
  }

  const status = await Teachers.findOne({
    teacher: ctx.update.message.text,
  });

  // Проверяем, выбрал ли юзер преподавателя из ctx.session
  if (status) {
    await User.updateOne(
      { userId: ctx.from.id },
      { otherTeacher: status.teacher }
    );
    await ctx.reply(`Вы выбрали: ${status.teacher}`);
    return await ctx.scene.enter("setupDay");
  }

  // Ищем преподавателя, сохраняем в сессию
  const message = ctx.update.message.text.replace(/\s/g, "");
  const statusId = await Teachers.find({
    lastName: message[0].toUpperCase() + message.slice(1),
  });
  if (statusId.length !== 0) {
    return await ctx.reply(
      "Выберите преподавателя из списка",
      Extra.markup(
        Markup.keyboard([statusId.map((item) => item.teacher)]).resize()
      )
    );
  } else {
    await ctx.reply("Такой фамилии нет. Попробуйте еще раз.");
  }
});

//

//

//

//

// *************************** STUDENTS *******************************************
const raspStudents = new Scene("raspStudents");
raspStudents.enter(async (ctx) => {
  await ctx.reply(
    "Расписание других групп",
    Extra.markup(Markup.keyboard([["↪️ Вернуться назад"]]).resize())
  );
  deleteMsg = await ctx.reply(
    "Пожалуйста, выберите факультет",
    Extra.HTML().markup((m) =>
      m.inlineKeyboard(
        buttonNames.faculty.map((items) =>
          items.map((item) => m.callbackButton(item, item))
        )
      )
    )
  );
});

raspStudents.hears(/./, async (ctx) => {
  if (ctx.update.message.text === "↪️ Вернуться назад") {
    return await ctx.scene.enter("showSettingsMenu");
  }
  await ctx.reply("Вы не выбрали факультет");
});
raspStudents.leave(
  async (ctx) => await ctx.deleteMessage(deleteMsg.message_id)
);
raspStudents.action(/(?:ИФ|ФПиП|ИПКиП|ФЭП|ФСиГЯ)/, async (ctx) => {
  ctx.session.state = { ...ctx.session.state, faculty: ctx.match[0] };
  await ctx.scene.enter("takeSpec");
});

// ************************* TAKE SPEC **************************************
const takeSpec = new Scene("takeSpec");
takeSpec.enter(async (ctx) => {
  const faculty = () => {
    if (ctx.session.state.faculty === "ИФ") {
      regex = /(?:АТП|А|ИТвМ|ИСТ|МиМ|ПИТТ|ТОСП|ТО|ТМ)/;
      return "if";
    }
    if (ctx.session.state.faculty === "ФПиП") {
      regex = /(?:ГЭ|ДО|НО|ОТИ|ОП|ПП|СП|СПД|ТиМОВ|ФК)/;
      return "fpip";
    }
    if (ctx.session.state.faculty === "ИПКиП") {
      regex = /(?:БУ|ДО|ПД|ПР|ПП|ПО|ЭиУПП)/;
      return "ipkap";
    }
    if (ctx.session.state.faculty === "ФЭП") {
      regex = /(?:Б|БА|М|ПХ|ЭОП|ЭТ|ЭП|ЭМ)/;
      return "fep";
    }
    if (ctx.session.state.faculty === "ФСиГЯ") {
      regex = /(?:БИЯ|ИЯ|НА|РИЯ|СИЯ)/;
      return "fsigi";
    }
  };
  deleteMsg = await ctx.reply(
    "Пожалуйста, выберите специальность",
    Extra.HTML().markup((m) =>
      m.inlineKeyboard(
        buttonNames.specialtys[faculty()].map((items) =>
          items.map((item) => m.callbackButton(item, item))
        )
      )
    )
  );
});

takeSpec.hears(/./, async (ctx) => {
  if (ctx.update.message.text === "↪️ Вернуться назад") {
    return await ctx.scene.enter("raspStudents");
  }
  await ctx.reply("Вы не выбрали специальность");
});
takeSpec.leave(async (ctx) => await ctx.deleteMessage(deleteMsg.message_id));
takeSpec.action(regex, async (ctx) => {
  ctx.session.state = {
    ...ctx.session.state,
    specialty: ctx.update.callback_query.data,
  };
  await ctx.scene.enter("takeGroup");
});

// ************************** TAKE GROUP ****************************************
const takeGroup = new Scene("takeGroup");
takeGroup.enter(async (ctx) => {
  let resGroupHook = [...groupsHook(ctx.session.state)];
  regex = resGroupHook[0];

  deleteMsg = await ctx.reply(
    "Последний шаг",
    Extra.HTML().markup((m) =>
      m.inlineKeyboard(
        buttonNames.groups[resGroupHook[1]].map((items) =>
          items.map((item) => m.callbackButton(item, item))
        )
      )
    )
  );
});
takeGroup.hears(/./, async (ctx) => {
  if (ctx.update.message.text === "↪️ Вернуться назад") {
    return await ctx.scene.enter("takeSpec");
  }
  await ctx.reply("Вы не выбрали группу");
});
takeGroup.leave(async (ctx) => {
  await ctx.deleteMessage(deleteMsg.message_id);
});
takeGroup.action(regex, async (ctx) => {
  ctx.session.state = {
    ...ctx.session.state,
    group: ctx.update.callback_query.data,
  };

  await User.updateOne(
    { userId: ctx.from.id },
    { otherStudents: ctx.session.state.group }
  );

  await ctx.replyWithHTML(
    `Вы успешно выбрали группу: <pre language="c++">👉🏻 ${ctx.session.state.group}</pre>`
  );

  await ctx.scene.enter("setupDay");
});

//

//

//

//

// *************************** SET UP DAY *******************************************
const setupDay = new Scene("setupDay");
setupDay.enter(async (ctx) => {
  return await ctx.reply(
    "Выберите день",
    Extra.markup(
      Markup.keyboard([
        ["Сегодня", "Завтра", "Полное 📷"],
        ["📌 Добавить избранное", "🏡 Вернуться на главную"],
      ]).resize()
    )
  );
});

setupDay.hears("Сегодня", async (ctx) => {
  await getRasp(ctx, 8);
});
setupDay.hears("Завтра", async (ctx) => {
  await getRasp(ctx, 9);
});
setupDay.hears("Полное 📷", async (ctx) => {
  const today = new Date().getDay();

  let statusRasp =
    today === 3 ? await checkRasp() : today === 4 || today === 5 ? true : false;

  if (statusRasp || today === 4 || today === 5) {
    return await ctx.scene.enter("weekMenu");
  }

  if (today === 1 || today === 2 || (today === 3 && !statusRasp)) {
    await ctx.reply("Ответ займет некоторое время. Пожалуйста, подождите...");
    await ctx.reply("Расписание на текущую неделю.");
    return await getRasp(ctx, 0);
  }

  if (today === 6 || today === 0) {
    await ctx.reply("Ответ займет некоторое время. Пожалуйста, подождите...");
    await ctx.reply("Расписание на следующую неделю.");
    return await getRasp(ctx, 1);
  }
});

setupDay.hears("🏡 Вернуться на главную", async (ctx) => {
  await User.updateOne(
    { userId: ctx.from.id },
    { $unset: { otherTeacher: 1, otherStudents: 1 } }
  );
  return await ctx.scene.enter("showMainMenu");
});

setupDay.hears("📌 Добавить избранное", async (ctx) => {
  const status = await User.findOne({ userId: ctx.from.id });

  if (status.otherTeacher) {
    let favTeachers = status.favTeachers ? status.favTeachers : [];
    if(favTeachers.length === 6) {
      return await ctx.reply('Вы можете добавить в избранное только 6 позиций.')
    } else {
      favTeachers.push(status.otherTeacher);
      return await User.updateOne({ userId: ctx.from.id }, { favTeachers });
    }
  }

  if (status.otherStudents) {
    let favStudents = status.favStudents ? status.favStudents : [];
    if(favStudents.length === 6) {
      return await ctx.reply('Вы можете добавить в избранное только 6 позиций.')
    } else {
      favStudents.push(status.otherStudents);
      return await User.updateOne({ userId: ctx.from.id }, { favStudents });
    }
  }
});

//

//
module.exports = { raspTeachers, raspStudents, takeSpec, takeGroup, setupDay };
