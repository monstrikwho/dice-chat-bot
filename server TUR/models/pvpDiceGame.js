const { Schema, model } = require("mongoose");

const schema = new Schema({
  lobbyId: Number,
  typeGame: String,
  typeBalance: String,
  statusGame: String,
  prize: Number,
  size: Number,
  rivals: Array,
  creator: Number,
  results: Array,
  resultsSum: Array,
  winner: Number,
  reversedResults: Object,
});

module.exports = model("pvpGame", schema);
