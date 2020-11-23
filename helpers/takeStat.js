const Setting = require("../models/setting");

module.exports.footballStat = (bot) => {
  setInterval(async () => {
    const diceMsg = await bot.telegram.sendDice(364984576, { emoji: "⚽️" });
    const value = diceMsg.dice.value;

    const [setting] = await Setting.find();

    let count = 0;
    let winRate = 0;
    let percent = 0;

    if (setting.footballGame) {
      count = setting.footballGame.count + 1;
      if (value === 3 || value === 5) {
        winRate = setting.footballGame.winRate + 1;
      } else {
        winRate = setting.footballGame.winRate;
      }
      percent = (winRate / count) * 100;
    }

    setting.footballGame = {
      count,
      winRate,
      percent,
    };

    await setting.save();
  }, 2000);
};

module.exports.slotStat = (bot) => {
  setInterval(async () => {
    const diceMsg = await bot.telegram.sendDice(364984576, { emoji: "🎰" });
    const value = diceMsg.dice.value;

    const [setting] = await Setting.find();

    const c = setting.slotGame.count;
    const r = setting.slotGame.rate;
    let v = setting.slotGame.rate[value];

    if (!v) {
      v = 1;
    } else {
      v++;
    }

    setting.slotGame = {
      count: c + 1,
      rate: {
        ...r,
        [value]: v,
      },
    };

    await setting.save();
  }, 2000);
};
