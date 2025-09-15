const HomeContent = require('../Model/HomeModel');
const { firebaseStorage } = require('../Middleware/uploadMiddleware');

const createItem = async (req, res) => {
  let uploadedFiles = [];

  try {
    const { section } = req.params; // Expect section to be 'carousel', 'topImages', or 'bottomImages'
    const itemData = {
      title: req.body.title || '', // Title only for carousel
      imageUrl: '',
      imageData: null, // Store full metadata
    };

    // Handle uploaded image
    if (req.uploadedImages && Array.isArray(req.uploadedImages) && req.uploadedImages.length > 0) {
      itemData.imageUrl = req.uploadedImages[0].url;
      itemData.imageData = req.uploadedImages[0];
      uploadedFiles = [...req.uploadedImages];
    }

    // Validate item data
    const validationErrors = HomeContent.validateItem(section, itemData);
    if (validationErrors.length > 0) {
      await firebaseStorage.cleanupUploads(uploadedFiles);
      return res.status(400).json({
        success: false,
        errors: validationErrors,
      });
    }

    const itemId = await HomeContent.createItem(section, itemData);

    res.status(201).json({
      success: true,
      message: `Item created successfully in ${section}`,
      data: {
        id: itemId,
        ...itemData,
      },
    });
  } catch (error) {
    console.error(`Error in createItem (${section}):`, error);
    if (uploadedFiles.length > 0) {
      await firebaseStorage.cleanupUploads(uploadedFiles);
    }
    res.status(500).json({
      success: false,
      error: `Failed to create item in ${section}`,
      details: error.message,
    });
  }
};

const getAllItems = async (req, res) => {
  try {
    const { section } = req.params;
    const items = await HomeContent.getAllItems(section);

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error(`Error in getAllItems (${req.params.section}):`, error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch items from ${req.params.section}`,
      details: error.message,
    });
  }
};

const getItemById = async (req, res) => {
  try {
    const { section, id } = req.params;
    const item = await HomeContent.getItemById(section, id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: `Item not found in ${section}`,
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error(`Error in getItemById (${req.params.section}):`, error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch item from ${req.params.section}`,
      details: error.message,
    });
  }
};

const updateItem = async (req, res) => {
  let uploadedFiles = [];

  try {
    const { section, id } = req.params;
    const itemData = {
      title: req.body.title || '', // Title only for carousel
    };

    // Check if item exists
    const existingItem = await HomeContent.getItemById(section, id);
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        error: `Item with ID ${id} not found in ${section}`,
      });
    }

    // Handle uploaded image
    if (req.uploadedImages && Array.isArray(req.uploadedImages) && req.uploadedImages.length > 0) {
      if (req.body.keepExistingImage !== 'true') {
        // Delete old image from Firebase Storage
        if (existingItem.imageData) {
          await firebaseStorage.deleteFromFirebase(existingItem.imageData);
        }
        itemData.imageUrl = req.uploadedImages[0].url;
        itemData.imageData = req.uploadedImages[0];
        uploadedFiles = [...req.uploadedImages];
      } else {
        itemData.imageUrl = existingItem.imageUrl;
        itemData.imageData = existingItem.imageData;
      }
    } else if (req.body.keepExistingImage !== 'true') {
      // Delete old image if no new image and keepExistingImage is false
      if (existingItem.imageData) {
        await firebaseStorage.deleteFromFirebase(existingItem.imageData);
      }
      itemData.imageUrl = '';
      itemData.imageData = null;
    } else {
      itemData.imageUrl = existingItem.imageUrl;
      itemData.imageData = existingItem.imageData;
    }

    // Validate item data
    const validationErrors = HomeContent.validateItem(section, itemData);
    if (validationErrors.length > 0) {
      await firebaseStorage.cleanupUploads(uploadedFiles);
      return res.status(400).json({
        success: false,
        errors: validationErrors,
      });
    }

    await HomeContent.updateItem(section, id, itemData);

    res.status(200).json({
      success: true,
      message: `Item updated successfully in ${section}`,
    });
  } catch (error) {
    console.error(`Error in updateItem (${req.params.section}):`, error);
    if (uploadedFiles.length > 0) {
      await firebaseStorage.cleanupUploads(uploadedFiles);
    }
    res.status(500).json({
      success: false,
      error: `Failed to update item in ${req.params.section}`,
      details: error.message,
    });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { section, id } = req.params;

    // Check if item exists
    const item = await HomeContent.getItemById(section, id);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: `Item with ID ${id} not found in ${section}`,
      });
    }

    // Delete associated image from Firebase Storage
    if (item.imageData) {
      await firebaseStorage.deleteFromFirebase(item.imageData);
    }

    await HomeContent.deleteItem(section, id);

    res.status(200).json({
      success: true,
      message: `Item ${id} deleted successfully from ${section}`,
    });
  } catch (error) {
    console.error(`Error in deleteItem (${req.params.section}):`, error);
    res.status(500).json({
      success: false,
      error: `Failed to delete item from ${req.params.section}`,
      details: error.message,
    });
  }
};

const getPublicCarousel = async (req, res) => {
  try {
    const items = await HomeContent.getAllItems('carousel');
    
    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Error in getPublicCarousel:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch carousel items',
      details: error.message,
    });
  }
};
const getPublicTopImages = async (req, res) => {
  try {
    const items = await HomeContent.getAllItems('topImages');
    
    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Error in getPublicTopImages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top images',
      details: error.message,
    });
  }
};
const getPublicBottomImages = async (req, res) => {
  try {
    const items = await HomeContent.getAllItems('bottomImages');
    
    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Error in getPublicBottomImages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bottom images',
      details: error.message,
    });
  }
};

module.exports = {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  getPublicCarousel,
  getPublicTopImages,
  getPublicBottomImages
};