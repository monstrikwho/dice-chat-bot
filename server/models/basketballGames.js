const { Schema, model } = require("mongoose");

const schema = new Schema({
  game_id: Number,
  time_status: Number,
  league: String,
  home: String,
  away: String,
  update_at: String,
  parse_time: String,
  odds: Object,
  results: Object,
  scores: String,
  time: String,
});

module.exports = model("BasketballGames", schema);