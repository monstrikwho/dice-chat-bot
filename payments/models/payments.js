const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  token: String,
  upd: String,
  hookUrl: String,
  hookId: String,
  wallet: Number,
});

module.exports = mongoose.model("payments", schema);
