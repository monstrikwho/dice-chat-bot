const Extra = require("telegraf/extra");

module.exports = (state) => {
  const inlineBtnHook = (m, name) => m.callbackButton(name, name);
  const valueRate = (count) => {
    if (state.valueRate === count) return `💰 ${count}₽`;
    return `${count}₽`;
  };

  return Extra.markup((m) =>
    m.inlineKeyboard([
      [
        inlineBtnHook(m, valueRate(1)),
        inlineBtnHook(m, valueRate(5)),
        inlineBtnHook(m, valueRate(10)),
        inlineBtnHook(m, valueRate(50)),
        inlineBtnHook(m, valueRate(100)),
        inlineBtnHook(m, valueRate(500)),
      ],
      [
        inlineBtnHook(m, `1️⃣  -  💰 ${state.rate[1]}  [x5]`),
        inlineBtnHook(m, `2️⃣  -  💰 ${state.rate[2]}  [x5]`),
      ],
      [
        inlineBtnHook(m, `3️⃣  -  💰 ${state.rate[3]}  [x5]`),
        inlineBtnHook(m, `4️⃣  -  💰 ${state.rate[4]}  [x5]`),
      ],
      [
        inlineBtnHook(m, `5️⃣  -  💰 ${state.rate[5]}  [x5]`),
        inlineBtnHook(m, `6️⃣  -  💰 ${state.rate[6]}  [x5]`),
      ],
      [
        inlineBtnHook(m, `Нечетное  -  💰 ${state.rate["odd"]}  [x1.85]`),
        inlineBtnHook(m, `Четное  -  💰 ${state.rate["even"]}  [x1.85]`),
      ],
      [inlineBtnHook(m, `1️⃣ - 2️⃣   -   💰 ${state.rate["1-2"]}  [x2.75]`)],
      [inlineBtnHook(m, `3️⃣ - 4️⃣   -   💰 ${state.rate["3-4"]}  [x2.75]`)],
      [inlineBtnHook(m, `5️⃣ - 6️⃣   -   💰 ${state.rate["5-6"]}  [x2.75]`)],
      [inlineBtnHook(m, `Очистить ставки`)],
      [inlineBtnHook(m, `Бросить кости 🎲`)],
    ])
  );
};
