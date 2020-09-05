module.exports = () => {
  const today = new Date()
  const dateDay = (today.getDate() < 10) ? `0${today.getDate()}` : today.getDate();
  const dateMonth = (today.getMonth()+1 < 10) ? `0${today.getMonth()+1}` : today.getMonth()+1;
  const date = today.getFullYear() + "-" + dateMonth + "-" + dateDay;
  return date;
};
