const mongoose = require("mongoose");
const Double = require("@mongoosejs/double");

const schema = new mongoose.Schema({
  userId: {
    type: Number,
    unique: true,
  },
  userName: String,
  demoBalance: Double,
  mainBalance: Double,
  isBlocked: Boolean,
  btnStart: Boolean,
  isRef: Number,
  refCash: Number,
  countRef: Number,
  userRights: String,
  pass: Number,
  regDate: String,
  pvp: Object,
  rules: Boolean,
  spins: Number,
});

module.exports = mongoose.model("Users", schema);
