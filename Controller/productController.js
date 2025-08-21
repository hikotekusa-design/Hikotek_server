// productController.js
const Product = require('../Model/productModel');
const fs = require('fs').promises; // Use promises for async file operations
const path = require('path');

// productController.js - Fix createProduct function
const createProduct = async (req, res) => {
  try {
    // For FormData, we need to parse the fields differently
    const productData = {
      name: req.body.name,
      price: req.body.price,
      showPrice: req.body.showPrice,
      category: req.body.category,
      description: req.body.description,
      specifications: req.body.specifications || [],
      highlights: req.body.highlights || [],
      status: req.body.status || 'active'
    };

    const baseUrl = `${req.protocol}://${req.get('host')}/`;

    // Parse arrays from JSON strings if needed
    try {
      if (typeof productData.specifications === 'string') {
        productData.specifications = JSON.parse(productData.specifications);
      }
    } catch (e) {
      productData.specifications = [];
    }

    try {
      if (typeof productData.highlights === 'string') {
        productData.highlights = JSON.parse(productData.highlights);
      }
    } catch (e) {
      productData.highlights = [];
    }

    // Handle uploaded files
    let filesToDelete = [];

    if (req.files) {
      // Handle images
      if (req.files['images'] && Array.isArray(req.files['images'])) {
        productData.images = req.files['images'].map((file) => {
          filesToDelete.push(file.path);
          return `${baseUrl}uploads/images/${file.filename}`;
        });
        productData.mainImage = productData.images[0] || '';
      } else {
        productData.images = [];
        productData.mainImage = '';
      }

      // Handle downloads
      if (req.files['downloads'] && Array.isArray(req.files['downloads'])) {
        productData.downloads = req.files['downloads'].map((file) => {
          filesToDelete.push(file.path);
          return `${baseUrl}uploads/downloads/${file.filename}`;
        });
      } else {
        productData.downloads = [];
      }
    } else {
      productData.images = [];
      productData.mainImage = '';
      productData.downloads = [];
    }

    // Convert price to number
    if (productData.price) {
      productData.price = parseFloat(productData.price);
    }

    // Convert showPrice to boolean
    if (productData.showPrice !== undefined) {
      productData.showPrice = productData.showPrice === 'true' || productData.showPrice === true;
    }

    // Validate product data
    const validationErrors = Product.validateProduct(productData);
    if (validationErrors.length > 0) {
      // Clean up uploaded files if validation fails
      for (const filePath of filesToDelete) {
        try {
          if (await fs.access(filePath).then(() => true).catch(() => false)) {
            await fs.unlink(filePath);
          }
        } catch (error) {
          console.warn(`Failed to clean up file ${filePath}:`, error.message);
        }
      }

      return res.status(400).json({
        success: false,
        errors: validationErrors,
      });
    }

    const productId = await Product.createProduct(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      productId,
      product: productData,
    });
  } catch (error) {
    console.error('Error in createProduct:', error);

    // Clean up uploaded files on error
    if (req.files) {
      const filesToDelete = [
        ...(req.files['images'] || []).map((file) => file?.path).filter(Boolean),
        ...(req.files['downloads'] || []).map((file) => file?.path).filter(Boolean),
      ];
      for (const filePath of filesToDelete) {
        try {
          if (filePath && await fs.access(filePath).then(() => true).catch(() => false)) {
            await fs.unlink(filePath);
          }
        } catch (err) {
          console.warn(`Failed to clean up file ${filePath}:`, err.message);
        }
      }
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create product',
      details: error.message,
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.getAllProducts();

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      details: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
      details: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;
    const baseUrl = `${req.protocol}://${req.get('host')}/`;

    // Check if product exists
    const existingProduct = await Product.getProductById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: `Product with ID ${id} not found`,
      });
    }

    // Parse arrays from string if needed
    const parseArray = (value) => {
      if (!value) return [];
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (e) {
          return value.split(',').map((s) => s.trim());
        }
      }
      return value;
    };
    productData.specifications = parseArray(productData.specifications) || existingProduct.specifications || [''];
    productData.highlights = parseArray(productData.highlights) || existingProduct.highlights || [''];

    // Handle uploaded files
    if (req.files) {
      if (req.files['images']) {
        const newImages = req.files['images'].map((file) => `${baseUrl}uploads/images/${file.filename}`);
        if (productData.keepExistingImages === 'true') {
          productData.images = [...(existingProduct.images || []), ...newImages];
        } else {
          // Delete old images
          if (existingProduct.images && existingProduct.images.length > 0) {
            for (const imageUrl of existingProduct.images) {
              const filename = imageUrl.split('/uploads/images/')[1];
              if (filename) {
                const filePath = path.join(__dirname, '../Uploads/images', filename);
                if (await fs.access(filePath).then(() => true).catch(() => false)) {
                  await fs.unlink(filePath);
                  console.log(`Deleted old image: ${filePath}`);
                }
              }
            }
          }
          productData.images = newImages;
        }
        productData.mainImage = productData.images[0] || '';
      } else if (productData.keepExistingImages !== 'true') {
        // Remove all images if keepExistingImages is false and no new images
        if (existingProduct.images && existingProduct.images.length > 0) {
          for (const imageUrl of existingProduct.images) {
            const filename = imageUrl.split('/uploads/images/')[1];
            if (filename) {
              const filePath = path.join(__dirname, '../Uploads/images', filename);
              if (await fs.access(filePath).then(() => true).catch(() => false)) {
                await fs.unlink(filePath);
                console.log(`Deleted old image: ${filePath}`);
              }
            }
          }
          productData.images = [];
          productData.mainImage = '';
        }
      } else {
        productData.images = existingProduct.images || [];
        productData.mainImage = existingProduct.mainImage || (productData.images[0] || '');
      }

      if (req.files['downloads']) {
        const newDownloads = req.files['downloads'].map((file) => `${baseUrl}uploads/downloads/${file.filename}`);
        if (productData.keepExistingDownloads === 'true') {
          productData.downloads = [...(existingProduct.downloads || []), ...newDownloads];
        } else {
          // Delete old downloads
          if (existingProduct.downloads && existingProduct.downloads.length > 0) {
            for (const downloadUrl of existingProduct.downloads) {
              const filename = downloadUrl.split('/uploads/downloads/')[1];
              if (filename) {
                const filePath = path.join(__dirname, '../Uploads/downloads', filename);
                if (await fs.access(filePath).then(() => true).catch(() => false)) {
                  await fs.unlink(filePath);
                  console.log(`Deleted old download: ${filePath}`);
                }
              }
            }
          }
          productData.downloads = newDownloads;
        }
      } else if (productData.keepExistingDownloads !== 'true') {
        // Remove all downloads if keepExistingDownloads is false and no new downloads
        if (existingProduct.downloads && existingProduct.downloads.length > 0) {
          for (const downloadUrl of existingProduct.downloads) {
            const filename = downloadUrl.split('/uploads/downloads/')[1];
            if (filename) {
              const filePath = path.join(__dirname, '../Uploads/downloads', filename);
              if (await fs.access(filePath).then(() => true).catch(() => false)) {
                await fs.unlink(filePath);
                console.log(`Deleted old download: ${filePath}`);
              }
            }
          }
          productData.downloads = [];
        }
      } else {
        productData.downloads = existingProduct.downloads || [];
      }
    }

    // Update only provided fields, preserving existing ones if not overridden
    const updateData = {
      ...(productData.name && { name: productData.name }),
      ...(productData.price && { price: parseFloat(productData.price) }),
      ...(productData.showPrice !== undefined && { showPrice: productData.showPrice === 'true' || productData.showPrice === true }),
      ...(productData.category && { category: productData.category }),
      ...(productData.description && { description: productData.description }),
      ...(productData.specifications.length > 0 && { specifications: productData.specifications }),
      ...(productData.highlights.length > 0 && { highlights: productData.highlights }),
      ...(productData.images && { images: productData.images }),
      ...(productData.mainImage && { mainImage: productData.mainImage }),
      ...(productData.downloads && { downloads: productData.downloads }),
      updatedAt: new Date().toISOString(),
    };

    await Product.updateProduct(id, updateData);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
    });
  } catch (error) {
    console.error('Error in updateProduct:', error);

    // Clean up uploaded files on error
    if (req.files) {
      const filesToDelete = [
        ...(req.files['images'] || []).map((file) => file.path),
        ...(req.files['downloads'] || []).map((file) => file.path),
      ];
      for (const filePath of filesToDelete) {
        try {
          if (await fs.access(filePath).then(() => true).catch(() => false)) {
            await fs.unlink(filePath);
            console.log(`Cleaned up file: ${filePath}`);
          }
        } catch (err) {
          console.warn(`Failed to clean up file ${filePath}:`, err.message);
        }
      }
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update product',
      details: error.message,
    });
  }
};


const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await Product.getProductById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Product with ID ${id} not found`,
      });
    }

    // Delete associated image files
    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        try {
          if (!imageUrl.includes('/uploads/images/')) {
            console.warn(`Skipping invalid image URL: ${imageUrl}`);
            continue;
          }
          const filename = imageUrl.split('/uploads/images/')[1];
          if (!filename) {
            console.warn(`Invalid image URL format: ${imageUrl}`);
            continue;
          }
          const filePath = path.join(__dirname, '../Uploads/images', filename);
          console.log('Attempting to delete image:', filePath);
          if (await fs.access(filePath).then(() => true).catch(() => false)) {
            await fs.unlink(filePath);
            console.log(`Deleted image: ${filePath}`);
          } else {
            console.warn(`Image not found: ${filePath}`);
          }
        } catch (error) {
          console.warn(`Error deleting image ${imageUrl}:`, error.message);
        }
      }
    }

    // Delete associated download files
    if (product.downloads && product.downloads.length > 0) {
      for (const downloadUrl of product.downloads) {
        try {
          if (!downloadUrl.includes('/uploads/downloads/')) {
            console.warn(`Skipping invalid download URL: ${downloadUrl}`);
            continue;
          }
          const filename = downloadUrl.split('/uploads/downloads/')[1];
          if (!filename) {
            console.warn(`Invalid download URL format: ${downloadUrl}`);
            continue;
          }
          const filePath = path.join(__dirname, '../Uploads/downloads', filename);
          console.log('Attempting to delete download:', filePath);
          if (await fs.access(filePath).then(() => true).catch(() => false)) {
            await fs.unlink(filePath);
            console.log(`Deleted download: ${filePath}`);
          } else {
            console.warn(`Download not found: ${filePath}`);
          }
        } catch (error) {
          console.warn(`Error deleting download ${downloadUrl}:`, error.message);
        }
      }
    }

    await Product.deleteProduct(id);

    res.status(200).json({
      success: true,
      message: `Product ${id} deleted successfully`,
    });
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product',
      details: error.message,
    });
  }
};

const getShowcaseProducts = async (req, res) => {
  try {
    const products = await Product.getAllProducts();

    // Filter only active products and limit to 5
    const showcaseProducts = products
      .filter(product => product.status !== 'inactive') 
      .slice(0, 5) // Take first 5 products
      .map(product => ({
        id: product.id,
        name: product.name,
        category: product.category || 'Uncategorized', // ADD THIS LINE
        mainImage: product.mainImage || '',
        highlight: Array.isArray(product.highlights) && product.highlights.length > 0 
          ? product.highlights[0] 
          : 'No highlights available',
        description: product.description || ''
      }));

    res.status(200).json({
      success: true,
      data: showcaseProducts,
    });
  } catch (error) {
    console.error('Error in getShowcaseProducts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch showcase products',
      details: error.message,
    });
  }
};

const getShowcaseAllProducts = async (req, res) => {
  try {
    const products = await Product.getAllProducts();
    console.log('Total products:', products.length);
    console.log('Product statuses:', products.map(p => ({ id: p.id, status: p.status })));

    const showcaseProducts = products
      .filter(product => product.status !== 'inactive')
      .map(product => ({
        id: product.id,
        name: product.name,
        category: product.category || 'Uncategorized',
        mainImage: product.mainImage || '',
        highlight: Array.isArray(product.highlights) && product.highlights.length > 0 
          ? product.highlights[0] 
          : 'No highlights available',
        description: product.description || ''
      }));

    console.log('Active showcase products:', showcaseProducts.length);
    res.status(200).json({
      success: true,
      data: showcaseProducts,
    });
  } catch (error) {
    console.error('Error in getShowcaseAllProducts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch all showcase products',
      details: error.message,
    });
  }
};
const getPublicProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    // Only return fields relevant for public users
    const publicProduct = {
      id: product.id,
      name: product.name,
      mainImage: product.mainImage || '',
      images: product.images || [],
      description: product.description || '',
      highlights: Array.isArray(product.highlights) ? product.highlights : [],
      specifications: Array.isArray(product.specifications) ? product.specifications : [],
      category: product.category || '',
      price: product.showPrice ? product.price : null,
      downloads: product.downloads || [],
      status: product.status || 'active',
    };

    res.status(200).json({
      success: true,
      data: publicProduct,
    });
  } catch (error) {
    console.error('Error in getPublicProductById:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
      details: error.message,
    });
  }
};

const searchProducts = async (req, res) => {
  try {
    const { name } = req.query;

    // Validate search term
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Search term is required',
      });
    }

    // Fetch all products from the database
    const products = await Product.getAllProducts();

    if (!products || !Array.isArray(products)) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch products from database',
      });
    }

    // Filter products by name (case-insensitive)
    const searchTerm = name.trim().toLowerCase();
    const filteredProducts = products
      .filter(product => 
        product.name && 
        typeof product.name === 'string' && 
        product.name.toLowerCase().includes(searchTerm) &&
        product.status !== 'inactive' // Exclude inactive products
      )
      .map(product => ({
        id: product.id,
        name: product.name,
      }));

    // Return results
    res.status(200).json({
      success: true,
      data: filteredProducts,
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search products',
      details: error.message,
    });
  }
};

// productController.js
const getProductCount = async (req, res) => {
  try {
    const products = await Product.getAllProducts();
    const count = Array.isArray(products) ? products.length : 0;
    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error('Error in getProductCount:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product count',
      details: error.message,
    });
  }
};





module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getShowcaseProducts,
  getPublicProductById,
  searchProducts,
  getProductCount,
  getShowcaseAllProducts
};