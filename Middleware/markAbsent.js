const cron = require("node-cron");
const moment = require("moment-timezone");
const Attendance = require("../modules/attendance");

cron.schedule("59 23 * * *", async () => {
  const startOfDay = moment().tz("Asia/Kolkata").startOf("day").toDate();
  const endOfDay = moment().tz("Asia/Kolkata").endOf("day").toDate();

  const result = await Attendance.updateMany(
    {
      status: "Not punched in",
      time: { $gte: startOfDay, $lte: endOfDay },
    },
    { $set: { status: "absent" } }
  );

  console.log(`[Cron] Updated ${result.modifiedCount} records to 'absent'`);
});
