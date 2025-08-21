const Distributor = require('../Model/DistributorApplication');

class DistributorController {
  // Submit new application (Public)
  static async submitApplication(req, res) {
    try {
      const { company, contactName, email, phone, channels, title } = req.body;

      if (!company || !contactName || !email || !phone || !channels || !title) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      const applicationId = await Distributor.createApplication({
        company,
        contactName,
        email,
        phone,
        channels,
        title
      });

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        applicationId
      });
    } catch (error) {
      console.error('Submission error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit application'
      });
    }
  }

  // Get all applications (Admin)
  static async getAllApplications(req, res) {
    try {
      const applications = await Distributor.getAllApplications();
      res.status(200).json({
        success: true,
        data: applications
      });
    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch applications'
      });
    }
  }

  // Get single application (Admin)
  static async getApplication(req, res) {
    try {
      const application = await Distributor.getApplicationById(req.params.id);
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }
      res.status(200).json({
        success: true,
        data: application
      });
    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch application'
      });
    }
  }

  // Update status (Admin)
  static async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const validStatuses = ['pending', 'approved', 'rejected'];

      if (!validStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }

      const success = await Distributor.updateStatus(req.params.id, status);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Status updated successfully'
      });
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update status'
      });
    }
  }

  // Delete application (Admin)
  static async deleteApplication(req, res) {
    try {
      const success = await Distributor.deleteApplication(req.params.id);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Application deleted successfully'
      });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete application'
      });
    }
  }

static async getApplicationCount(req, res) {
  try {
    const applications = await Distributor.getAllApplications();
    console.log('Fetched applications:', applications); // Debug log
    const count = Array.isArray(applications) ? applications.length : 0;
    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error('Error in getApplicationCount:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch distributor count',
      details: error.message,
    });
  }
}

static async getRecentApplications(req, res) {
  try {
    const applications = await Distributor.find({})
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(5) // Limit to 5
      .select('company contactName status createdAt') // Select relevant fields
      .exec();
    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error('Error in getRecentApplications:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent applications',
      details: error.message,
    });
  }
}
}

module.exports = DistributorController;