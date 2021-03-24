const Extra = require("telegraf/extra");
const MainStats = require("../models/mainstats");

module.exports = async (state) => {
  const { diceCoef } = await MainStats.findOne();
  const inlineBtnHook = (m, name) => m.callbackButton(name, name);
  const valueRate = (count) => {
    if (count === -1 && state.otherRateActive)
      return `💰 Другая сумма - ${state.otherRate}₽`;
    if (count === -1) return `✏️ Другая сумма - ${state.otherRate}₽`;
    if (state.valueRate === count) return `💰 ${count}₽`;
    return `${count}₽`;
  };

  return Extra.markup((m) =>
    m.inlineKeyboard([
      [
        inlineBtnHook(m, valueRate(10)),
        inlineBtnHook(m, valueRate(50)),
        inlineBtnHook(m, valueRate(100)),
        inlineBtnHook(m, valueRate(500)),
        inlineBtnHook(m, valueRate(1000)),
      ],
      [inlineBtnHook(m, valueRate(-1)), inlineBtnHook(m, `🗑 Очистить ставки`)],
      [
        inlineBtnHook(m, `1️⃣  -  💰 ${state.rate[1]}  [x${diceCoef.one}]`),
        inlineBtnHook(m, `2️⃣  -  💰 ${state.rate[2]}  [x${diceCoef.one}]`),
      ],
      [
        inlineBtnHook(m, `3️⃣  -  💰 ${state.rate[3]}  [x${diceCoef.one}]`),
        inlineBtnHook(m, `4️⃣  -  💰 ${state.rate[4]}  [x${diceCoef.one}]`),
      ],
      [
        inlineBtnHook(m, `5️⃣  -  💰 ${state.rate[5]}  [x${diceCoef.one}]`),
        inlineBtnHook(m, `6️⃣  -  💰 ${state.rate[6]}  [x${diceCoef.one}]`),
      ],
      [
        inlineBtnHook(m, `Нечетное  -  💰 ${state.rate["odd"]}  [x${diceCoef.evenodd}]`),
        inlineBtnHook(m, `Четное  -  💰 ${state.rate["even"]}  [x${diceCoef.evenodd}]`),
      ],
      [inlineBtnHook(m, `1️⃣ - 2️⃣   -   💰 ${state.rate["1-2"]}  [x${diceCoef.two}]`)],
      [inlineBtnHook(m, `3️⃣ - 4️⃣   -   💰 ${state.rate["3-4"]}  [x${diceCoef.two}]`)],
      [inlineBtnHook(m, `5️⃣ - 6️⃣   -   💰 ${state.rate["5-6"]}  [x${diceCoef.two}]`)],
      [inlineBtnHook(m, `Бросить кости 🎲`)],
    ])
  );
};
