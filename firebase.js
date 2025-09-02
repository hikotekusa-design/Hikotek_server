const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");
const { getDatabase } = require("firebase/database");
// const { getStorage } = require('firebase-admin/storage');


const firebaseConfig = {
  apiKey: "AIzaSyAC05kOcCerZ22jCoyHCn4NLzHSg3aZdmM",
  authDomain: "hikotek-35497.firebaseapp.com",
  databaseURL: "https://hikotek-35497-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "hikotek-35497",
  storageBucket: "hikotek-35497.firebasestorage.app",
  messagingSenderId: "67685505573",
  appId: "1:67685505573:web:9e8e728e04df69183e7dcc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
// const storage = getStorage(app);


module.exports = { app, auth, database };