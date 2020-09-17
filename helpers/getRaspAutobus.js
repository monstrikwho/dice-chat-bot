const { places, inUniversity, outUniversity } = require("../keyboards/autobus");

module.exports.nearest = async (ctx, autobusObj, flag) => {
  const date = new Date();
  // const hoursToday = 9
  // const minutesToday = 58
  const hoursToday = date.getHours();
  const minutesToday =
    date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();

  for(let num of Object.keys(autobusObj)) {
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
    await ctx.reply(`${num} - ${nearestTime}`);
  }
};
