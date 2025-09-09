const Footer = require('../Model/FooterModel');

// Get all footer details
const getAllFooterDetails = async (req, res) => {
  try {
    const footerDetails = await Footer.getAll();
    res.status(200).json({
      success: true,
      data: footerDetails,
    });
  } catch (error) {
    console.error('Error in getAllFooterDetails:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch footer details',
      details: error.message,
    });
  }
};

// Get single footer detail by ID
const getFooterDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const footerDetail = await Footer.getById(id);
    
    if (!footerDetail) {
      return res.status(404).json({
        success: false,
        error: 'Footer detail not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: footerDetail,
    });
  } catch (error) {
    console.error('Error in getFooterDetail:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch footer detail',
      details: error.message,
    });
  }
};

// Create new footer detail
const createFooterDetail = async (req, res) => {
  try {
    const {
      description,
      email,
      phone,
      address,
      facebook,
      instagram,
      twitter,
      youtube,
    } = req.body;

    const footerData = {
      description: description || '',
      email: email || '',
      phone: phone || '',
      address: address || '',
      facebook: facebook || '',
      instagram: instagram || '',
      twitter: twitter || '',
      youtube: youtube || '',
    };

    const footerId = await Footer.create(footerData);
    
    res.status(201).json({
      success: true,
      message: 'Footer detail created successfully',
      data: {
        id: footerId,
        ...footerData
      }
    });
  } catch (error) {
    console.error('Error in createFooterDetail:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create footer detail',
      details: error.message,
    });
  }
};

// Update footer detail
const updateFooterDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      description,
      email,
      phone,
      address,
      facebook,
      instagram,
      twitter,
      youtube,
    } = req.body;

    // Check if footer detail exists
    const existingDetail = await Footer.getById(id);
    if (!existingDetail) {
      return res.status(404).json({
        success: false,
        error: 'Footer detail not found',
      });
    }

    const footerData = {
      description: description !== undefined ? description : existingDetail.description,
      email: email !== undefined ? email : existingDetail.email,
      phone: phone !== undefined ? phone : existingDetail.phone,
      address: address !== undefined ? address : existingDetail.address,
      facebook: facebook !== undefined ? facebook : existingDetail.facebook,
      instagram: instagram !== undefined ? instagram : existingDetail.instagram,
      twitter: twitter !== undefined ? twitter : existingDetail.twitter,
      youtube: youtube !== undefined ? youtube : existingDetail.youtube,
    };

    await Footer.update(id, footerData);
    
    res.status(200).json({
      success: true,
      message: 'Footer detail updated successfully',
      data: { id, ...footerData }
    });
  } catch (error) {
    console.error('Error in updateFooterDetail:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update footer detail',
      details: error.message,
    });
  }
};

// Delete footer detail
const deleteFooterDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if footer detail exists
    const existingDetail = await Footer.getById(id);
    if (!existingDetail) {
      return res.status(404).json({
        success: false,
        error: 'Footer detail not found',
      });
    }

    await Footer.delete(id);
    
    res.status(200).json({
      success: true,
      message: 'Footer detail deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteFooterDetail:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete footer detail',
      details: error.message,
    });
  }
};

// Get active footer details (for public display)
const getActiveFooter = async (req, res) => {
  try {
    const footerDetails = await Footer.getAll();
    
    // Get the first footer
    const activeFooter = footerDetails.length > 0 ? footerDetails[0] : null;
    
    if (!activeFooter) {
      return res.status(404).json({
        success: false,
        error: 'No footer details found',
      });
    }

    res.status(200).json({
      success: true,
      data: activeFooter,
    });
  } catch (error) {
    console.error('Error in getActiveFooter:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch footer',
      details: error.message,
    });
  }
};

// Get footer count
const getFooterCount = async (req, res) => {
  try {
    const footerDetails = await Footer.getAll();
    const count = Array.isArray(footerDetails) ? footerDetails.length : 0;
    
    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error('Error in getFooterCount:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch footer count',
      details: error.message,
    });
  }
};

// Export all controller methods
module.exports = {
  getAllFooterDetails,
  getFooterDetail,
  createFooterDetail,
  updateFooterDetail,
  deleteFooterDetail,
  getActiveFooter,
  getFooterCount
};