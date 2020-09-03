const { Schema, model } = require("mongoose");

const schema = new Schema({
  weekString: {
    type: String,
  },
  weekItems: {
    type: Array,
  },
});

module.exports = model("Weeks", schema);
