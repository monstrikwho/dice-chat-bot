const mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 1);

const schema = new mongoose.Schema({
  userId: {
    type: Number, 
    unique: true,
  },
  demoBalance: {
    type: Float
  },
  mainBalance: {
    type: Float
  },
  regDate: String,
  userName: String,
  isBlocked: Boolean,
  isRef: Number
});

module.exports = mongoose.model("Users", schema);
