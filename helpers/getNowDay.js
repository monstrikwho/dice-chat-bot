module.exports = () => {
  const dateDay =
    new Date().getDay() < 10 ? `0${new Date().getDay()}` : new Date().getDay();
  const dateMonth =
    new Date().getMonth() < 10
      ? `0${new Date().getMonth()}`
      : new Date().getMonth();
  const date = new Date().getFullYear() + "-" + dateMonth + "-" + dateDay;
  return date;
};
