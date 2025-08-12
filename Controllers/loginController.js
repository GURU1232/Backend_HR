
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../modules/user");
const Attendance = require("../modules/attendance");
const moment = require("moment-timezone");

exports.login = async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    const user = await User.findOne({ employeeId });
    if (!user)
      return res.status(401).json({ message: "Invalid employeeId " });

    // console.log("Password from DB:", user.password);
    // console.log("Type of user.password:", typeof user.password);
    // console.log("Password from request:", password);
    // console.log("Type of request password:", typeof password);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { employeeId: user.employeeId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const currentTime = moment().tz("Asia/Kolkata");
    const response = {
      token,
      employeeId: user.employeeId,
      employeeName: user.employeeName,
      role: user.role,
      time: currentTime.format("YYYY-MM-DD HH:mm:ss")
    };

    // Admin-only: Add user punch statuses
    if (user.role === "admin") {
      const allUsers = await User.find({}, { password: 0 });
      const todayStart = currentTime.clone().startOf("day").toDate();
      const todayEnd = currentTime.clone().endOf("day").toDate();

      const attendanceToday = await Attendance.find({
        punchType: "in",
        time: { $gte: todayStart, $lte: todayEnd }
      });

      const userPunchMap = {};
      attendanceToday.forEach(a => {
        userPunchMap[a.employeeId] = {
          status: "present",
          punchInTime: moment(a.time).format("HH:mm:ss")
        };
      });

      const userStatusList = allUsers.map(u => ({
        ...u.toObject(),
        punchStatus: userPunchMap[u.employeeId]?.status || "absent",
        punchInTime: userPunchMap[u.employeeId]?.punchInTime || null
      }));

      response.users = userStatusList;
    }

    res.json(response);

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.getUsers = ('/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});
