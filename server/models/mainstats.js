const { Schema, model } = require("mongoose");

const schema = new Schema({
  ads: Object,
  serverUp: Boolean,
  orderStats: Object,
  usersStats: Object,
  gamesStats: Object,
  pvpGames: Object,
  constRef: Number,
  minGameRate: Number,
  minIn: Number,
  minOut: Object,
  outPercent: Number,
  pvpPercent: Number,
  sportPercent: Number,
  bonusRefPercent: Number,
  bonusRefDaughter: Number,
  bonusRefFather: Number,
  startDemoBalance: Number,
  slotCoef: Object,
  footballCoef: Object,
  diceCoef: Object,
  webhook: Object,
});

module.exports = model("MainStats", schema);
