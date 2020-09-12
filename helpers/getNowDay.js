const Weeks = require("../models/weeks");

// ****************************** NOW DAY ******************************************
function nowDate() {
  const today = new Date()
  const dateDay = (today.getDate() < 10) ? `0${today.getDate()}` : today.getDate();
  const dateMonth = (today.getMonth()+1 < 10) ? `0${today.getMonth()+1}` : today.getMonth()+1;
  return {year: today.getFullYear(), month: dateMonth, day: dateDay};
};

// **************************** NEXT MONTH *****************************************
function nextMonth() {
  const today = new Date()
  const dateMonth = (today.getMonth()+2 < 10) ? `0${today.getMonth()+2}` : today.getMonth()+2;
  return dateMonth;
};
function prevMonth() {
  const today = new Date()
  const dateMonth = (today.getMonth() < 10) ? `0${today.getMonth()}` : today.getMonth();
  return dateMonth;
};

// **************************** NEXT WEEK ******************************************
// Выбираем день и месяц
async function get(month, next) {
  const daysNowMonth = []
  const selectWeeks = await Weeks.find({ year: nowDate().year, month });
  selectWeeks.map(item => {
    daysNowMonth.push(+item.day)
  })
  daysNowMonth.sort((a,b) => a-b)
  if(next) return daysNowMonth[0] // Если неделя переходи на новый месяц, берем первую неделю
  return daysNowMonth.filter(item => item >= nowDate().day) // Откидываем лишние дни, чтобы всегда брать первый
}

async function nextWeek() {
  let daysArr = await get(nowDate().month) // Получаем массив недель
  
  let selectYear = nowDate().year
  let selectMonth = nowDate().month
  let selectDay = daysArr[0]
  // Если у нас 
  if(daysArr.length === 0) {
    selectMonth = nextMonth()
    selectDay = await get(nextMonth(), true)
  }

  if(selectDay < 10) selectDay = `0${selectDay}`

  return `${selectYear}-${selectMonth}-${selectDay}`
}

// *************************** COUNT WEEK ***********************************
async function get1(month, prev) {
  const daysNowMonth = []
  const selectWeeks = await Weeks.find({ year: nowDate().year, month });
  selectWeeks.map(item => {
    daysNowMonth.push(+item.day)
  })
  daysNowMonth.sort((a,b) => a-b)
  if(prev) return daysNowMonth[daysNowMonth.length-1] // Если неделя переходи на новый месяц, берем первую неделю
  return daysNowMonth.filter(item => item <= nowDate().day) // Откидываем лишние дни, чтобы всегда брать первый
}

async function countWeek() {
  let daysArr = await get1(nowDate().month) // Получаем массив недель
  
  let selectYear = nowDate().year
  let selectMonth = nowDate().month
  let selectDay = daysArr[0]
  // Если у нас 
  if(daysArr.length === 0) {
    selectMonth = prevMonth()
    selectDay = await get1(prevMonth(), true)
  }

  if(selectDay < 10) selectDay = `0${selectDay}`
  
  return `${selectYear}-${selectMonth}-${selectDay}`
}

// EXPORTS
module.exports.nowDate = nowDate
module.exports.nextMonth = nextMonth
module.exports.today = new Date().getDay();
module.exports.nextWeek = nextWeek
module.exports.countWeek = countWeek

