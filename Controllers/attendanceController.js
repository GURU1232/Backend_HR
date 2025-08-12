const Attendance = require("../modules/attendance");
const User = require("../modules/user");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");

// ✅ Reverse Geocoding: Get place name from latitude & longitude
async function getPlaceName(latitude, longitude) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  // const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
  const res = await axios.get(url);
  return res.data.results[0]?.formatted_address || "Unknown Location";
}

exports.punch = async (req, res) => {
  try {
    const { employeeId, password, punchType, latitude, longitude } = req.body;
    if (!employeeId || !password || !punchType) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const user = await User.findOne({ employeeId });
    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const currentTimeIST = moment().tz("Asia/Kolkata");
    const todayStart = currentTimeIST.clone().startOf("day").toDate();
    const todayEnd = currentTimeIST.clone().endOf("day").toDate();

    // ❌ Prevent multiple same punch type in a day
    const alreadyPunched = await Attendance.findOne({
      employeeId,
      punchType,
      time: { $gte: todayStart, $lte: todayEnd },
    });

    if (alreadyPunched) {
      return res
        .status(400)
        .json({ message: `Already punched ${punchType} today` });
    }

    // ✅ Run once daily to mark others as absent (if first punch-in)
    const isFirstPunchToday = !(await Attendance.exists({
      punchType: "in",
      time: { $gte: todayStart, $lte: todayEnd },
    }));

    if (isFirstPunchToday && punchType === "in") {
      const allUsers = await User.find({ role: "user" });
      const currentUserId = user.employeeId;

      for (const u of allUsers) {
        if (u.employeeId !== currentUserId) {
          await Attendance.create({
            employeeId: u.employeeId,
            employeeName: u.employeeName,
            role: u.role,
            punchType: "none",
            time: todayStart,
            status: "Not Punched in",
          });
        }
      }
    }

    // ✅ Get place name if location is provided
    let location = null;

    if (latitude && longitude) {
      place = await getPlaceName(latitude, longitude);
      location = {
        latitude,
        longitude,
        place,
      };
    }

    // ✅ Prepare punch data
    const punchData = {
      employeeId,
      employeeName: user.employeeName,
      role: user.role,
      punchType,
      location,
      time: currentTimeIST.toDate(),
      status: "present",
    };

    // ✅ If punching out, calculate duration
    if (punchType === "out") {
      const lastPunchIn = await Attendance.findOne({
        employeeId,
        punchType: "in",
        time: { $gte: todayStart, $lte: todayEnd },
      }).sort({ time: -1 });

      if (lastPunchIn) {
        const punchInTime = moment(lastPunchIn.time);
        const durationInMinutes = currentTimeIST.diff(punchInTime, "minutes");
        const hours = Math.floor(durationInMinutes / 60);
        const minutes = durationInMinutes % 60;
        punchData.duration = { hours, minutes };
      } else {
        return res
          .status(400)
          .json({ message: "Cannot punch out without punching in first" });
      }
    }

    // ✅ Save to DB
    await new Attendance(punchData).save();

    // ✅ Send Response
    res.json({
      message: `Punched ${punchType} successfully`,
      employeeId,
      employeeName: user.employeeName,
      role: user.role,
      location: punchData.location,
      time: currentTimeIST.format("YYYY-MM-DD HH:mm:ss"),
      duration: punchData.duration
        ? `${punchData.duration.hours} hours ${punchData.duration.minutes} minutes`
        : null,
    });
  } catch (err) {
    console.error("Punch error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
