const { Schema, model } = require("mongoose");
const SchemaTypes = mongoose.Schema.Types;

const schema = new Schema({
  userId: {
    type: Number, 
    unique: true,
  },
  demoBalance: Number,
  mainBalance: SchemaTypes.Double,
  regDate: String,
  userName: String,
  isBlocked: Boolean,
  isRef: Number
});

module.exports = model("Users", schema);
