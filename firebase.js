// Import the functions you need from the SDKs you need
const { initializeApp } =require("firebase/app");
const { getAuth } = require("firebase/auth");

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAC05kOcCerZ22jCoyHCn4NLzHSg3aZdmM",
  authDomain: "hikotek-35497.firebaseapp.com",
  projectId: "hikotek-35497",
  storageBucket: "hikotek-35497.firebasestorage.app",
  messagingSenderId: "67685505573",
  appId: "1:67685505573:web:9e8e728e04df69183e7dcc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

module.exports = { app, auth };
