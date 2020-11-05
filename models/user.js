const { Schema, model } = require("mongoose");

const schema = new Schema({
  userId: {
    type: Number,
    unique: true,
  },
  demoMoney: {
    type: Number
  }
});

module.exports = model("Users", schema);
