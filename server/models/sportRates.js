const { Schema, model } = require("mongoose");

const schema = new Schema({
  rate_id: Number,
  game_id: Number,
  userId: Number,
  status: String,
  typeSport: String,
  home: String,
  away: String,
  rates: Object,
  odds: Object,
  sumAmount: Number,
  result: Object,
  game_res: Object,
  date: String,
});

module.exports = model("SportRates", schema);
