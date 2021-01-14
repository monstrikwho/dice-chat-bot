const { Schema, model } = require("mongoose");

const schema = new Schema({
  lastNumberOrder: {
    type: Number,
  },
  footballGame: {
    type: Object
  },
  slotGame: {
    type: Object
  },
  countBlocked: {
    type: Number
  },
  payload: {
    type: Object
  }
});

module.exports = model("Settings", schema);
