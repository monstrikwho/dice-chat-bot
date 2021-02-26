const mongoose = require("mongoose");
const Double = require("@mongoosejs/double");

const schema = new mongoose.Schema({
  userId: {
    type: Number,
    unique: true,
  },
  demoBalance: Double,
  mainBalance: Double,
  isBlocked: Boolean,
  regDate: String,
  status: String,
  isRef: Number
});

module.exports = mongoose.model("Users", schema);
