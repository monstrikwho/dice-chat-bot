const { Schema, model } = require("mongoose");

const schema = new Schema({
  orderId: {
    type: Number,
    unique: true,
  },
});

module.exports = model("Orders", schema);
