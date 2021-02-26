const { Schema, model } = require("mongoose");

const schema = new Schema({
  userId: Number,
  typeGame: String,
  typeBalance: String,
  result: String,
  rateAmount: Number,
  rateWinAmount: Number,
  rateValue: Number,
  rate: Object,
  date: String
});

module.exports = model("InfoGames", schema);
