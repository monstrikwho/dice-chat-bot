const { Schema, model } = require("mongoose");

const schema = new Schema({
  ads: Object,
  orderStats: Object,
  usersStats: Object,
  games: Object,
});

module.exports = model("MainStats", schema);
