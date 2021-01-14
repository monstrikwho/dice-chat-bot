const Extra = require("telegraf/extra");

module.exports = (state) => {
  const inlineBtnHook = (m, name) => m.callbackButton(name, name);
  const valueRate = (count) => {
    if (count === -1 && state.otherRateActive)
      return `💰 Другая сумма - ${state.otherRate}₽`;
    if (count === -1) return `✏️ Другая сумма - ${state.otherRate}₽`;
    if (state.valueRate === count && !state.otherRateActive) return `💰 ${count}₽`;
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
      [inlineBtnHook(m, `Поставить  -  💰 ${state.rate["jek"]}  [x12]`)],
      [inlineBtnHook(m, `Крутить барабан 🎰`)],
    ])
  );
};
