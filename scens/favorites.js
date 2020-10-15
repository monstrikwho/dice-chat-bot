const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const User = require("../models/user");

//

const favoritesMenu = new Scene("favoritesMenu");
favoritesMenu.enter(async (ctx) => {
  return await ctx.reply(
    "Вы вошли в избранное",
    Extra.markup(
      Markup.keyboard([
        ["Студенты", "Препод-ли"],
        // ["Студенты", "Препод-ли", "Автобусы"],
        ["↪️ Вернуться назад"],
      ]).resize()
    )
  );
});

favoritesMenu.hears("Студенты", async (ctx) => {
  await ctx.scene.enter("favoritesStudents");
});
favoritesMenu.hears("Препод-ли", async (ctx) => {
  await ctx.scene.enter("favoritesTeachers");
});
// favoritesMenu.hears("Автобусы", async (ctx) => {
//   await ctx.scene.enter("favoritesAutobus");
// });
favoritesMenu.hears("↪️ Вернуться назад", async (ctx) => {
  await ctx.scene.enter("showMainMenu");
});

//

//

//

// ***************************************************************
const favoritesStudents = new Scene("favoritesStudents");
favoritesStudents.enter(async (ctx) => {
  const user = await User.findOne({ userId: ctx.from.id });

  ctx.session.state = {
    favStudents: user.favStudents,
  };

  if (!user.favStudents || user.favStudents.length === 0) {
    return await ctx.reply(
      "Пожалуйста, добавьте группу в избранное, чтобы посмотреть расписание. (Другое -> Расп. др. групп -> Добавить в избранное)",
      Extra.markup(Markup.keyboard([["↪️ Вернуться назад"]]).resize())
    );
  }

  return await ctx.reply(
    "Пожалуйста, выберите группу, чтобы посмотреть расписание.",
    Extra.markup(
      Markup.keyboard([
        user.favStudents.slice(0, 3),
        user.favStudents.slice(3, 6),
        ["✏️ Изменить", "↪️ Вернуться назад"],
      ]).resize()
    )
  );
});

favoritesStudents.hears(/./, async (ctx) => {
  const favStudents = ctx.session.state.favStudents;
  const message = ctx.update.message.text;

  if (message === "↪️ Вернуться назад") {
    return await ctx.scene.enter("favoritesMenu");
  }

  if (message === "✏️ Изменить") {
    ctx.session.state = {
      ...ctx.session.state,
      edit: "stud",
    };
    return await ctx.scene.enter("editFavorites");
  }

  if (favStudents.indexOf(message) !== -1) {
    await User.updateOne({ userId: ctx.from.id }, { otherStudents: message });

    await ctx.replyWithHTML(
      `Вы успешно выбрали группу: <pre language="c++">👉🏻 ${message}</pre>`
    );

    return await ctx.scene.enter("setupDay");
  }
});

//

//

//

// **************************************************************

const favoritesTeachers = new Scene("favoritesTeachers");
favoritesTeachers.enter(async (ctx) => {
  const user = await User.findOne({ userId: ctx.from.id });

  ctx.session.state = {
    favTeachers: user.favTeachers,
  };

  if (!user.favTeachers || user.favTeachers.length === 0) {
    return await ctx.reply(
      "Пожалуйста, выберите добавьте преподавателя в избранное, чтобы посмотреть расписание. (Другое -> Расп. препод-ей -> Добавить в избранное)",
      Extra.markup(Markup.keyboard([["↪️ Вернуться назад"]]).resize())
    );
  }

  return await ctx.reply(
    "Пожалуйста, выберите преподавателя, чтобы посмотреть расписание.",
    Extra.markup(
      Markup.keyboard([
        user.favTeachers.slice(0, 2),
        user.favTeachers.slice(2, 4),
        user.favTeachers.slice(4, 6),
        ["✏️ Изменить", "↪️ Вернуться назад"],
      ]).resize()
    )
  );
});

favoritesTeachers.hears(/./, async (ctx) => {
  const favTeachers = ctx.session.state.favTeachers;
  const message = ctx.update.message.text;

  if (message === "↪️ Вернуться назад") {
    return await ctx.scene.enter("favoritesMenu");
  }

  if (message === "✏️ Изменить") {
    ctx.session.state = {
      ...ctx.session.state,
      edit: "teach",
    };
    return await ctx.scene.enter("editFavorites");
  }

  if (favTeachers.indexOf(message) !== -1) {
    await User.updateOne({ userId: ctx.from.id }, { otherTeacher: message });

    await ctx.replyWithHTML(
      `Вы успешно выбрали преподавателя: <pre language="c++">👉🏻 ${message}</pre>`
    );

    return await ctx.scene.enter("setupDay");
  }
});

//

//

//

// **************************************************************

const favoritesAutobus = new Scene("favoritesAutobus");
favoritesAutobus.enter(async (ctx) => {
  const user = await User.findOne({ userId: ctx.from.id });

  if (!user.favAutobuses) {
    return await ctx.reply(
      "Вы не добавили автобсы в избранное.",
      Extra.markup(Markup.keyboard([["↪️ Вернуться назад"]]).resize())
    );
  }

  return await ctx.reply(
    "Вы вошли к выбору избранных автобусов",
    Extra.markup(
      Markup.keyboard([
        user.favAutobuses.slice(0, 2),
        user.favAutobuses.slice(2, 4),
        user.favAutobuses.slice(4, 6),
        ["↪️ Вернуться назад"],
      ]).resize()
    )
  );
});

favoritesAutobus.hears("↪️ Вернуться назад", async (ctx) => {
  await ctx.scene.enter("favoritesMenu");
});

//

//

//

// ******************************************************************
const editFavorites = new Scene("editFavorites");
editFavorites.enter(async (ctx) => {
  let items = [];
  const editFlag = ctx.session.state.edit;

  if (editFlag === "stud") items = ctx.session.state.favStudents;
  if (editFlag === "teach") items = ctx.session.state.favTeachers;

  return await ctx.reply(
    "Выберите, что вы хотите удалить.",
    Extra.markup(
      Markup.keyboard([
        items.slice(0, 2),
        items.slice(2, 4),
        items.slice(4, 6),
        ["❌ Отмена"],
      ]).resize()
    )
  );
});

editFavorites.hears(/./, async (ctx) => {
  const message = ctx.update.message.text;

  if (message === "❌ Отмена") {
    return await ctx.scene.enter("favoritesMenu");
  }

  let items = [];
  const editFlag = ctx.session.state.edit;

  if (editFlag === "stud") items = ctx.session.state.favStudents;
  if (editFlag === "teach") items = ctx.session.state.favTeachers;

  if (items.indexOf(message) !== -1) {
    items.splice(items.indexOf(message), 1);

    if (editFlag === "stud") {
      await User.updateOne({ userId: ctx.from.id }, { favStudents: items });
      await ctx.scene.enter("favoritesStudents");
    }

    if (editFlag === "teach") {
      await User.updateOne({ userId: ctx.from.id }, { favTeachers: items });
      await ctx.scene.enter("favoritesTeachers");
    }
  }
});

//

//

//

module.exports = {
  favoritesMenu,
  favoritesStudents,
  favoritesTeachers,
  favoritesAutobus,
  editFavorites,
};
