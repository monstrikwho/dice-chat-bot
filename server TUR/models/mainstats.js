const { Schema, model } = require("mongoose");

const schema = new Schema({
  ads: Object,
  orderStats: Object,
  usersStats: Object,
  gamesStats: Object,
  pvpGames: Object,
  constRef: Number,
  minGameRate: Number,
  minIn: Number,
  minOut: Number,
  pvpPercent: Number,
  bonusRefPercent: Number,
  bonusRefDaughter: Number,
  bonusRefFather: Number,
  startDemoBalance: Number,
  kanalBonus: Number,
  TRYRUB: Number,
  exchangeCoef: Number,
  moderId: Number,
  slotCoef: Object,
  footballCoef: Object,
  diceCoef: Object,
  webhook: Object,
});

module.exports = model("MainStats", schema);
