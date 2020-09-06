const { Schema, model } = require("mongoose");

const schema = new Schema({
  year: {
    type: String,
  },
  month: {
    type: String,
  },
  day: {
    type: String,
  },
});

module.exports = model("Weeks", schema);
