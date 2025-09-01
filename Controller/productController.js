const Product = require('../Model/productModel');
const { firebaseStorage } = require('../Middleware/uploadMiddleware');

const createProduct = async (req, res) => {
  let uploadedFiles = [];
  
  try {
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
    if (req.uploadedImages && Array.isArray(req.uploadedImages)) {
      productData.images = req.uploadedImages.map(file => file.url);
      productData.imageData = req.uploadedImages; // Store full metadata
      productData.mainImage = req.uploadedImages[0]?.url || '';
      uploadedFiles = [...req.uploadedImages];
    } else {
      productData.images = [];
      productData.imageData = [];
      productData.mainImage = '';
    }

    if (req.uploadedDownloads && Array.isArray(req.uploadedDownloads)) {
      productData.downloads = req.uploadedDownloads.map(file => file.url);
      productData.downloadData = req.uploadedDownloads; // Store full metadata
      uploadedFiles = [...uploadedFiles, ...req.uploadedDownloads];
    } else {
      productData.downloads = [];
      productData.downloadData = [];
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
      await firebaseStorage.cleanupUploads(uploadedFiles);
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
    if (uploadedFiles.length > 0) {
      await firebaseStorage.cleanupUploads(uploadedFiles);
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
  let uploadedFiles = [];
  
  try {
    const { id } = req.params;
    const productData = req.body;

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
    
    productData.specifications = parseArray(productData.specifications) || existingProduct.specifications || [];
    productData.highlights = parseArray(productData.highlights) || existingProduct.highlights || [];

    // Handle uploaded files from Firebase Storage
    if (req.uploadedImages && Array.isArray(req.uploadedImages)) {
      uploadedFiles = [...req.uploadedImages];
      
      if (productData.keepExistingImages === 'true') {
        productData.images = [
          ...(existingProduct.images || []),
          ...req.uploadedImages.map(file => file.url)
        ];
        productData.imageData = [
          ...(existingProduct.imageData || []),
          ...req.uploadedImages
        ];
      } else {
        // Delete old images from Firebase Storage
        if (existingProduct.imageData && existingProduct.imageData.length > 0) {
          await firebaseStorage.cleanupUploads(existingProduct.imageData);
        }
        productData.images = req.uploadedImages.map(file => file.url);
        productData.imageData = req.uploadedImages;
      }
      productData.mainImage = productData.images[0] || '';
    } else if (productData.keepExistingImages !== 'true') {
      // Delete all images if keepExistingImages is false and no new images
      if (existingProduct.imageData && existingProduct.imageData.length > 0) {
        await firebaseStorage.cleanupUploads(existingProduct.imageData);
        productData.images = [];
        productData.imageData = [];
        productData.mainImage = '';
      }
    } else {
      productData.images = existingProduct.images || [];
      productData.imageData = existingProduct.imageData || [];
      productData.mainImage = existingProduct.mainImage || (productData.images[0] || '');
    }

    if (req.uploadedDownloads && Array.isArray(req.uploadedDownloads)) {
      uploadedFiles = [...uploadedFiles, ...req.uploadedDownloads];
      
      if (productData.keepExistingDownloads === 'true') {
        productData.downloads = [
          ...(existingProduct.downloads || []),
          ...req.uploadedDownloads.map(file => file.url)
        ];
        productData.downloadData = [
          ...(existingProduct.downloadData || []),
          ...req.uploadedDownloads
        ];
      } else {
        // Delete old downloads from Firebase Storage
        if (existingProduct.downloadData && existingProduct.downloadData.length > 0) {
          await firebaseStorage.cleanupUploads(existingProduct.downloadData);
        }
        productData.downloads = req.uploadedDownloads.map(file => file.url);
        productData.downloadData = req.uploadedDownloads;
      }
    } else if (productData.keepExistingDownloads !== 'true') {
      // Delete all downloads if keepExistingDownloads is false and no new downloads
      if (existingProduct.downloadData && existingProduct.downloadData.length > 0) {
        await firebaseStorage.cleanupUploads(existingProduct.downloadData);
        productData.downloads = [];
        productData.downloadData = [];
      }
    } else {
      productData.downloads = existingProduct.downloads || [];
      productData.downloadData = existingProduct.downloadData || [];
    }

    // Update only provided fields
    const updateData = {
      ...(productData.name && { name: productData.name }),
      ...(productData.price && { price: parseFloat(productData.price) }),
      ...(productData.showPrice !== undefined && { showPrice: productData.showPrice === 'true' || productData.showPrice === true }),
      ...(productData.category && { category: productData.category }),
      ...(productData.description && { description: productData.description }),
      ...(productData.specifications.length > 0 && { specifications: productData.specifications }),
      ...(productData.highlights.length > 0 && { highlights: productData.highlights }),
      ...(productData.images && { images: productData.images }),
      ...(productData.imageData && { imageData: productData.imageData }),
      ...(productData.mainImage && { mainImage: productData.mainImage }),
      ...(productData.downloads && { downloads: productData.downloads }),
      ...(productData.downloadData && { downloadData: productData.downloadData }),
      updatedAt: new Date().toISOString(),
    };

    await Product.updateProduct(id, updateData);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
    });
  } catch (error) {
    console.error('Error in updateProduct:', error);

    // Clean up uploaded files from Firebase Storage on error
    if (uploadedFiles.length > 0) {
      await firebaseStorage.cleanupUploads(uploadedFiles);
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

    // Delete associated files from Firebase Storage using fileData
    const filesToDelete = [
      ...(product.imageData || []),
      ...(product.downloadData || [])
    ];

    if (filesToDelete.length > 0) {
      await firebaseStorage.cleanupUploads(filesToDelete);
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

    const showcaseProducts = products
      .filter(product => product.status !== 'inactive')
      .slice(0, 5)
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

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Search term is required',
      });
    }

    const products = await Product.getAllProducts();

    if (!products || !Array.isArray(products)) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch products from database',
      });
    }

    const searchTerm = name.trim().toLowerCase();
    const filteredProducts = products
      .filter(product => 
        product.name && 
        typeof product.name === 'string' && 
        product.name.toLowerCase().includes(searchTerm) &&
        product.status !== 'inactive'
      )
      .map(product => ({
        id: product.id,
        name: product.name,
      }));

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