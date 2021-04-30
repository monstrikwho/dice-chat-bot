const { Schema, model } = require("mongoose");

const schema = new Schema({
  ads: Object,
  serverUp: Boolean,
  orderStats: Object,
  usersStats: Object,
  gamesStats: Object,
  constRef: Number,
  minGameRate: Number,
  minIn: Number,
  minOut: Object,
  outPercent: Number,
  bonusRefPercent: Number,
  bonusRefDaughter: Number,
  bonusRefFather: Number,
  startDemoBalance: Number,
  slotCoef: Number,
  footballCoef: Object,
  diceCoef: Object,
  webhook: Object
});

module.exports = model("MainStats", schema);
