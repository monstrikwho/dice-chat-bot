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
  teacherName: {
    type: String,
  },
  autobus: {
    type: Object,
  },
  otherTeacher: {
    type: String,
  },
  otherStudents: {
    type: String,
  },
  favStudents: {
    type: Array,
  },
  favTeachers: {
    type: Array,
  },
  favAutobuses: {
    type: Array,
  },
});

module.exports = model("Users", schema);
