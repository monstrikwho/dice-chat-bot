const axios = require("axios");
const cheerio = require("cheerio");
const querystring = require("querystring");

const User = require("../models/user");

const answerToRequest = require("./answerToRequest");

module.exports = async (ctx, reqWeek, setDay) => {
  const selectUser = await User.findOne({ userId: ctx.from.id });
  const user = {
    data() {
      if (selectUser.otherTeacher) {
        return {
          kf: 0,
          tch: selectUser.otherTeacher,
          nd: reqWeek,
          go: "Показать",
        };
      }
      if (selectUser.otherStudents) {
        return {
          ft: 0,
          sp: 0,
          gp: selectUser.otherStudents,
          nd: reqWeek,
          go: "Показать",
        };
      }
      if (selectUser.person === "Студент") {
        return {
          ft: 0,
          sp: 0,
          gp: selectUser.group,
          nd: reqWeek,
          go: "Показать",
        };
      }
      if (selectUser.person === "Преподаватель") {
        return {
          kf: 0,
          tch: selectUser.teacherName,
          nd: reqWeek,
          go: "Показать",
        };
      }
    },
    url() {
      if (selectUser.otherTeacher) {
        return `http://rasp.barsu.by/teach.php`;
      }
      if (selectUser.otherStudents) {
        return `http://rasp.barsu.by/stud.php`;
      }
      if (selectUser.person === "Студент") {
        return `http://rasp.barsu.by/stud.php`;
      }
      if (selectUser.person === "Преподаватель") {
        return `http://rasp.barsu.by/teach.php`;
      }
    },
  };

  await axios
    .post(user.url(), querystring.stringify(user.data()))
    .then(async (res) => {
      const $ = cheerio.load(res.data, { decodeEntities: false });
      const table = $(".table-responsive tbody");

      const Monday = table.find("tr").slice(0, 8);
      const Tuesday = table.find("tr").slice(9, 17);
      const Wednesday = table.find("tr").slice(18, 26);
      const Thursday = table.find("tr").slice(27, 35);
      const Friday = table.find("tr").slice(36, 44);
      const Saturday = table.find("tr").slice(45, 53);

      const week = [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday];
      const today = new Date().getDay();

      // SETDAY === 0=Пн, 1=Вт, 2=Ср, 3=Чт, 4=Пт, 5=Вся неделя, 8=Сегодня, 9=Завтра
      // TODAY === 0-Вс, 1-Пн, 2-Вт, 3-Ср, 4-Чт, 5-Пт, 6-Сб.
      const tr = setDay.toString().match(/(?:0|1|2|3|4)/)
        ? week[setDay]
        : setDay !== 9 // Если жмем на "сегодня"
        ? week[today - 1] // Берем текущий день
        : today === 0 // Если у нас Вс
        ? week[0] // Берем след Пн
        : week[today]; // Берем след день

      let count = 0;

      for (let i = 0; i < tr.length; i++) {
        let td;
        if (i === 0) {
          td = $(tr[i]).find("td").slice(2, 7);
        } else {
          td = $(tr[i]).find("td");
        }

        const answer = answerToRequest($, td, selectUser);

        if (answer) {
          count++;
          await ctx.replyWithHTML(answer);
        }
      }
      
      if (count === 0) {
        await ctx.reply("На этот день пар нету.");
      }
    })
    .catch((err) => {
      ctx.reply("Мне жаль, но сайт с расписанием накрылся 😞");
    });
};
