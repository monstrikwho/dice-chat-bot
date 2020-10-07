const fs = require("fs");
const nodeHtmlToImage = require("node-html-to-image");
const { bot } = require("../init/startBot");
const { raspPhoto } = require("../helpers/styles");

module.exports = async ($, week, selectUser) => {
  let body = ``;

  for (let tr of week) {
    let weekDay = null;
    let date = null;
    let time = [];
    let discipline = [];
    let group = [];
    let subgroup = [];
    let teacher = [];
    let lectureHall = [];

    const getArrData = (tdArr, flag) => {
      if (selectUser.person === "Преподаватель" || selectUser.otherTeacher) {
        const disciplineArr = $(tdArr[1 + flag]).text();
        const groupArr = $(tdArr[2 + flag]).text();
        const lectureHallArr = $(tdArr[3 + flag]).text();

        time.push(
          $(tdArr[0 + flag])
            .text()
            .trim()
        );
        discipline.push(disciplineArr);
        group.push(groupArr);
        lectureHall.push(lectureHallArr);
        return;
      }

      const disciplineArr = $(tdArr[1 + flag])
        .html()
        .replace("<td>", "")
        .replace("</td>", "")
        .split("<br>", 2);
      const subgroupArr = $(tdArr[2 + flag])
        .html()
        .replace("<td>", "")
        .replace("</td>", "")
        .split("<br>", 2);
      const teacherArr = $(tdArr[3 + flag])
        .html()
        .replace("<td>", "")
        .replace("</td>", "")
        .split("<br>", 2);
      const lectureHallArr = $(tdArr[4 + flag])
        .html()
        .replace("<br><br>", "")
        .replace("<td>", "")
        .replace("</td>", "")
        .split("<br>", 2);

      if (lectureHallArr.length === 1) {
        lectureHallArr.push("");
      }

      time.push(
        $(tdArr[0 + flag])
          .text()
          .trim()
      );
      discipline.push(disciplineArr);
      subgroup.push(subgroupArr);
      teacher.push(teacherArr);
      lectureHall.push(lectureHallArr);
    };

    // Проходим по каждой строке дня
    for (let i = 0; i < tr.length; i++) {
      const tdArr = $(tr[i]).find("td");
      if (i === 0) {
        weekDay = $(tdArr[0]).text().trim();
        date = $(tdArr[1]).text().trim();
        if ($(tdArr[3]).text().trim().length > 2) {
          // Если поле "дисциплина" не пустое
          getArrData(tdArr, 2); // Делаем смещение по флагу на две позиции
        }
      } else {
        if ($(tdArr[1]).text().trim().length > 2) {
          // Если поле "дисциплина" не пустое
          getArrData(tdArr, 0);
        }
      }
    }

    if (selectUser.person === "Преподаватель" || selectUser.otherTeacher) {
      body += `<div class="day-block">
        <div class="left-content">
          <div class="date">
            ${weekDay}<br />${date}
          </div>
        </div>
        <div class="right-content">
          ${discipline
            .map((item, i) => {
              const takeTime = time[i];
              const takeDiscipline = discipline[i];
              const takeGroup = group[i];
              const takeLectureHall = lectureHall[i];

              return `<div class="row">
                  <div class="time">${takeTime}</div>
                  <div class="descipline">${takeDiscipline}</div>
                  <div class="teacher">${takeGroup}</div>
                  <div class="type"></div>
                  <div class="audience">${takeLectureHall}</div>
                </div>`;
            })
            .join("")}
        </div>
      </div>`;
    } else {
      body += `<div class="day-block">
      <div class="left-content">
        <div class="date">
          ${weekDay}<br />${date}
        </div>
      </div>
      <div class="right-content">
        ${discipline
          .map((item, i) => {
            const takeTime = time[i];
            const takeDiscipline = discipline[i];
            const takeSubgroup = subgroup[i];
            const takeTeacher = teacher[i];
            const takeLectureHall = lectureHall[i];

            const typeDiscipline = (discipline) => {
              if (discipline === "ЛК") return `<div name="lk">ЛК</div>`;
              if (discipline === "ПЗ") return `<div name="pz">ПЗ</div>`;
              if (discipline === "ЛЗ") return `<div name="lz">ЛЗ</div>`;
              if (discipline === "СЗ") return `<div name="sz">СЗ</div>`;
              if (discipline === "КП (рк)") return `<div name="kp">КП</div>`;
            };

            const splitDiscipline = (discipline) => {
              const arr = discipline.split("-");
              const type = arr.pop().trim();
              const newArr = arr.join("-").trim();
              return [newArr, typeDiscipline(type)];
            };

            return takeDiscipline[1].length > 2
              ? `<div class="row">
                  <div class="time">${takeTime}</div>
                  <div class="type">
                    ${splitDiscipline(takeDiscipline[0])[1]}
                    ${splitDiscipline(takeDiscipline[1])[1]}
                  </div>
                  <div class="descipline">
                    ${
                      splitDiscipline(takeDiscipline[0])[0]
                    } - ${takeSubgroup[0].trim()}
                    <br />
                    ${
                      splitDiscipline(takeDiscipline[1])[0]
                    } - ${takeSubgroup[1].trim()}
                  </div>
                  <div class="teacher">${takeTeacher[0].trim()}<br>${takeTeacher[1].trim()}</div>
                  <div class="audience">${takeLectureHall[0].trim()}<br>${takeLectureHall[1].trim()}</div>
                </div>`
              : `<div class="row">
                <div class="time">${takeTime}</div>
                <div class="type">
                  ${splitDiscipline(takeDiscipline[0])[1]}
                </div>
                <div class="descipline">${
                  splitDiscipline(takeDiscipline[0])[0]
                } 
                ${
                  takeSubgroup[0].trim().length !== 0
                    ? ` - ${takeSubgroup[0].trim()}`
                    : ``
                }</div>
                <div class="teacher">${takeTeacher[0].trim()}</div>
                <div class="audience">${takeLectureHall[0].trim()}</div>
              </div>`;
          })
          .join("")}
      </div>
    </div>`;
    }

    // console.log(discipline);
  }

  await nodeHtmlToImage({
    output: `./images/${selectUser.userId}.png`,
    html: `<html>${raspPhoto}<body>
      <div class="container">
        <div class="header">
          <div style="width: 50px; padding: 4px; text-align: center;">День</div>
          <div style="width: 100px; padding: 4px; text-align: center;">Время</div>
          <div style="width: 180px; padding: 4px; text-align: center;">Дисциплина</div>
          <div style="width: 180px; padding: 4px; text-align: center;">${
            selectUser.person === "Преподаватель" || selectUser.otherTeacher
              ? `Группы`
              : `Преподаватель`
          }</div>
          <div style="width: 90px; padding: 4px; text-align: center;">Аудитория</div>
        </div>
      </div>
      ${body}
      <div class="footer">https://t.me/barsu_rasp_bot</div>
    </body></html>`,
    puppeteerArgs: {
      args: ["--no-sandbox", "--user-data-dir"],
    },
  })
    .then(async () => {
      await bot.telegram.sendPhoto(selectUser.userId, {
        source: `./images/${selectUser.userId}.png`,
      });
      try {
        fs.unlinkSync(`./images/${selectUser.userId}.png`);
      } catch (err) {
        console.log(err);
      }
    })
    .catch(async (err) => {
      console.log(err);
    });
};
