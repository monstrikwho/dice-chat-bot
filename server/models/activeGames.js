const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  game_id: Number,
  typeSport: String,
  typeMatch: String,
});

module.exports = mongoose.model("ActiveGames", schema);
