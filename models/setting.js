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
  }
});

module.exports = model("Settings", schema);
