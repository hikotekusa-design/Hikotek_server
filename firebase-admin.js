const admin = require("firebase-admin");

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Running on Render/production
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Running locally
  serviceAccount = require("./config/serviceAccountKey.json");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
  // storageBucket: `${serviceAccount.project_id}.appspot.com`,
});

const db = admin.firestore();
const auth = admin.auth();
// const storage = admin.storage();

module.exports = { admin, db, auth };
