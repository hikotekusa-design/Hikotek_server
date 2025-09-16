// routes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../Controller/AuthController');
const verifyAdmin = require('../Middleware/authMiddleware'); 
const {uploadImages, firebaseStorage, handleUploadErrors} = require('../Middleware/uploadMiddleware')
const enquiries=require('../Controller/EnquiryController')
const DistributorController=require('../Controller/DistributorController')
const ProductController=require('../Controller/productController')
const {getAllAddresses,getAddressById,createAddress,updateAddress,deleteAddress,getActiveAddresses} = require('../Controller/AddressController');
const FooterController=require('../Controller/FooterController')
const HomeController = require('../Controller/HomeController');
const AboutController=require('../Controller/AboutController')
const SubscriptionController=require('../Controller/SubscriptionController')





// Admin login route
router.post('/login', AuthController.loginAdmin)

// router.post('/otp/request', AuthController.requestOTP);
// router.post('/otp/verify', AuthController.verifyOTP);

// Protected routes (require admin authentication)
// router.get('/verify', verifyAdmin, AuthController.verifyToken);
// router.post('/cache/clear', verifyAdmin, AuthController.clearCache);
// router.get('/cache/stats', verifyAdmin, AuthController.getCacheStats);

router.get('/admin/dashboard', verifyAdmin );
router.get('/admin/products/count', ProductController.getProductCount);
router.get('/admin/enquiries/count', enquiries.getEnquiryCount)
router.get('/admin/distributor/count', DistributorController.getApplicationCount)
router.get('/admin/enquiries/recent', enquiries.getRecentEnquiries);
router.get('/admin/distributor/recent', DistributorController.getRecentApplications);







router.post('/enquiries', enquiries.createEnquiry);
router.get('/admin/enquiries', enquiries.getAllEnquiries);
router.get('/admin/enquiries/:id',enquiries.getEnquiry);
router.patch('/admin/enquiries/:id/status',enquiries.updateStatus);
router.delete('/admin/enquiries/:id', enquiries.deleteEnquiry);

router.post('/distributor', DistributorController.submitApplication);

// Admin-protected routes
router.get('/admin/distributor',  DistributorController.getAllApplications);
router.get('/admin/distributor/:id', DistributorController.getApplication);
router.patch('/admin/distributor/:id/status', DistributorController.updateStatus);
router.delete('/admin/distributor/:id',DistributorController.deleteApplication)

router.post('/admin/products', uploadImages,firebaseStorage.processUploads,handleUploadErrors, ProductController.createProduct);
router.get('/admin/products',  ProductController.getAllProducts);
router.get('/admin/products/:id', ProductController.getProductById);
router.patch('/admin/products/:id', uploadImages,firebaseStorage.processUploads,handleUploadErrors,ProductController.updateProduct);
router.delete('/admin/products/subcategory/:subcategory', ProductController.deleteSubcategory);
router.delete('/admin/products/category/:category', ProductController.deleteCategory);

router.get('/admin/addresses', getAllAddresses);
router.get('/admin/addresses/:id', getAddressById);
router.post('/admin/addresses', createAddress);
router.put('/admin/addresses/:id', updateAddress);
router.delete('/admin/addresses/:id', deleteAddress);

// Public route (for user display)
router.get('/addresses', getActiveAddresses);


// router.patch('/admin/products/:id', ProductController.updateStatus);
router.delete('/admin/products/:id', ProductController.deleteProduct);

router.get('/products/showcase', ProductController.getShowcaseProducts);
router.get('/products/showcaseall', ProductController.getShowcaseAllProducts);
router.get('/products/public/:id', ProductController.getPublicProductById);
router.get('/products/featured', ProductController.getfeatured);




router.get('/products/search', ProductController.searchProducts);

router.get('/products/:id', ProductController.getPublicProductById);

router.get('/admin/footer', FooterController.getAllFooterDetails);
router.get('/admin/footer/:id', FooterController.getFooterDetail);
router.post('/admin/footer', FooterController.createFooterDetail);
router.put('/admin/footer/:id', FooterController.updateFooterDetail);
router.delete('/admin/footer/:id', FooterController.deleteFooterDetail);

router.get('/footer', FooterController.getActiveFooter);

router.post('/admin/home/:section', uploadImages, firebaseStorage.processUploads, handleUploadErrors, HomeController.createItem);
router.get('/admin/home/:section', HomeController.getAllItems);
router.get('/admin/home/:section/:id', HomeController.getItemById);
router.patch('/admin/home/:section/:id',  uploadImages, firebaseStorage.processUploads, handleUploadErrors, HomeController.updateItem);
router.delete('/admin/home/:section/:id',  HomeController.deleteItem);

router.get('/home/carousel', HomeController.getPublicCarousel);
router.get('/home/topImages', HomeController.getPublicTopImages);
router.get('/home/bottomImages', HomeController.getPublicBottomImages)

router.get('/admin/about',  AboutController.getAboutData);
router.patch('/admin/about', AboutController.updateAboutData);

// Public route
router.get('/about', AboutController.getPublicAboutData);

router.post('/subscribe', SubscriptionController.createSubscription);



module.exports = router;