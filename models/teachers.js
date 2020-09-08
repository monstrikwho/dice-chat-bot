const { Schema, model } = require("mongoose");

const schema = new Schema({
  lastName: {
    type: String,
  },
  teacher: {
    type: String,
  },
});

module.exports = model("Teachers", schema);
