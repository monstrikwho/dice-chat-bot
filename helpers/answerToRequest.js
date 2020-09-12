module.exports = async ($, td, selectUser) => {
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
      return `[<i>${timeText}</i>] 
${disciplineText[0]}➖ ${subgroupText[0]} подгр.
${teacherText[0]}  ➖ ${lectureHallText[0]}

${disciplineText[1]}➖ ${subgroupText[1]} подгр.
${teacherText[1]} ➖ ${lectureHallText.length > 1
  ? lectureHallText[1]
  : lectureHallText[0]}`;

    } else {
      
      return `[<i>${timeText}</i>]
${disciplineText}${(subgroupText.replace(/\s/g, "").length > 0) ? `➖ ${subgroupText} ${(selectUser.person === 'Студент') ? 'подгр.' : ''}` : ''}
${teacherText}  ${(lectureHallText.replace(/\s/g, "").length > 0 && selectUser.person === 'Студент') ? `➖ ${lectureHallText}` : ''}`;
    }
  }
}