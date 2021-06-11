const Extra = require("telegraf/extra");

module.exports = async (state) => {
  const inlineBtnHook = (m, name) => m.callbackButton(name, name);
  const valueRate = (count) => {
    if (count === -1 && state.otherRateActive)
      return `💰 Diğer tutar - ${state.otherRate} TL`;
    if (count === -1) return `✏️ Diğer tutar - ${state.otherRate} TL`;
    if (state.valueRate === count && !state.otherRateActive)
      return `💰 ${count} TL`;
    return `${count} TL`;
  };

  return Extra.markup((m) =>
    m.inlineKeyboard([
      [
        inlineBtnHook(m, valueRate(5)),
        inlineBtnHook(m, valueRate(10)),
        inlineBtnHook(m, valueRate(25)),
        inlineBtnHook(m, valueRate(50)),
        inlineBtnHook(m, valueRate(100)),
      ],
      [
        inlineBtnHook(m, valueRate(-1)),
        inlineBtnHook(m, `🗑 Bahisleri sıfırla`),
      ],
      [inlineBtnHook(m, `Bahis oyna  -  💰 ${state.rate["jek"]} TL`)],
      [inlineBtnHook(m, `Kolu çevir 🎰`)],
    ])
  );
};
