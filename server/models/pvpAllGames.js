const { Schema, model } = require("mongoose");

const schema = new Schema({
  lobbyId: Number,
  typeGame: String,
  statusGame: String,
  prize: Number,
  size: Number,
  rivals: Array,
  rivalsLinks: Object,
  winner: Number,
  creator: Number,
  results: Array,
  resultsSum: Array,
  reversedResults: Object,
});

module.exports = model("PvpGames", schema);
