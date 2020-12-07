module.exports = async (bot) => {
  function getRandomId(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; 
  }

  function getRandomSum(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) / 10) * 10; 
  }

  console.log(getRandomId(364984576, 1061660155), getRandomSum(101, 1000))

  // try {
  //   await bot.telegram.sendMessage(
  //     "-1001131292932",
  //     `Пользователь ${getRandomId(364984576, 1061660155)} только что вывел выигрыш на сумму ${getRandomSum(10, 1000)} P.`
  //   );
  // } catch (error) {
  //   console.log("Не прошла отправка сообщения в чат");
  // }
};
