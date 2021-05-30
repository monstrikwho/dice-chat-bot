const Extra = require("telegraf/extra");
const MainStats = require("../models/mainstats");

module.exports = async (state) => {
  const { footballCoef } = await MainStats.findOne();
  const inlineBtnHook = (m, name) => m.callbackButton(name, name);
  const valueRate = (count) => {
    if (count === -1 && state.otherRateActive)
      return `💰 Diğer tutar - ${state.otherRate} TL`;
    if (count === -1) return `✏️ Diğer tutar - ${state.otherRate} TL`;
    if (state.valueRate === count) return `💰 ${count} TL`;
    return `${count} TL`;
  };

  return Extra.markup((m) =>
    m.inlineKeyboard([
      [
        inlineBtnHook(m, valueRate(5)),
        inlineBtnHook(m, valueRate(10)),
        inlineBtnHook(m, valueRate(50)),
        inlineBtnHook(m, valueRate(100)),
        inlineBtnHook(m, valueRate(500)),
      ],
      [inlineBtnHook(m, valueRate(-1)), inlineBtnHook(m, `🗑 Bahisleri sıfırla`)],
      [
        inlineBtnHook(m, `Gol  -  💰 ${state.rate["goal"]}  [x${footballCoef.goal}]`),
        inlineBtnHook(m, `Kaçırdın  -  💰 ${state.rate["out"]}  [x${footballCoef.out}]`),
      ],
      [inlineBtnHook(m, `Topa vur ⚽️`)],
    ])
  );
};
