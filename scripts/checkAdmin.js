const { admin } = require("../config/firebaseConfig");

const checkAdmin = async (email) => {
  try {
    const user = await admin.auth().getUserByEmail(email);
    console.log("User UID:", user.uid);
    console.log("Custom Claims:", user.customClaims);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

checkAdmin("hikotekadmin@gmail.com");
