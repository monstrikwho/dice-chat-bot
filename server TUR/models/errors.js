const { Schema, model } = require("mongoose");

const schema = new Schema({
  message: String,
  err: Object,
});

module.exports = model("Error", schema);
