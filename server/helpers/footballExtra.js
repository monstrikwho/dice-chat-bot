const Extra = require("telegraf/extra");
const MainStats = require("../models/mainstats");

module.exports = async (state) => {
  const { footballCoef } = await MainStats.findOne();
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
        inlineBtnHook(m, `Забил  -  💰 ${state.rate["goal"]}  [x${footballCoef.goal}]`),
        inlineBtnHook(m, `Промах  -  💰 ${state.rate["out"]}  [x${footballCoef.out}]`),
      ],
      [inlineBtnHook(m, `Ударить по воротам ⚽️`)],
    ])
  );
};
