const Address = require('../Model/AddressModel');

// Get all addresses
const getAllAddresses = async (req, res) => {
  try {
    const addresses = await Address.getAllAddresses();
    
    res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error('Error in getAllAddresses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch addresses',
      details: error.message,
    });
  }
};

// Get address by ID
const getAddressById = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await Address.getAddressById(id);

    if (!address) {
      return res.status(404).json({
        success: false,
        error: 'Address not found',
      });
    }

    res.status(200).json({
      success: true,
      data: address,
    });
  } catch (error) {
    console.error('Error in getAddressById:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch address',
      details: error.message,
    });
  }
};

// Create new address
const createAddress = async (req, res) => {
  try {
    const addressData = req.body;

    const addressId = await Address.createAddress(addressData);

    res.status(201).json({
      success: true,
      message: 'Address created successfully',
      addressId,
    });
  } catch (error) {
    console.error('Error in createAddress:', error);
    
    if (error.message.includes('required') || error.message.includes('invalid')) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create address',
      details: error.message,
    });
  }
};

// Update address
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    await Address.updateAddress(id, updateData);

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
    });
  } catch (error) {
    console.error('Error in updateAddress:', error);
    
    if (error.message === 'Address not found') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    
    if (error.message.includes('required') || error.message.includes('invalid')) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update address',
      details: error.message,
    });
  }
};

// Delete address
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    await Address.deleteAddress(id);

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteAddress:', error);
    
    if (error.message === 'Address not found') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to delete address',
      details: error.message,
    });
  }
};

// Get active addresses (for user display)
const getActiveAddresses = async (req, res) => {
  try {
    const addresses = await Address.getActiveAddresses();

    res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error('Error in getActiveAddresses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch addresses',
      details: error.message,
    });
  }
};

module.exports = {
  getAllAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  getActiveAddresses
};