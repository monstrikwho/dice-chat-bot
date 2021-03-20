const Extra = require("telegraf/extra");

module.exports = (state) => {
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
        inlineBtnHook(m, `1️⃣  -  💰 ${state.rate[1]}  [x4.5]`),
        inlineBtnHook(m, `2️⃣  -  💰 ${state.rate[2]}  [x4.5]`),
      ],
      [
        inlineBtnHook(m, `3️⃣  -  💰 ${state.rate[3]}  [x4.5]`),
        inlineBtnHook(m, `4️⃣  -  💰 ${state.rate[4]}  [x4.5]`),
      ],
      [
        inlineBtnHook(m, `5️⃣  -  💰 ${state.rate[5]}  [x4.5]`),
        inlineBtnHook(m, `6️⃣  -  💰 ${state.rate[6]}  [x4.5]`),
      ],
      [
        inlineBtnHook(m, `Нечетное  -  💰 ${state.rate["odd"]}  [x1.75]`),
        inlineBtnHook(m, `Четное  -  💰 ${state.rate["even"]}  [x1.75]`),
      ],
      [inlineBtnHook(m, `1️⃣ - 2️⃣   -   💰 ${state.rate["1-2"]}  [x2.5]`)],
      [inlineBtnHook(m, `3️⃣ - 4️⃣   -   💰 ${state.rate["3-4"]}  [x2.5]`)],
      [inlineBtnHook(m, `5️⃣ - 6️⃣   -   💰 ${state.rate["5-6"]}  [x2.5]`)],
      [inlineBtnHook(m, `Бросить кости 🎲`)],
    ])
  );
};
