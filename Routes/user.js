const express = require('express');
const router = express.Router();
const userController = require('../Controllers/loginController');
const attendanceController = require('../Controllers/attendanceController');
const User = require('../modules/user');

// Login route
router.post('/login', userController.login);
router.post('/punch', attendanceController.punch);
router.get("/users",userController.getUsers);


// Fetch all users (excluding password)


module.exports = router;

