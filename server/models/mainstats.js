const { Schema, model } = require("mongoose");

const schema = new Schema({
  ads: Object,
  orderStats: Object,
  usersStats: Object,
  gamesStats: Object,
  constRef: Number,
  minIn: Number,
  minOut: Object,
  outPercent: Number,
  toRefPercent: Number,
});

module.exports = model("MainStats", schema);
