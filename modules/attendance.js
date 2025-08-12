const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: String,
  employeeName: String,
  role: String,
  punchType: String, // in/out/none
  location: {
    latitude: Number,
    longitude: Number,
    place: String
  },
  time: Date,
  status: String, // present/absent
  duration: {
    hours: Number,
    minutes: Number
  }
});

module.exports = mongoose.model('Attendance', attendanceSchema);