const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: String,
  amount: Number,
  count: Number,
  users: Array,
});

module.exports = mongoose.model("Spins", schema);
