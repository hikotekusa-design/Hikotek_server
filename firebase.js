const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");
const { getDatabase } = require("firebase/database");
// const { getStorage } = require('firebase-admin/storage');


const firebaseConfig = {
  apiKey: "AIzaSyD6SJqncZOiIVM7dLEqT0OQAH7iYM0eDhg",
  authDomain: "hikotek.firebaseapp.com",
  projectId: "hikotek",
  storageBucket: "hikotek.firebasestorage.app",
  messagingSenderId: "871573444811",
  appId: "1:871573444811:web:6809d4df444e75584e234e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
// const storage = getStorage(app);


module.exports = { app, auth, database };