const dateHelper = require("./getNowDay");
const request = require("./request");

const getRasp = async (ctx, setDay) => {
  const today = new Date().getDay();
  // SETDAY === 0=Пн, 1=Вт, 2=Ср, 3=Чт, 4=Пт, 5=Вся неделя, 8=Сегодня, 9=Завтра
  // TODAY === 0-Вс, 1-Пн, 2-Вт, 3-Ср, 4-Чт, 5-Пт, 6-Сб.
  await ctx.replyWithChatAction("typing");
  // Если выходные, рассисание не присылаем
  if (today === 0 && setDay === 9) {
    return await request(ctx, await dateHelper.nextWeek(), setDay);
  } // Если воскресенье и мы жмем на кнопку "Завтра"

  if ((today === 5 || today === 6) && setDay === 9) {
    return await ctx.reply("А завтра, вроде бы как, выходной 🙃");
  } // Если пятница или суббота и мы жмем на кнопку "Завтра"

  if ((today === 6 || today === 0) && setDay === 8) {
    return await ctx.reply("Как бы выходной, не? 🙃");
  } // Если суббота или воскр. и жмем на кнопку "Сегодня"

  // Если у нас чт-вс и мы клацаем во вкладке "Неделя"
  if (
    today.toString().match(/(?:4|5|6|0)/) &&
    setDay.toString().match(/(?:0|1|2|3|4)/)
  ) {
    return await request(ctx, await dateHelper.nextWeek(), setDay);
  }

  // Если у нас будни
  if (today.toString().match(/(?:|1|2|3|4|5)/)) {
    return await request(ctx, await dateHelper.countWeek(), setDay);
  }
};

module.exports = getRasp;
