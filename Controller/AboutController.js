const AboutContent = require('../Model/AboutModel');
const { firebaseStorage } = require('../Middleware/uploadMiddleware');
const multer = require('multer');

// Configure multer for memory storage
const multerStorage = multer.memoryStorage();

const getAboutData = async (req, res) => {
    try {
        const aboutData = await AboutContent.getAboutData();

        res.status(200).json({
            success: true,
            data: aboutData,
        });
    } catch (error) {
        console.error('Error in getAboutData:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch about data',
            details: error.message,
        });
    }
};

const updateAboutData = async (req, res) => {
    let uploadedFiles = [];

    try {
        // Use multer to parse form data with both files and text fields
        const multerUpload = multer({
            storage: multerStorage,
            fileFilter: (req, file, cb) => {
                if (['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'].includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(new Error('Invalid file type. Must be JPEG, PNG, JPG, WEBP, or GIF.'), false);
                }
            },
            limits: {
                fileSize: 15 * 1024 * 1024, // 15MB limit
            },
        }).fields([
            { name: 'bannerImage', maxCount: 1 },
            { name: 'companyImage', maxCount: 1 },
            { name: 'profileImage', maxCount: 1 },
            { name: 'logo', maxCount: 1 }
        ]);

        // Parse the form data
        multerUpload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    error: err.message
                });
            }

            try {
                // Debug: log the request body to see what's coming in
                console.log('Request body:', req.body);
                console.log('Request files:', req.files);

                // Parse the about data from request body with proper error handling
                const aboutData = {
                    tagline: req.body?.tagline || '',
                    companyProfile: req.body?.companyProfile || '',
                    profileTitle: req.body?.profileTitle || '',
                    profileDescription: req.body?.profileDescription || '',
                    stats: JSON.parse(req.body?.stats || '[]'),
                };

                // Handle uploaded images
                if (req.files) {
                    for (const fieldname in req.files) {
                        if (req.files[fieldname] && Array.isArray(req.files[fieldname])) {
                            const file = req.files[fieldname][0];
                            if (file) {
                                try {
                                    const uploadedFile = await firebaseStorage.uploadToFirebase(file, 'about');

                                    if (fieldname === 'bannerImage') {
                                        aboutData.bannerImage = uploadedFile.url;
                                        aboutData.bannerImageData = uploadedFile;
                                    } else if (fieldname === 'companyImage') {
                                        aboutData.companyImage = uploadedFile.url;
                                        aboutData.companyImageData = uploadedFile;
                                    }
                                    else if (fieldname === 'profileImage') {
                                        aboutData.profileImage = uploadedFile.url;
                                        aboutData.profileImageData = uploadedFile;

                                    } else if (fieldname === 'logo') {
                                        aboutData.logo = uploadedFile.url;
                                        aboutData.logoData = uploadedFile;
                                    }

                                    uploadedFiles.push(uploadedFile);
                                } catch (uploadError) {
                                    console.error(`Error uploading ${fieldname}:`, uploadError);
                                }
                            }
                        }
                    }
                }

                // Get existing data to handle image deletions
                const existingData = await AboutContent.getAboutData();

                // Handle image deletions based on flags sent from frontend
                // In your updateAboutData function, fix the field names:
                if (req.body?.deleteBannerImage === 'true' && existingData && existingData.bannerImageData) {
                    await firebaseStorage.deleteFromFirebase(existingData.bannerImageData);
                    aboutData.bannerImage = '';
                    aboutData.bannerImageData = null;
                } else if (!aboutData.bannerImage && existingData && existingData.bannerImage) {
                    aboutData.bannerImage = existingData.bannerImage;
                    aboutData.bannerImageData = existingData.bannerImageData;
                }

                if (req.body?.deleteCompanyImage === 'true' && existingData && existingData.companyImageData) {
                    await firebaseStorage.deleteFromFirebase(existingData.companyImageData);
                    aboutData.companyImage = '';
                    aboutData.companyImageData = null;
                } else if (!aboutData.companyImage && existingData && existingData.companyImage) {
                    aboutData.companyImage = existingData.companyImage;
                    aboutData.companyImageData = existingData.companyImageData;
                }

                if (req.body?.deleteProfileImage === 'true' && existingData && existingData.profileImageData) {
                    await firebaseStorage.deleteFromFirebase(existingData.profileImageData);
                    aboutData.profileImage = '';
                    aboutData.profileImageData = null;
                } else if (!aboutData.profileImage && existingData && existingData.profileImage) {
                    aboutData.profileImage = existingData.profileImage;
                    aboutData.profileImageData = existingData.profileImageData;
                }

                if (req.body?.deleteLogo === 'true' && existingData && existingData.logoData) {
                    await firebaseStorage.deleteFromFirebase(existingData.logoData);
                    aboutData.logo = '';
                    aboutData.logoData = null;
                } else if (!aboutData.logo && existingData && existingData.logo) {
                    aboutData.logo = existingData.logo;
                    aboutData.logoData = existingData.logoData;
                }
                // Validate about data
                const validationErrors = AboutContent.validateAboutData(aboutData);
                if (validationErrors.length > 0) {
                    await firebaseStorage.cleanupUploads(uploadedFiles);
                    return res.status(400).json({
                        success: false,
                        errors: validationErrors,
                    });
                }

                await AboutContent.updateAboutData(aboutData);

                res.status(200).json({
                    success: true,
                    message: 'About data updated successfully',
                });
            } catch (error) {
                console.error('Error in updateAboutData:', error);
                if (uploadedFiles.length > 0) {
                    await firebaseStorage.cleanupUploads(uploadedFiles);
                }
                res.status(500).json({
                    success: false,
                    error: 'Failed to update about data',
                    details: error.message,
                });
            }
        });
    } catch (error) {
        console.error('Error in updateAboutData:', error);
        if (uploadedFiles.length > 0) {
            await firebaseStorage.cleanupUploads(uploadedFiles);
        }
        res.status(500).json({
            success: false,
            error: 'Failed to update about data',
            details: error.message,
        });
    }
};

const getPublicAboutData = async (req, res) => {
    try {
        const aboutData = await AboutContent.getAboutData();

        res.status(200).json({
            success: true,
            data: aboutData,
        });
    } catch (error) {
        console.error('Error in getPublicAboutData:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch about data',
            details: error.message,
        });
    }
};

module.exports = {
    getAboutData,
    updateAboutData,
    getPublicAboutData
};