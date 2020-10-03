const nodeHtmlToImage = require("node-html-to-image");
const { bot } = require("../init/startBot");


module.exports = async ($, week, selectUser) => {
  const styles = `
  <head>
  <style>
    * {
      padding: 0;
      margin: 0;
    }
    
    html {
      width: 680px;
      background-color: #edeef0;
    }
    
    body {
      padding: 15 12px
    }

    .header {
      padding: 2px 0;
      width: 100%;
      display: flex;
      color: #fff;
      background: #55677D;
      border-radius: 8px;
      box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.08), 0px 2px 24px rgba(0, 0, 0, 0.08);
    }

    .time-update {
      margin-top: 20px;
      padding: 2px 4px;
      background-color: #4e5966;
      color: #fff;
      text-align: center;
      border-radius: 4px;
    }

    .day-block {
      margin-top: 15px;
      width: 100%;
      display: flex;
      background: #fff;
      border-radius: 8px;
      box-shadow: 2px 4px 12px rgba(12, 12, 12, 0.2);
    }

    .left-content {
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      border-radius: 8px 0 0 8px;
      background-color: #5181b8;
      color: #fff;
    }

    .right-content {
      flex-grow: 1;
    }

    .row {
      padding: 4px;
      display: flex;
      border-bottom: 1px solid #d7d8d9;
    }

    .row:first-child {
      border-radius: 0 8px 0 0;
    }

    .row:last-child {
      border: none;
      border-radius: 0 0 8px 0;
    }

    .row div {
      padding: 4px;
    }

    .select {
      /* width: calc(100% - 17px); */
      background-color: #ffd6cc;
      border-bottom: 1px solid #fff;
    }

    .date {
      width: 50px;
    }

    .time {
      width: 90px;
      align-self: center;
      text-align: center;
    }

    .descipline {
      width: 190px;
      align-self: center;
    }

    .subgroup {
      width: 20px;
      align-self: center;
    }

    .teacher {
      width: 140px;
      align-self: center;
    }

    .audience {
      width: 90px;
      align-self: center;
    }

    .type {
      width: 30px;
      display: flex;
      flex-direction: column;
      color: #fff;
    }

    .type div {
      padding: 2px 4px;
      border-radius: 4px;
      text-align: center;
    }

    div[name="pz"] {
      background-color: #e64646;
    }
    div[name="lk"] {
      background-color: #4bb34b;
    }
    div[name="lz"] {
      background-color: #ffc107;
    }
    div[name="sz"] {
      background-color: #63b9ba;
    }
    div[name="kp"] {
      background-color: #017072;
    }
  </style>
  </head>
  `;

  let body = ``;

  for (let tr of week) {
    let weekDay = null;
    let date = null;
    let time = [];
    let discipline = [];
    let subgroup = [];
    let teacher = [];
    let lectureHall = [];

    const getArrData = (tdArr, flag) => {
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
            // console.log(discipline);
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
              <div class="descipline">${
                splitDiscipline(takeDiscipline[0])[0]
              } - ${takeSubgroup[0].trim()}<br />${
                splitDiscipline(takeDiscipline[1])[0]
              } - ${takeSubgroup[1].trim()}</div>
              
              <div class="teacher">${takeTeacher[0].trim()}<br>${takeTeacher[1].trim()}</div>
              <div class="audience">${takeLectureHall[0].trim()}<br>${takeLectureHall[1].trim()}</div>
            </div>`
            : `<div class="row">
              <div class="time">${takeTime}</div>
              <div class="type">
                ${splitDiscipline(takeDiscipline[0])[1]}
              </div>
              <div class="descipline">${splitDiscipline(takeDiscipline[0])[0]} 
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

    // console.log(discipline);
  }

  await nodeHtmlToImage({
    output: "./images/image.png",
    html: `<html>${styles}<body>
      <div class="container">
        <div class="header">
          <div style="width: 50px; padding: 4px; text-align: center;">День</div>
          <div style="width: 100px; padding: 4px; text-align: center;">Время</div>
          <div style="width: 180px; padding: 4px; text-align: center;">Дисциплина</div>
          <div style="width: 140px; padding: 4px; text-align: center;">Преподаватель</div>
          <div style="width: 90px; padding: 4px; text-align: center;">Аудитория</div>
        </div>
      </div>
      ${body}
    </body></html>`,
  }).then(async () => {
    await bot.telegram.sendPhoto(selectUser.userId, { source: './images/image.png' })
  });
};
