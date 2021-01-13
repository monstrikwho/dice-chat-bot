const { Schema, model } = require("mongoose");

const schema = new Schema({
  userId: {
    type: Number, 
    unique: true,
  },
  demoBalance: Number,
  mainBalance: Number,
  regDate: String,
  userName: String,
  isBlocked: Boolean,
  isRef: Number
});

module.exports = model("Users", schema);
