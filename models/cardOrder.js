const { Schema, model } = require("mongoose");

const schema = new Schema({
  userId: {
    type: Number,
  },
  card: {
    type: Number,
  },
  amount: {
    type: Number,
  },
  idProvider: {
    type: Number,
  },
});

module.exports = model("Cardorders", schema);
