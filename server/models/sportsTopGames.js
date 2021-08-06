const { Schema, model } = require("mongoose");

const schema = new Schema({
  sport: String,
  topGames: Array,
  timeUpd: String,
  timeReq: String,
});

module.exports = model("SportsTopGame", schema);
