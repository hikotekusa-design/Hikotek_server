const admin = require("firebase-admin");

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    // Replace escaped newlines with actual newlines
    const fixedJson = process.env.FIREBASE_SERVICE_ACCOUNT.replace(/\\n/g, '\n');
    serviceAccount = JSON.parse(fixedJson);
  } catch (error) {
    console.error("Error parsing FIREBASE_SERVICE_ACCOUNT:", error);
    console.log("Value received:", process.env.FIREBASE_SERVICE_ACCOUNT);
    serviceAccount = require("./config/serviceAccountKey.json");
  }
} else {
  serviceAccount = require("./config/serviceAccountKey.json");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };