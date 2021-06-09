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
  pvpDice: Object,
  pvpBouling: Object,
  pvpFootball: Object,
  getBonus: Boolean,
});

module.exports = mongoose.model("Users", schema);
