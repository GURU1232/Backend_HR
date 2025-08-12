const express = require("express");
const adminRouter = express.Router();
const Attendance = require("../modules/attendance");
const { verifyAdmin } = require("../Middleware/adminAuth");

// Get logs (admin only)
adminRouter.get("/logs", verifyAdmin, async (req, res) => {
  try {
    const logs = await Attendance.find().sort({ time: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch logs" });
  }
});

module.exports = adminRouter;
