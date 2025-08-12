// server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require("bcryptjs");
const allRoutes = require('./Routes/index');
const connectDB = require('./Database/db');
const createDefaultAdmin = require('./utlis/defaultAdmin');

require('dotenv').config();
require("./Middleware/markAbsent");

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/v2', allRoutes);

connectDB().then(() => {
  createDefaultAdmin(); 
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
