// const admin = require("firebase-admin");

// if (!admin.apps.length) {
//   const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
//   serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: process.env.FIREBASE_DATABASE_URL
//   });
// }

// module.exports = admin;

// const admin = require("firebase-admin");

// if (!admin.apps.length) {
//   try {
//     const serviceAccount = require('./config/serviceAccountKey.json');
//     admin.initializeApp({
//       credential: admin.credential.cert(serviceAccount),
//       databaseURL: 'https://hikotek-35497-default-rtdb.asia-southeast1.firebasedatabase.app',
//       storageBucket: 'hikotek-35497.firebasestorage.app'
//     });
    
//     console.log("Firebase Admin initialized successfully");
//   } catch (error) {
//     console.error("Error initializing Firebase Admin:", error.message);
//     throw error;
//   }
// }

// // Export the initialized instances
// const db = admin.database();
// const storage = admin.storage();

// module.exports = { admin, db, storage };

require('dotenv').config();
const admin = require('firebase-admin');

if (!admin.apps.length) {
  try {
    // const serviceAccount = require('./config/serviceAccountKey.json');
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      //  databaseURL: 'https://hikotek-35497-default-rtdb.asia-southeast1.firebasedatabase.app',
      // storageBucket: 'hikotek-35497.firebasestorage.app'
     
    });
    
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error.message);
    throw error;
  }
}

// Export the initialized instances
const db = admin.database();
const storage = admin.storage();

module.exports = { admin, db, storage };