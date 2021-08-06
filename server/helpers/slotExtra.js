const MainStats = require("../models/mainstats");

module.exports = async (state) => {
  const { slotCoef } = await MainStats.findOne();

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
          text: `Поставить  -  💰 ${state.rate["jek"]}  [x${slotCoef}]`,
          callback_data: `Поставить  -  💰 ${state.rate["jek"]}  [x${slotCoef}]`,
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
          text: `Крутить барабан 🎰`,
          callback_data: `Крутить барабан 🎰`,
        },
      ],
    ],
  };
};
