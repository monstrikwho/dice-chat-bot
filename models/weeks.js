const { Schema, model } = require("mongoose");

const schema = new Schema({
  weekString: {
    type: String,
  },
});

module.exports = model("Weeks", schema);
