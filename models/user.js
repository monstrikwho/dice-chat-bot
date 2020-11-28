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
  regDate: {
    type: String,
  },
  userName: {
    type: String,
  },
});

module.exports = model("Users", schema);
