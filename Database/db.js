const mongoose = require('mongoose');

const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.Mongo_URI);
        console.log('mongoDB Connected to server');
    } catch (err) {
    console.error('MongoDB connection error :', err.message);
  }
};

module.exports = connectDB;
