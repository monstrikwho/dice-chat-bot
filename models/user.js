const { Schema, model } = require("mongoose");
const SchemaTypes = Schema.Types;

const schema = new Schema({
  userId: {
    type: Number, 
    unique: true,
  },
  demoBalance: Number,
  mainBalance: SchemaTypes.Decimal128,
  regDate: String,
  userName: String,
  isBlocked: Boolean,
  isRef: Number
});

module.exports = model("Users", schema);
