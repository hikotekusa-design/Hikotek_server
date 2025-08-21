const admin = require('firebase-admin');

// Only initialize if it hasn't been done already
if (!admin.apps.length) {
  const serviceAccount = require('../config/serviceAccountKey.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // storageBucket: ''
  });
}

// These can be used anywhere in your app
const db = admin.firestore();
// const bucket = admin.storage().bucket();

module.exports = { admin, db };

// config/firebaseConfig.js
// const admin = require('firebase-admin');
// const { initializeApp } = require('firebase/app');
// const { getAuth } = require('firebase/auth');

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: process.env.FIREBASE_API_KEY,
//   authDomain: process.env.FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.FIREBASE_PROJECT_ID,
//   storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.FIREBASE_APP_ID
// };

// // Initialize Firebase Admin SDK
// const serviceAccount = require('./serviceAccountKey.json'); // or use environment variables

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
// });

// // Initialize Firebase Client SDK
// const firebaseApp = initializeApp(firebaseConfig);
// const auth = getAuth(firebaseApp);

// // Function to set admin role
// const setAdminRole = async (email) => {
//   try {
//     const user = await admin.auth().getUserByEmail(email);
//     await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    
//     console.log(` Successfully set admin role for: ${email}`);
//     console.log( User UID: ${user.uid}`);
    
//     return { success: true, uid: user.uid };
//   } catch (error) {
//     console.error(' Error setting admin role:', error.message);
//     throw error;
//   }
// };

// // Function to verify admin status
// const verifyAdminStatus = async (email) => {
//   try {
//     const user = await admin.auth().getUserByEmail(email);
//     console.log(' User Details:');
//     console.log('UID:', user.uid);
//     console.log('Email:', user.email);
//     console.log('Custom Claims:', user.customClaims || 'No custom claims');
//     console.log('Is Admin:', !!(user.customClaims && user.customClaims.admin));
    
//     return user.customClaims && user.customClaims.admin;
//   } catch (error) {
//     console.error(' Error checking admin status:', error.message);
//     return false;
//   }
// };

// module.exports = {
//   admin,
//   auth,
//   setAdminRole,
//   verifyAdminStatus,
//   firebaseApp
// };