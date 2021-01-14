const { Schema, model } = require("mongoose");

const schema = new Schema({
  lastNumberOrder: Number,
  countBlocked: Number,
  payload: Object,
});

module.exports = model("Settings", schema);
