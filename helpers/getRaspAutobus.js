const moment = require("moment");
const {
  places,
  inUniversity,
  outUniversity,
  weekendIn,
  weekendOut,
} = require("../keyboards/autobus");

module.exports.nearest = async (ctx, autobusObj, flag) => {
  const date = new Date();
  const hoursToday = date.getHours();
  const minutesToday =
    date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
  const today = date.getDay();

  for (let num of Object.keys(autobusObj)) {
    // Если выходные дни, выставляем другое расписание
    if ((today === 0 || today === 6) && (num === "31" || num === "32")) {
      await ctx.reply(`${num} автобус не курсирует в выходные дни.`);
    } else {
      let timeArr =
        flag === "in"
          ? today === 0 || today === 6
            ? weekendIn[num]
            : inUniversity[num]
          : today === 0 || today === 6
          ? weekendOut[num]
          : outUniversity[num];

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

    const declination = (item) => {
      if (
        item
          .toString()
          .match(
            /(?:5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|25|26|27|28|29|30|35|36|37|38|39|40|45|46|47|48|49|50|55|56|57|58|59)/
          )
      )
        return "минут";
      if (item.toString().match(/(?:1|21|31|41|51)/)) return "минуту";
      if (
        item.toString().match(/(?:2|3|4|22|23|24|32|33|34|42|43|44|52|53|54)/)
      )
        return "минуты";
    };

    if (diffHours !== 0) {
      const restMinutes = diffMinutes - diffHours * 60;
      return `через ${diffHours}:${
        restMinutes < 10 ? "0" + restMinutes : restMinutes
      } часа  -  ${item}`;
    } else {
      return `через ${diffMinutes} ${declination(diffMinutes)}  -  ${item}`;
    }
  })
  .join(", \n")}
    `);
    }
  }
};
