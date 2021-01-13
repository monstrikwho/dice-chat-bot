const { Schema, model } = require("mongoose");

const schema = new Schema({
  txnId: Number,
  type: String,
  status: String,
  amount: Number,
  comment: String,
  account: String,
  date: String
});

module.exports = model("Orders", schema);
