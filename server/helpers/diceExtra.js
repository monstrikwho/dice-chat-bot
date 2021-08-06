const MainStats = require("../models/mainstats");

module.exports = async (state) => {
  const { diceCoef } = await MainStats.findOne();

  const valueRate = (count) => {
    if (state.valueRate === count) {
      return `✅ ${count}₽`;
    }
    return `${count}₽`;
  };

  const statusBalance = (type) => {
    if (type === "main" && state.typeBalance === "mainBalance") {
      return `✅ ${state.mainBalance} ₽ [Main]`;
    }
    if (type === "demo" && state.typeBalance === "demoBalance") {
      return `✅ ${state.demoBalance} ₽ [Demo]`;
    }
    if (type === "main") {
      return `${state.mainBalance} ₽ [Main]`;
    }
    if (type === "demo") {
      return `${state.demoBalance} ₽ [Demo]`;
    }
  };

  return {
    inline_keyboard: [
      [
        {
          text: valueRate(10),
          callback_data: valueRate(10),
        },
        {
          text: valueRate(50),
          callback_data: valueRate(50),
        },
        {
          text: valueRate(100),
          callback_data: valueRate(100),
        },
        {
          text: valueRate(500),
          callback_data: valueRate(500),
        },
        {
          text: valueRate(1000),
          callback_data: valueRate(1000),
        },
      ],
      [
        {
          text: `1️⃣  -  💰 ${state.rate[1]}  [x${diceCoef.one}]`,
          callback_data: `1️⃣  -  💰 ${state.rate[1]}  [x${diceCoef.one}]`,
        },
        {
          text: `2️⃣  -  💰 ${state.rate[2]}  [x${diceCoef.one}]`,
          callback_data: `2️⃣  -  💰 ${state.rate[2]}  [x${diceCoef.one}]`,
        },
      ],
      [
        {
          text: `3️⃣ -  💰 ${state.rate[3]}  [x${diceCoef.one}]`,
          callback_data: `3️⃣  -  💰 ${state.rate[4]}  [x${diceCoef.one}]`,
        },
        {
          text: `4️⃣  -  💰 ${state.rate[4]}  [x${diceCoef.one}]`,
          callback_data: `4️⃣  -  💰 ${state.rate[4]}  [x${diceCoef.one}]`,
        },
      ],
      [
        {
          text: `5️⃣  -  💰 ${state.rate[5]}  [x${diceCoef.one}]`,
          callback_data: `5️⃣  -  💰 ${state.rate[5]}  [x${diceCoef.one}]`,
        },
        {
          text: `6️⃣  -  💰 ${state.rate[6]}  [x${diceCoef.one}]`,
          callback_data: `6️⃣  -  💰 ${state.rate[6]}  [x${diceCoef.one}]`,
        },
      ],
      [
        {
          text: `Нечетное  -  💰 ${state.rate["odd"]}  [x${diceCoef.evenodd}]`,
          callback_data: `Нечетное  -  💰 ${state.rate["odd"]}  [x${diceCoef.evenodd}]`,
        },
        {
          text: `Четное  -  💰 ${state.rate["even"]}  [x${diceCoef.evenodd}]`,
          callback_data: `Четное  -  💰 ${state.rate["even"]}  [x${diceCoef.evenodd}]`,
        },
      ],
      [
        {
          text: `1️⃣ - 2️⃣   -   💰 ${state.rate["1-2"]}  [x${diceCoef.two}]`,
          callback_data: `1️⃣ - 2️⃣   -   💰 ${state.rate["1-2"]}  [x${diceCoef.two}]`,
        },
      ],
      [
        {
          text: `3️⃣ - 4️⃣   -   💰 ${state.rate["3-4"]}  [x${diceCoef.two}]`,
          callback_data: `3️⃣ - 4️⃣   -   💰 ${state.rate["3-4"]}  [x${diceCoef.two}]`,
        },
      ],
      [
        {
          text: `5️⃣ - 6️⃣   -   💰 ${state.rate["5-6"]}  [x${diceCoef.two}]`,
          callback_data: `5️⃣ - 6️⃣   -   💰 ${state.rate["5-6"]}  [x${diceCoef.two}]`,
        },
      ],
      [
        {
          text: statusBalance("main"),
          callback_data: statusBalance("main"),
        },
        {
          text: statusBalance("demo"),
          callback_data: statusBalance("demo"),
        },
      ],
      [
        {
          text: `🗑 Очистить ставки`,
          callback_data: `🗑 Очистить ставки`,
        },
        {
          text: `Бросить кости 🎲`,
          callback_data: `Бросить кости 🎲`,
        },
      ],
    ],
  };
};
