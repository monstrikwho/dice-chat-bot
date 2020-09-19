const { Schema, model } = require("mongoose");

const schema = new Schema({
  userId: {
    type: String,
  },
  userName: {
    type: String,
  },
  date: {
    type: String
  }
});

module.exports = model("User-singup", schema);
