const { Schema, model } = require("mongoose");

const schema = new Schema({
  userId: {
    type: Number,
    unique: true,
  },
  demoBalance: {
    type: Number,
  },
  mainBalance: {
    type: Number,
  },
});

module.exports = model("Users", schema);
