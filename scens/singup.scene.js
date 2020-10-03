const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const moment = require("moment");

const buttonNames = require("../keyboards/buttonNames");
const groupsHook = require("../keyboards/getGroupsHook");

const User = require("../models/user");
const Teachers = require("../models/teachers");
const UserSingUp = require("../models/userSingUp");

//

//

// *************************** STEP 1 *******************************************
const step1 = new Scene("step1");
step1.enter(async (ctx) => {
  ctx.session.state = { personId: ctx.update.message.from.id };
  await ctx.reply(
    "Здравствуй, этот бот уведомит тебя о рассписании. Давай определимся кто ты.",
    Extra.HTML().markup((m) =>
      m.inlineKeyboard(
        buttonNames.person.map((items) =>
          items.map((item) => m.callbackButton(item, item))
        )
      )
    )
  );
});
step1.hears(/./, async (ctx) => await ctx.reply("Такой команды не существует"));
step1.leave(async (ctx) => await ctx.deleteMessage());
step1.action(/(?:Студент|Преподаватель)/, async (ctx) => {
  ctx.session.state = { person: ctx.match[0] };
  await ctx.scene.enter("step2");
});

//

//

// *************************** STEP 2 ******************************************
const step2 = new Scene("step2");
step2.enter(async (ctx) => {
  if (ctx.session.state.person === "Студент") {
    await ctx.reply(
      "Cупер! Давай теперь найдем твою группу.",
      Extra.markup(Markup.removeKeyboard())
    );
    await ctx.reply(
      "Выбери пожалуйста свой факультет: ",
      Extra.HTML().markup((m) =>
        m.inlineKeyboard(
          buttonNames.faculty.map((items) =>
            items.map((item) => m.callbackButton(item, item))
          )
        )
      )
    );
  }
  if (ctx.session.state.person === "Преподаватель") {
    await ctx.reply("Пожалуйста, введите свою фамилию.");
  }
});
step2.hears(/./, async (ctx) => {
  if (ctx.session.state.person === "Студент") {
    return await ctx.reply("Стой, нажми на кнопку выше");
  }

  if (ctx.session.state.person === "Преподаватель") {
    // После того, как сохранили инфу ниже, сохраняем ФИО преподавателя
    const statusUser = await Teachers.findOne({
      teacher: ctx.update.message.text,
    });
    if (statusUser) {
      // ctx.update.message.text === результату найденных кнопок
      const user = new User({
        userId: ctx.from.id,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        userName: ctx.from.username,
        person: ctx.session.state.person,
        teacherName: ctx.update.message.text,
        autobus: false,
      });
      await user.save();
      return await ctx.scene.enter("showMainMenu");
    }
    // Выводим результат первого поиска по фамилии
    const message = ctx.update.message.text.replace(/\s/g, "");
    const statusTeacher = await Teachers.find({
      lastName: message[0].toUpperCase() + message.slice(1),
    });
    if (statusTeacher.length !== 0) {
      return await ctx.reply(
        "Подтвердите, это вы?",
        Extra.markup(
          Markup.keyboard([statusTeacher.map((item) => item.teacher)]).resize()
        )
      );
    } else {
      await ctx.reply("Такой фамилии нету. Попробуйте еще раз.");
    }
  }
});
step2.leave(async (ctx) => await ctx.deleteMessage());
step2.action(/(?:ИФ|ФПиП|ИПКиП|ФЭП|ФСиГЯ)/, async (ctx) => {
  ctx.session.state = { ...ctx.session.state, faculty: ctx.match[0] };
  await ctx.scene.enter("step3");
});

//

//

// ************************** STEP 3 ******************************************
const step3 = new Scene("step3");
let reGex3 = /./;
step3.enter(async (ctx) => {
  const faculty = () => {
    if (ctx.session.state.faculty === "ИФ") {
      reGex3 = /(?:А|ИТвМ|ИСТ|ПИТТ|ТОСП|ТО|ТМ)/;
      return "if";
    }
    if (ctx.session.state.faculty === "ФПиП") {
      reGex3 = /(?:ГЭ|ДО|НО|ОТИ|ОП|ПП|СП|СПД|ТМОВ|ФК)/;
      return "fpip";
    }
    if (ctx.session.state.faculty === "ИПКиП") {
      reGex3 = /(?:БУ|ДО|ПД|ПР|ПП|ПО|ЭиУПП)/;
      return "ipkap";
    }
    if (ctx.session.state.faculty === "ФЭП") {
      reGex3 = /(?:Б|БА|М|ПХ|ЭОП|ЭТ|ЭП|ЭМ)/;
      return "fep";
    }
    if (ctx.session.state.faculty === "ФСиГЯ") {
      reGex3 = /(?:БИЯ|ИЯ|НА|РИЯ|СИЯ)/;
      return "fsigi";
    }
  };
  await ctx.reply(
    "Выберите свою специальность: ",
    Extra.HTML().markup((m) =>
      m.inlineKeyboard(
        buttonNames.specialtys[faculty()].map((items) =>
          items.map((item) => m.callbackButton(item, item))
        )
      )
    )
  );
});
step3.hears(/./, async (ctx) => await ctx.reply("Стой, нажми на кнопку выше"));
step3.leave(async (ctx) => await ctx.deleteMessage());
step3.action(reGex3, async (ctx) => {
  ctx.session.state = {
    ...ctx.session.state,
    specialty: ctx.update.callback_query.data,
  };
  await ctx.scene.enter("step4");
});

//

//

// ************************** STEP 4 ******************************************
const step4 = new Scene("step4");
let reGex4 = /./;
step4.enter(async (ctx) => {
  let resGroupHook = [...groupsHook(ctx.session.state)];
  reGex4 = resGroupHook[0];

  await ctx.reply(
    "Последний шаг.",
    Extra.HTML().markup((m) =>
      m.inlineKeyboard(
        buttonNames.groups[resGroupHook[1]].map((items) =>
          items.map((item) => m.callbackButton(item, item))
        )
      )
    )
  );
});
step4.hears(/./, async (ctx) => await ctx.reply("Стой, нажми на кнопку выше"));
step4.leave(async (ctx) => {
  await ctx.deleteMessage();
  await ctx.replyWithHTML(
    `Вы успешно выбрали группу: <pre language="c++">👉🏻 ${ctx.session.state.group}</pre>`
  );
});
step4.action(reGex4, async (ctx) => {
  ctx.session.state = {
    ...ctx.session.state,
    group: ctx.update.callback_query.data,
  };

  const status = await User.findOne({ userId: ctx.from.id });
  if (status) {
    await User.updateOne(
      { userId: ctx.from.id },
      {
        faculty: ctx.session.state.faculty,
        group: ctx.session.state.group,
      }
    );
  } else {
    const user = new User({
      userId: ctx.from.id,
      firstName: ctx.from.first_name,
      lastName: ctx.from.last_name,
      userName: ctx.from.username,
      person: ctx.session.state.person,
      faculty: ctx.session.state.faculty,
      group: ctx.session.state.group,
      autobus: false,
    });
    await user.save();

    // Send me about new user
    const userSingUp = new UserSingUp({
      userId: ctx.from.id,
      userName: ctx.from.username,
      date: `${moment().year()}:${
        moment().month() + 1 < 10
          ? `0${moment().month() + 1}`
          : moment().month() + 1
      }:${moment().date() < 10 ? "0" + moment().date() : moment().date()}`,
    });
    await userSingUp.save();
  }

  await ctx.scene.enter("showMainMenu");
});

//

//

//
module.exports = { step1, step2, step3, step4 };
