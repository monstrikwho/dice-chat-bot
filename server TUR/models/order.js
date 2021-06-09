const { Schema, model } = require("mongoose");

const schema = new Schema({
  id: Number,
  type: String,
  status: String,
  userId: Number,
  amount: Object,
  card: Number,
  name: String,
  userMsgId: Array,
  date: String,
});

module.exports = model("Orders", schema);
