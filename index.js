const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const routes = require('./Routes/Route');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Add this line
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));
app.use('/', routes);

const ensureDirectories = async () => {
  const directories = [
    path.join(__dirname, 'Uploads/images'),
    path.join(__dirname, 'Uploads/downloads'),
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});