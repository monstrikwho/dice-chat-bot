const dateHelper = require("./getNowDay");
const request = require("./request");

const getRasp = async (ctx, setDay) => {
  const today = new Date().getDay();
  // SETDAY === 0=Текущая неделя, 1=Следующая неделя, 8=Сегодня, 9=Завтра
  // TODAY === 0-Вс, 1-Пн, 2-Вт, 3-Ср, 4-Чт, 5-Пт, 6-Сб.
  await ctx.replyWithChatAction("typing");

  if (today === 0 && setDay === 9) {
    return await request(ctx, await dateHelper.nextWeek(), setDay);
  } // Если воскресенье и мы жмем на кнопку "Завтра"
  
  if ((today === 5 || today === 6) && setDay === 9) {
    return await ctx.reply("А завтра, вроде бы как, выходной 🙃");
  } // Если пятница или суббота и мы жмем на кнопку "Завтра"

  if ((today === 6 || today === 0) && setDay === 8) {
    return await ctx.reply("Как бы выходной, не? 🙃");
  } // Если суббота или воскр. и жмем на кнопку "Сегодня"
  
  // Если просим полное расписание на следующую неделю
  if (setDay === 1) {
    return await request(ctx, await dateHelper.nextWeek(), setDay);
  } else {
    // Если просим полное расписание на текущую неделю
    return await request(ctx, await dateHelper.countWeek(), setDay);
  }
};

module.exports = getRasp;
