const ProductModel = require('../Model/productModel');

class ProductController {
  static async createProduct(req, res) {
    try {
      const { 
        name, 
        brand, 
        modelNo, 
        price, 
        range, 
        warranty, 
        stock, 
        description, 
        specifications 
      } = req.body;
      
      // Process images
      const images = req.files.map(file => ({
        url: `/uploads/products/${file.filename}`,
        path: file.path
      }));

      const productData = {
        name,
        brand,
        modelNo,
        price: parseFloat(price),
        range,
        warranty,
        stock: parseInt(stock),
        description,
        specifications: Array.isArray(specifications) ? specifications : [specifications],
        images
      };

      const productId = await ProductModel.create(productData);
      
      res.status(201).json({ 
        success: true, 
        message: 'Product created successfully',
        productId 
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  static async getAllProducts(req, res) {
    try {
      const products = await ProductModel.getAll();
      res.status(200).json({ 
        success: true, 
        products 
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  static async getProductById(req, res) {
    try {
      const product = await ProductModel.getById(req.params.id);
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          error: 'Product not found' 
        });
      }
      res.status(200).json({ 
        success: true, 
        product 
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const productData = req.body;
      
      // Process new images if any
      if (req.files && req.files.length > 0) {
        productData.images = req.files.map(file => ({
          url: `/uploads/products/${file.filename}`,
          path: file.path
        }));
      }

      await ProductModel.update(id, productData);
      
      res.status(200).json({ 
        success: true, 
        message: 'Product updated successfully' 
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  static async deleteProduct(req, res) {
    try {
      await ProductModel.delete(req.params.id);
      res.status(200).json({ 
        success: true, 
        message: 'Product deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
}

module.exports = ProductController;