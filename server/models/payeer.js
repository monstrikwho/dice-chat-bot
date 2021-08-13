const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  m_operation_ps: Number,
  m_operation_date: String,
  m_amount: Number,
  m_curr: String,
  m_desc: Number,
  type: String
});

module.exports = mongoose.model("Payeer", schema);
