const moment = require("moment");
const { places, inUniversity, outUniversity } = require("../keyboards/autobus");

module.exports.nearest = async (ctx, autobusObj, flag) => {
  const date = new Date();
  const hoursToday = date.getHours();
  const minutesToday =
    date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();

  for (let num of Object.keys(autobusObj)) {
    let timeArr = flag === "in" ? inUniversity[num] : outUniversity[num];
    if (flag === "in") {
      const place = autobusObj[num];
      const placeKey = places[num].indexOf(place);
      timeArr = timeArr[placeKey];
    }

    const takeTime = [];
    for (let time of timeArr) {
      const [hours, minutes] = time.split(":");
      if (
        (+hours === hoursToday && +minutes > minutesToday) ||
        +hours > hoursToday
      ) {
        takeTime.push(`${hours}:${minutes}`);
      }
    }
    const nearestTime = takeTime.slice(0, 3);

    await ctx.reply(`${num} автобус
${nearestTime
  .map((item) => {
    const [hours, minute] = item.split(":");

    const diffHours = moment([2007, 0, 29, hours, minute, 00]).diff(
      [2007, 0, 29, hoursToday, minutesToday, 00],
      "hours"
    );
    const diffMinutes = moment([2007, 0, 29, hours, minute, 00]).diff(
      [2007, 0, 29, hoursToday, minutesToday, 00],
      "minutes"
    );

    if (diffHours !== 0) {
      const restMinutes = diffMinutes - diffHours * 60;
      return `через ${diffHours}:${restMinutes} часа  -  ${item}`;
    } else {
      return `через ${diffMinutes} минут  -  ${item}`;
    }
  })
  .join(", \n")}
    `);
  }
};
