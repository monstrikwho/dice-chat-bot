const { Schema, model } = require("mongoose");

const schema = new Schema({
  orderId: {
    type: Number,
  },
  data: {
    type: Object,
  },
});

module.exports = model("Orders", schema);
