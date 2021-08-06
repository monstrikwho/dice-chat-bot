const { Schema, model } = require("mongoose");

const schema = new Schema({
  game_id: Number,
  time_status: Number,
  league: String,
  home: String,
  away: String,
  scores: String,
  time: Number,
  update_at: String,
  parse_time: String,
  odds: Object,
});

module.exports = model("SportFootballGames", schema);
