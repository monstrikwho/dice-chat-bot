const { Schema, model } = require("mongoose");

const schema = new Schema({
  lastOrder: {
    type: Number,
  },
});

module.exports = model("Settings", schema);
