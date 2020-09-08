const dateHelper = require("./getNowDay");
const request = require("./request");

const getRasp = async (ctx, setDay) => {
  // Если выходные, рассисание не присылаем
  if(dateHelper.today === 5 && setDay === 9) return ctx.reply('А завтра, вроде бы как, выходной 🙃') // Если пятница и мы жмем на кнопку "Завтра"
  if((dateHelper.today === 6 || dateHelper.today === 0) && (setDay === 8)) {
    return ctx.reply('Как бы выходной, не? 🙃')
  }

  // if(dateHelper.today === 0 && setDay === 9) // воскр - пн.

  // Если у нас выходные, но мы клацаем во кладке "Неделя"
  // Добавить сюда в условие, если у нас воскресенье и  мы просим расп. на завтра, т.е. понедельник
  if((dateHelper.today === 6 || dateHelper.today === 0) && (setDay.toString().match(/(?:0|1|2|3|4)/))) {
    return await request(ctx, await dateHelper.nextWeek(), setDay)
  }

  // Если у нас будни
  if(dateHelper.today.toString().match(/(?:|1|2|3|4|5)/)) {
    return await request(ctx, await dateHelper.countWeek(), setDay)
  }
  
};

module.exports = getRasp;
