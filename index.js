const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises;
const routes = require('./Routes/Route');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use('/', routes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// functions/index.js
// const functions = require('firebase-functions');
// const express = require('express');
// const app = express();

// // ✅ SAME MIDDLEWARE AND ROUTES AS BEFORE
// app.use(bodyParser.json());
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true })); 
// app.use('/', require('./Routes/Route'));

// // // ❌ NO app.listen()! Instead:
// exports.api = functions.https.onRequest(app);