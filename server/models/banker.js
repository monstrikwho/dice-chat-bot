const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  id: Number,
  type: String,
  status: String,
  userId: Number,
  amount: Number,
  code: String,
});

module.exports = mongoose.model("Banker_orders", schema);
