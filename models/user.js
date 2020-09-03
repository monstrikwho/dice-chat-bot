const { Schema, model } = require("mongoose");

const schema = new Schema({
  userId: {
    type: Number,
    unique: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  userName: {
    type: String,
  },
  person: {
    type: String,
  },
  faculty: {
    type: String,
  },
  group: {
    type: String,
  },
});

module.exports = model("Users", schema);
