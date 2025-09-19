// productModel.js
const { ref, push, set, get, update, remove } = require('firebase/database');
const { database } = require('../firebase');

class Product {
  static get productsRef() {
    return ref(database, 'products');
  }

  // Create a new product
  static async createProduct(productData) {
    try {
      const newProductRef = push(Product.productsRef);
      await set(newProductRef, {
        ...productData,
        status: productData.status || 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return newProductRef.key;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Get all products
  static async getAllProducts() {
    try {
      const snapshot = await get(Product.productsRef);
      if (snapshot.exists()) {
        const products = [];
        snapshot.forEach((childSnapshot) => {
          products.push({
            id: childSnapshot.key,
            ...childSnapshot.val(),
          });
        });
        return products;
      }
      return [];
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  }

  // Get product by ID
  static async getProductById(id) {
    try {
      const productRef = ref(database, `products/${id}`);
      const snapshot = await get(productRef);
      if (snapshot.exists()) {
        return {
          id,
          ...snapshot.val(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  }

  // Update product
  static async updateProduct(id, productData) {
    try {
      const productRef = ref(database, `products/${id}`);
      await update(productRef, {
        ...productData,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

 

  // Delete product
  static async deleteProduct(id) {
    try {
      const productRef = ref(database, `products/${id}`);
      await remove(productRef);
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Validate product data
  static validateProduct(productData) {
    const errors = [];

    if (!productData.name || productData.name.trim() === '') {
      errors.push('Product name is required');
    }

    if (!productData.category || productData.category.trim() === '') {
      errors.push('Category is required');
    }

    if (!productData.price || isNaN(parseFloat(productData.price))) {
      errors.push('Valid price is required');
    }
    
    if (productData.isFeatured !== undefined && typeof productData.isFeatured !== 'boolean') {
    errors.push('isFeatured must be a boolean value');
  }

    return errors;
  }


// Update multiple products by criteria
static async updateProductsByCriteria(criteria, updates) {
  try {
    const products = await Product.getAllProducts();
    const updatePromises = [];

    products.forEach((product) => {
      let shouldUpdate = false;
      
      // Check if product matches criteria
      if (criteria.subcategory && product.subcategory === criteria.subcategory) {
        shouldUpdate = true;
      }
      if (criteria.category && product.category === criteria.category) {
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        const productRef = ref(database, `products/${product.id}`);
        updatePromises.push(update(productRef, {
          ...updates,
          updatedAt: new Date().toISOString(),
        }));
      }
    });

    await Promise.all(updatePromises);
    return { modifiedCount: updatePromises.length };
  } catch (error) {
    console.error('Error updating products:', error);
    throw error;
  }
}
}

module.exports = Product;