const express = require('express');
const router = express.Router();
const AuthController = require('../Controller/AuthController');
const verifyAdmin = require('../Middleware/authMiddleware'); 
const {uploadImages} = require('../Middleware/uploadMiddleware')
const enquiries=require('../Controller/EnquiryController')
const DistributorController=require('../Controller/DistributorController')
const ProductController=require('../Controller/productController')




// Admin login route
router.post('/login', AuthController.loginAdmin);
router.get('/admin/dashboard', verifyAdmin, );
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

router.post('/admin/products', uploadImages, ProductController.createProduct);
router.get('/admin/products',  ProductController.getAllProducts);
router.get('/admin/products/:id', ProductController.getProductById);
router.patch('/admin/products/:id', uploadImages,ProductController.updateProduct);


// router.patch('/admin/products/:id', ProductController.updateStatus);
router.delete('/admin/products/:id', ProductController.deleteProduct);

router.get('/products/showcase', ProductController.getShowcaseProducts);
router.get('/products/showcaseall', ProductController.getShowcaseAllProducts);


router.get('/products/search', ProductController.searchProducts);

router.get('/products/:id', ProductController.getPublicProductById);







module.exports = router;