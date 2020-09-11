const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const buttonNames = require("../keyboards/buttonNames");
const groupsHook = require("../keyboards/getGroupsHook");

const User = require("../models/user");
const Teachers = require("../models/teachers");

// *************************** STEP 1 *******************************************
const step1 = new Scene("step1");
step1.enter((ctx) => {
  ctx.session.state = { personId: ctx.update.message.from.id };
  ctx.reply(
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
step1.hears(/./, (ctx) => ctx.reply("Такой команды не существует"));
step1.leave((ctx) => ctx.deleteMessage());
step1.action(/(?:Студент|Преподаватель)/, (ctx) => {
  ctx.session.state = { person: ctx.match[0] };
  ctx.scene.enter("step2");
});

// *************************** STEP 2 ******************************************
const step2 = new Scene("step2");
step2.enter((ctx) => {
  if (ctx.session.state.person === "Студент") {
    ctx.reply(
      "Окей, давай теперь найдем твою группу. Выбери пожалуйста свой факультет: ",
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
    ctx.reply("Пожалуйста, введите свою фамилию.");
  }
});
step2.hears(/./, async (ctx) => {
  if (ctx.session.state.person === "Студент") {
    return ctx.reply("Стой, нажми на кнопку выше");
  }

  if (ctx.session.state.person === "Преподаватель") {
    // После того, как сохранили инфу ниже, сохраняем ФИО преподавателя
    const statusUser = await User.findOne({ userId: ctx.from.id });
    if (statusUser) {
      await User.updateOne(
        { userId: ctx.from.id },
        { teacherName: ctx.update.message.text }
      );
      return ctx.scene.enter("showMainMenu");
    }
    // Сохраняем преподавателя, как юзера
    const message = ctx.update.message.text.replace(/\s/g, "");
    const statusId = await Teachers.find({
      lastName: message[0].toUpperCase() + message.slice(1),
    });
    if (statusId.length !== 0) { 
      const user = new User({
        userId: ctx.from.id,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        userName: ctx.from.username,
        person: ctx.session.state.person,
      });
      await user.save();
      return ctx.reply(
        "Подтвердите, это вы?",
        Extra.markup(
          Markup.keyboard([statusId.map((item) => item.teacher)]).resize()
        )
      );
    } else {
      ctx.reply("Такой фамилии нету. Попробуйте еще раз.");
    }
  } else {
    ctx.reply("Такой команды нету.");
  }
});
step2.leave((ctx) => ctx.deleteMessage());
step2.action(/(?:ИФ|ФПиП|ИПКиП|ФЭП|ФСиГЯ)/, (ctx) => {
  ctx.session.state = { ...ctx.session.state, faculty: ctx.match[0] };
  ctx.scene.enter("step3");
});

// ************************** STEP 3 ******************************************
const step3 = new Scene("step3");
let reGex3 = /./;
step3.enter((ctx) => {
  const faculty = () => {
    if (ctx.session.state.faculty === "ИФ") {
      reGex3 = /(?:АТП|А|ИТвМ|ИСТ|МиМ|ПИТТ|ТОСП|ТО|ТМ)/;
      return "if";
    }
    if (ctx.session.state.faculty === "ФПиП") {
      reGex3 = /(?:ГЭ|ДО|НО|ОТИ|ОП|ПП|СП|СПД|ТиМОВ|ФК)/;
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
  ctx.reply(
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
step3.hears(/./, (ctx) => ctx.reply("Стой, нажми на кнопку выше"));
step3.leave((ctx) => ctx.deleteMessage());
step3.action(reGex3, (ctx) => {
  ctx.session.state = {
    ...ctx.session.state,
    specialty: ctx.update.callback_query.data,
  };
  ctx.scene.enter("step4");
});

// ************************** STEP 4 ******************************************
const step4 = new Scene("step4");
let reGex4 = /./;
step4.enter((ctx) => {
  let resGroupHook = [...groupsHook(ctx)];
  reGex4 = resGroupHook[0];

  ctx.reply(
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
step4.hears(/./, (ctx) => ctx.reply("Стой, нажми на кнопку выше"));
step4.leave(async (ctx) => {
  ctx.deleteMessage();
  ctx.replyWithHTML(
    `Вы успешно выбрали группу: <pre language="c++">👉🏻 ${ctx.session.state.group}</pre>`
  );
});
step4.action(reGex4, async (ctx) => {
  ctx.session.state = {
    ...ctx.session.state,
    group: ctx.update.callback_query.data,
  };

  const user = new User({
    userId: ctx.from.id,
    firstName: ctx.from.first_name,
    lastName: ctx.from.last_name,
    userName: ctx.from.username,
    person: ctx.session.state.person,
    faculty: ctx.session.state.faculty,
    group: ctx.session.state.group,
  });
  await user.save();

  ctx.scene.enter("showMainMenu");
});

//
module.exports = { step1, step2, step3, step4 };
