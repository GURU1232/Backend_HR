const bcrypt = require("bcryptjs");
const User = require("../modules/user");

const createDefaultAdmin = async () => {
  try {
    const existing = await User.findOne({ employeeId: "K001" });
    if (!existing) {
      const hashed = await bcrypt.hash("admin123", 10);
      await new User({
        employeeId: "K001",
        employeeName: "Admin",
        email: "admin@example.com",
        password: hashed,
        role: "admin"
      }).save();
      console.log(" Admin created");
    } else {
      console.log("Admin already exists");
    }
  } catch (err) {
    console.error("Admin creation failed:", err);
  }
};

module.exports = createDefaultAdmin;
