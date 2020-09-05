const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");
const querystring = require("querystring");
const nodeHtmlToImage = require("node-html-to-image");
const User = require("../models/user");

const nowDate = require("./getNowDay")();

const requestToday = async (ctx, setDay) => {
  const selectUser = await User.findOne({ userId: ctx.from.id });

  // console.log(nowDate);

  await axios
    .post(
      `http://rasp.barsu.by/stud.php`,
      querystring.stringify({
        ft: 0,
        sp: 0,
        gp: selectUser.group,
        nd: "2020-09-07",
        go: "Показать",
      })
    )
    .then((res) => {
      const $ = cheerio.load(res.data);
      const table = $(".table-responsive tbody");

      const Monday = table.find("tr").slice(0, 8);
      const Tuesday = table.find("tr").slice(9, 17);
      const Wednesday = table.find("tr").slice(18, 26);
      const Thursday = table.find("tr").slice(27, 35);
      const Friday = table.find("tr").slice(36, 44);
      const Saturday = table.find("tr").slice(45, 53);

      const week = [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday];
      const today = new Date().getDay();

      // const tr =
      //   setDay && setDay !== 9
      //     ? week[setDay]
      //     : setDay !== 9
      //     ? week[today-3]
      //     : week[today -2];
      const tr =
        setDay && setDay !== 9
          ? week[setDay]
          : setDay !== 9
          ? week[today]
          : week[today + 1];

      tr.each((i, item) => {
        let td;
        if (i === 0) {
          td = $(item).find("td").slice(2, 6);
        } else {
          td = $(item).find("td");
        }

        const time = td[0];
        const discipline = td[1];
        const subgroup = td[2];
        const teacher = td[3];
        const lectureHall = td[4];

        const timeText = $(time).text().replace(/\s/g, "");
        const disciplineText = $(discipline).text();
        const subgroupText =
          $(subgroup).text().replace(/\s/g, "") > 0
            ? $(subgroup).text() + " подгр."
            : "";
        const teacherText = $(teacher).text();
        const lectureHallText = $(lectureHall).text().replace(/\s/g, "");

        var isEmpty = (elem) => {
          if (elem.length > 2) return ` - ${elem}`;
          return "";
        };

        if (disciplineText.length > 2) {
          ctx.replyWithHTML(
            `[<i>${timeText}</i>] ${disciplineText}` +
              subgroupText +
              isEmpty(teacherText) +
              isEmpty(lectureHallText)
          );
        }
      });
    });
};

module.exports = requestToday;
