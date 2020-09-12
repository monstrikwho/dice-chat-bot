const dateHelper = require("./getNowDay");
const request = require("./request");

const getRasp = async (ctx, setDay) => {
  // SETDAY === 0=Пн, 1=Вт, 2=Ср, 3=Чт, 4=Пт, 5=Вся неделя, 8=Сегодня, 9=Завтра
  // TODAY === 0-Вс, 1-Пн, 2-Вт, 3-Ср, 4-Чт, 5-Пт, 6-Сб.
  // Если выходные, рассисание не присылаем
  if ((dateHelper.today === 5 || dateHelper.today === 6) && setDay === 9)
    return ctx.reply("А завтра, вроде бы как, выходной 🙃"); // Если пятница и мы жмем на кнопку "Завтра"
  if ((dateHelper.today === 6 || dateHelper.today === 0) && setDay === 8) {
    return ctx.reply("Как бы выходной, не? 🙃"); // Если суббота или воскр. и жмем на кнопку "Сегодня"
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
