const { Schema, model } = require("mongoose");

const schema = new Schema({
  lastOrder: {
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
  }
});

module.exports = model("Settings", schema);
