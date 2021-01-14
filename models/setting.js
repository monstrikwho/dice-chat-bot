const { Schema, model } = require("mongoose");

const schema = new Schema({
  lastNumberOrder: String,
  countBlocked: Number,
  payload: Object,
});

module.exports = model("Settings", schema);
