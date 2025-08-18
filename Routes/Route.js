const express = require('express');
const router = express.Router();
const AuthController = require('../Controller/AuthController');
const ProductController=require('../Controller/productController')
const verifyAdmin = require('../Middleware/authMiddleware'); 
const upload = require('../Middleware/uploadMiddleware')
const enquiries=require('../Controller/EnquiryController')
const DistributorController=require('../Controller/DistributorController')



// Admin login route
router.post('/login', AuthController.loginAdmin);

router.post('/products', verifyAdmin, upload.array('images', 5), ProductController.createProduct);
router.get('/products', verifyAdmin, ProductController.getAllProducts);
router.get('/products/:id', verifyAdmin, ProductController.getProductById);
router.put('/products/:id', verifyAdmin, upload.array('images', 5), ProductController.updateProduct);
router.delete('/products/:id', verifyAdmin, ProductController.deleteProduct);

router.post('/enquiries', enquiries.createEnquiry);
router.get('/admin/enquiries', enquiries.getAllEnquiries);
router.get('/admin/enquiries/:id',enquiries.getEnquiry);
router.patch('/admin/enquiries/:id/status',enquiries.updateStatus);

router.post('/distributor', DistributorController.submitApplication);

// Admin-protected routes
router.get('/admin/distributor',  DistributorController.getAllApplications);
router.get('/admin/distributor/:id', DistributorController.getApplication);
router.patch('/admin/distributor/:id/status', DistributorController.updateStatus);







// Add more protected routes as needed
module.exports = router;