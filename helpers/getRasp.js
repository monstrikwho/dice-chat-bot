const dateHelper = require("./getNowDay");
const request = require("./request");

const getRasp = async (ctx, setDay) => {
  // Если выходные, рассисание не присылаем
  if (dateHelper.today === 5 && setDay === 9)
    return ctx.reply("А завтра, вроде бы как, выходной 🙃"); // Если пятница и мы жмем на кнопку "Завтра"
  if ((dateHelper.today === 6 || dateHelper.today === 0) && setDay === 8) {
    return ctx.reply("Как бы выходной, не? 🙃");
  }

  // Если у нас выходные, но мы клацаем во кладке "Неделя"
  if (
    (dateHelper.today === 6 || dateHelper.today === 0) &&
    setDay.toString().match(/(?:0|1|2|3|4)/)
  ) {
    return await request(ctx, await dateHelper.nextWeek(), setDay);
  }

  // Если у нас будни
  if (dateHelper.today.toString().match(/(?:|1|2|3|4|5)/)) {
    return await request(ctx, await dateHelper.countWeek(), setDay);
  }
};

module.exports = getRasp;
