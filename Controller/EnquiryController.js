const Enquiry = require('../Model/Enquiry');

const createEnquiry = async (req, res) => {
  try {
    const enquiryData = req.body;
    
    // Validation
    if (!enquiryData.fullName || !enquiryData.email || 
        !enquiryData.company || !enquiryData.country || 
        !enquiryData.comments) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const enquiryId = await Enquiry.createEnquiry(enquiryData);
    res.status(201).json({ 
      success: true, 
      message: "Enquiry submitted successfully", 
      enquiryId 
    });
  } catch (error) {
    console.error("Error in createEnquiry:", error);
    res.status(500).json({ 
      error: "Failed to submit enquiry",
      details: error.message 
    });
  }
};

const getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.getAllEnquiries();
    res.status(200).json({
      success: true,
      data: enquiries
    });
  } catch (error) {
    console.error("Error in getAllEnquiries:", error);
    res.status(500).json({ 
      error: "Failed to fetch enquiries",
      details: error.message 
    });
  }
};

const getEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const enquiry = await Enquiry.getEnquiryById(id);
    
    if (!enquiry) {
      return res.status(404).json({ 
        error: "Enquiry not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      data: enquiry
    });
  } catch (error) {
    console.error("Error in getEnquiry:", error);
    res.status(500).json({ 
      error: "Failed to fetch enquiry",
      details: error.message 
    });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await Enquiry.updateStatus(id, status);
    
    res.status(200).json({
      success: true,
      message: "Status updated successfully"
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ 
      error: "Failed to update status",
      details: error.message 
    });
  }
}

const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if enquiry exists first
    const enquiry = await Enquiry.getEnquiryById(id);
    if (!enquiry) {
      return res.status(404).json({ 
        success: false,
        error: `Enquiry with ID ${id} not found`
      });
    }
    
    await Enquiry.deleteEnquiry(id);
    
    res.status(200).json({
      success: true,
      message: `Enquiry ${id} deleted successfully`
    });
  } catch (error) {
    console.error("Detailed delete error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to delete enquiry",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  createEnquiry,
  getAllEnquiries,
  getEnquiry,
  updateStatus,
   deleteEnquiry
};