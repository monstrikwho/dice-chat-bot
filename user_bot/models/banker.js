const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userId: Number,
  code: String,
  amount: Number,
  status: String,
});

module.exports = mongoose.model("Banker_orders", schema);
