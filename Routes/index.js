const express = require('express');
const router = express.Router();
const userRoutes = require('./user');
const adminRoutes = require('./admin');

router.use('/user', userRoutes);        // POST /user/login
router.use('/admin', adminRoutes);      // GET /admin/logs

module.exports = router;
