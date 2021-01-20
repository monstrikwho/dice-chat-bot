const mongoose = require('mongoose');
const Double = require('@mongoosejs/double');

const schema = new mongoose.Schema({
  userId: {
    type: Number, 
    unique: true,
  },
  demoBalance: Double,
  mainBalance: Double,
  amountRefCash: Double,
  isBlocked: Boolean,
  isRef: Number,
  regDate: String,
});

module.exports = mongoose.model("Users", schema);
