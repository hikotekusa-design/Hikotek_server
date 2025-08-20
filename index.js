require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path')
// server.js (partial)
const fs = require('fs').promises;

const routes = require('./Routes/Route');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', routes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const ensureDirectories = async () => {
  const directories = [
    path.join(__dirname, 'uploads/images'),
    path.join(__dirname, 'uploads/downloads'),
  ];
  for (const dir of directories) {
    try {
      await fs.mkdir(dir, { recursive: true });
      console.log(`Ensured directory exists: ${dir}`);
    } catch (error) {
      console.error(`Failed to create directory ${dir}:`, error.message);
    }
  }
};

ensureDirectories();


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
