const axios = require("axios");
const cheerio = require("cheerio");
const querystring = require("querystring");

const dateHelper = require('./getNowDay')

const User = require("../models/user");

module.exports = async (ctx, reqWeek, setDay) => {
  const selectUser = await User.findOne({ userId: ctx.from.id });
  let data = {
    ft: 0,
    sp: 0,
    gp: selectUser.group,
    nd: reqWeek,
    go: "Показать",
  }
  let URL = () => {
    if(selectUser.person === 'Студент') return `http://rasp.barsu.by/stud.php`
    data = {
      kf: 0,
      tch: selectUser.teacherName,
      nd: reqWeek,
      go: 'Показать',
    }
    return `http://rasp.barsu.by/teach.php`
  }

  await axios
    .post(URL(), querystring.stringify(data)
    )
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

      // 0=Пн, 1=Вт, 2=Ср, 3=Чт, 4=Пт, 5=Вся неделя, 8=Сегодня, 9=Завтра
      const tr = setDay.toString().match(/(?:0|1|2|3|4)/)
        ? week[setDay]
        : setDay !== 9
        ? week[today-1]
        : week[today];

      // const dayWeek = {
      //   0: 'Понедельник',
      //   1: 'Вторник',
      //   2: 'Среда',
      //   3: 'Четверг',
      //   4: 'Пятница',
      // }

      // ctx.reply(`${dateHelper.nowDate().day}.${dateHelper.nowDate().month}.${dateHelper.nowDate().year} - ${setDay.toString().match(/(?:0|1|2|3|4)/)
      //   ? dayWeek[setDay]
      //   : setDay !== 9
      //   ? dayWeek[today-1]
      //   : dayWeek[today]}`)

      for (let i = 0; i < tr.length; i++) {
        let td;
        if (i === 0) {
          td = $(tr[i]).find("td").slice(2, 7);
        } else {
          td = $(tr[i]).find("td");
        }

        const time = td[0];
        const discipline = td[1];
        const subgroup = td[2];
        const teacher = td[3];
        const lectureHall = td[4];

        const timeText = $(time).text().replace(/\s/g, "");
        let disciplineText = $(discipline).text();
        let subgroupText = $(subgroup).text();
        let teacherText = $(teacher).text();
        let lectureHallText = $(lectureHall).text();

        if (subgroupText.replace(/\s/g, "").length === 2) {
          disciplineText = $(discipline)
            .html()
            .replace("<td>", "")
            .replace("</td>", "")
            .split("<br>", 2);
          subgroupText = $(subgroup)
            .html()
            .replace("<td>", "")
            .replace("</td>", "")
            .split("<br>", 2);
          teacherText = $(teacher)
            .html()
            .replace("<td>", "")
            .replace("</td>", "")
            .split("<br>", 2);
          lectureHallText = $(lectureHall)
            .html()
            .replace("<br><br>", "")
            .replace("<td>", "")
            .replace("</td>", "")
            .split("<br>", 2);
        }

        if (disciplineText.length > 1) {
          if (Array.isArray(subgroupText)) {
            // НЕ МЕНЯТЬ ОТСТУПЫ НИЖЕ!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            let answer = `[<i>${timeText}</i>] 
${disciplineText[0]}➖ ${subgroupText[0]} подгр.
${teacherText[0]}  ➖ ${lectureHallText[0]}

${disciplineText[1]}➖ ${subgroupText[1]} подгр.
${teacherText[1]} ➖ ${lectureHallText.length > 1
  ? lectureHallText[1]
  : lectureHallText[0]}`;
            await ctx.replyWithHTML(answer);
          } else {
            let answer = `[<i>${timeText}</i>]
${disciplineText}${(subgroupText.replace(/\s/g, "").length > 0) ? `➖ ${subgroupText} ${(selectUser.person === 'Студент') ? 'подгр.' : ''}` : ''}
${teacherText}  ${(lectureHallText.replace(/\s/g, "").length > 0 && selectUser.person === 'Студент') ? `➖ ${lectureHallText}` : ''}`;
            await ctx.replyWithHTML(answer);
          }
        }
      }
    });

}