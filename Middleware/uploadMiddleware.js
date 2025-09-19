const multer = require('multer');
const path = require('path');
const { storage } = require('../firebase-admin');

// Get the bucket instance
const bucket = storage.bucket();

// Firebase Storage Utility Functions
const firebaseStorage = {
  /**
   * Upload file to Firebase Storage
   * @param {Object} file - Multer file object
   * @param {String} folder - Storage folder path
   * @returns {Promise<Object>} File metadata with URL
   */
  uploadToFirebase: async (file, folder = 'uploads') => {
    try {
      console.log('Starting upload to Firebase Storage:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.buffer ? file.buffer.length : 0
      });

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = `${folder}/${uniqueSuffix}${path.extname(file.originalname)}`;
      const fileRef = bucket.file(filename);

      // Upload the file
      await fileRef.save(file.buffer, {
        metadata: { contentType: file.mimetype },
        public: true
      });

      // Generate signed URL (valid for 10 years)
      const [url] = await fileRef.getSignedUrl({
        action: 'read',
        expires: '01-01-2035'
      });

      const fileData = {
        filename,
        originalName: file.originalname,
        path: filename,
        url
      };

      console.log('File uploaded successfully:', fileData);
      return fileData;
    } catch (error) {
      console.error('Error uploading to Firebase Storage:', {
        message: error.message,
        stack: error.stack,
        file: file.originalname
      });
      throw error;
    }
  },

  /**
   * Delete file from Firebase Storage
   * @param {Object} fileData - File metadata object with path
   * @returns {Promise<Boolean>} Success status
   */
  deleteFromFirebase: async (fileData) => {
    try {
      if (!fileData || !fileData.path) {
        console.warn('No file path provided for deletion');
        return false;
      }

      const file = bucket.file(fileData.path);
      const [exists] = await file.exists();
      
      if (!exists) {
        console.warn('File does not exist in Firebase Storage:', fileData.path);
        return false;
      }

      await file.delete();
      console.log('File deleted from Firebase Storage:', fileData.path);
      return true;
    } catch (error) {
      console.error('Error deleting from Firebase Storage:', {
        message: error.message,
        stack: error.stack,
        path: fileData?.path
      });
      throw error;
    }
  },

  /**
   * Process uploaded files and upload to Firebase Storage
   */
  processUploads: async (req, res, next) => {
    try {
      console.log('Processing files:', req.files);
      
      if (!req.files || Object.keys(req.files).length === 0) {
        console.log('No files received for upload');
        return next();
      }

      // Process images
      if (req.files['images'] && Array.isArray(req.files['images'])) {
        console.log('Processing images:', req.files['images'].map(f => f.originalname));
        const imageUploadPromises = req.files['images'].map(file =>
          firebaseStorage.uploadToFirebase(file, 'images')
        );
        req.uploadedImages = await Promise.all(imageUploadPromises);
        console.log('Uploaded images:', req.uploadedImages);
      } else {
        req.uploadedImages = [];
      }

      // Process downloads
      if (req.files['downloads'] && Array.isArray(req.files['downloads'])) {
        console.log('Processing downloads:', req.files['downloads'].map(f => f.originalname));
        const downloadUploadPromises = req.files['downloads'].map(file =>
          firebaseStorage.uploadToFirebase(file, 'downloads')
        );
        req.uploadedDownloads = await Promise.all(downloadUploadPromises);
        console.log('Uploaded downloads:', req.uploadedDownloads);
      } else {
        req.uploadedDownloads = [];
      }

      next();
    } catch (error) {
      console.error('Error processing uploads:', {
        message: error.message,
        stack: error.stack
      });
      res.status(500).json({
        success: false,
        error: 'Failed to process file uploads',
        details: error.message,
      });
    }
  },

  /**
   * Clean up uploaded files on error
   * @param {Array} files - Array of file metadata objects to delete
   */
  // cleanupUploads: async (files) => {
  //   if (!files || !Array.isArray(files) || files.length === 0) {
  //     console.log('No files provided for cleanup');
  //     return;
  //   }

  //   console.log('Cleaning up files:', files.map(f => f.path));
  //   try {
  //     await Promise.allSettled(
  //       files.map(file => firebaseStorage.deleteFromFirebase(file))
  //     );
  //     console.log('Cleanup completed');
  //   } catch (error) {
  //     console.error('Error during cleanup:', {
  //       message: error.message,
  //       stack: error.stack
  //     });
  //   }
  // }
};

// Multer configuration (memory storage)
const multerStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  console.log('File filter:', {
    fieldname: file.fieldname,
    mimetype: file.mimetype,
    originalname: file.originalname
  });

  if (file.fieldname === 'images') {
    if (['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type for images. Must be JPEG, PNG, JPG, WEBP, or GIF.'), false);
    }
  } else if (file.fieldname === 'downloads') {
    const ext = file.originalname.toLowerCase().split('.').pop();
    if (['pdf', 'zip'].includes(ext) || file.mimetype.includes('pdf') || file.mimetype.includes('zip')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type for downloads. Must be PDF or ZIP.'), false);
    }
  } else {
    cb(new Error('Invalid field name. Must be "images" or "downloads".'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter,
  limits: { 
    fileSize: 15000 * 1024 * 1024, 
    files: 8 
  },
});

const uploadImages = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'downloads', maxCount: 3 },
]);

// Middleware to handle upload errors
const handleUploadErrors = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 15MB per file.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files. Maximum is 5 images and 3 downloads.'
      });
    }
  } else if (error.message) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  console.error('Upload error:', {
    message: error.message,
    stack: error.stack
  });
  res.status(500).json({
    success: false,
    error: 'File upload failed',
    details: error.message
  });
};

module.exports = { 
  upload, 
  uploadImages, 
  firebaseStorage, 
  handleUploadErrors 
};