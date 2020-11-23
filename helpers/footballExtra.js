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
        inlineBtnHook(m, `Забил  -  💰 ${state.rate["goal"]}  [x2.25]`),
        inlineBtnHook(m, `Промах  -  💰 ${state.rate["out"]}  [x1.5]`),
      ],
      [inlineBtnHook(m, `Очистить ставки`)],
      [inlineBtnHook(m, `Ударить по воротам ⚽️`)],
    ])
  );
};
