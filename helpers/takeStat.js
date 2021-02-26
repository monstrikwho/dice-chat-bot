const Setting = require("../models/setting");

module.exports.footballStat = (bot) => {
  setInterval(async () => {
    const diceMsg = await bot.telegram.sendDice(364984576, { emoji: "⚽️" });
    const value = diceMsg.dice.value;

    const [setting] = await Setting.find();

    let count = setting.footballGame.count + 1;
    let winRate = setting.footballGame.winRate;

    if (value === 3 || value === 4 || value === 5) {
      winRate++;
    }

    let percent = (winRate / count) * 100;

    setting.footballGame = {
      count,
      winRate,
      percent,
    };

    await setting.save();
  }, 1000);
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
