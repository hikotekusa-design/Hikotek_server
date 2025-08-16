const express = require('express');
const router = express.Router();
const AuthController = require('../Controller/AuthController');
const ProductController=require('../Controller/productController')
const verifyAdmin = require('../Middleware/authMiddleware'); 
const upload = require('../Middleware/uploadMiddleware')


// Admin login route
router.post('/login', AuthController.loginAdmin);

router.post('/products', verifyAdmin, upload.array('images', 5), ProductController.createProduct);
router.get('/products', verifyAdmin, ProductController.getAllProducts);
router.get('/products/:id', verifyAdmin, ProductController.getProductById);
router.put('/products/:id', verifyAdmin, upload.array('images', 5), ProductController.updateProduct);
router.delete('/products/:id', verifyAdmin, ProductController.deleteProduct);





// Add more protected routes as needed
module.exports = router;