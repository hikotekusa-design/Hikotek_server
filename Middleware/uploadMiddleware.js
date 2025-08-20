// multerConfig.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'images') {
      cb(null, 'uploads/images/');
    } else if (file.fieldname === 'downloads') {
      cb(null, 'uploads/downloads/');
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.fieldname === 'images' &&
    ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.mimetype)
  ) {
    cb(null, true);
  } else if (file.fieldname === 'downloads' && file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadImages = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'downloads', maxCount: 3 },
]);

module.exports = { upload, uploadImages };