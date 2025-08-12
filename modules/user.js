const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  employeeId: String,
  employeeName: String,
  email: String,
  password: String,
  role:String,
  createdAt: {
    type: Date,
    default: Date.now
  }
  
});

const User = mongoose.model('User', userSchema);

module.exports = User;