const { setAdminRole } = require('../config/firebaseConfig'); // adjust path if needed

// Replace with your admin email
const adminEmail = "hikotekadmin@gmail.com";

setAdminRole(adminEmail)
  .then(() => {
    console.log("🎉 Done! Admin role assigned successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("🔥 Failed to assign admin role:", err.message);
    process.exit(1);
  });
