const nodemailer = require('nodemailer');
const Subscription = require('../Model/SubscriptionModel');

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'neha17example@gmail.com',
    pass: process.env.EMAIL_PASS || 'zxjw ovqy hmcu msin'
  },
});

// Subscribe to newsletter
const createSubscription = async (req, res) => {
  const { email } = req.body;

  try {
    // Validate subscription data
    const validationErrors = Subscription.validateSubscriptionData(email);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: validationErrors,
      });
    }

    // Save to Firebase Realtime Database
    await Subscription.createSubscription(email);

    // Try to send email notification, but don't fail if it doesn't work
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER || 'neha17example@gmail.com',
        to: 'neha17example@gmail.com', // Send to yourself
        subject: 'New Newsletter Subscription',
        text: `A new user has subscribed: ${email}`,
        html: `<p>A new user has subscribed to the newsletter: <strong>${email}</strong></p>`,
      });
    } catch (emailError) {
      console.log('Email notification failed (but subscription was saved):', emailError.message);
      // Continue without failing the request
    }

    res.status(200).json({
      success: true,
      message: 'Subscribed successfully',
    });
  } catch (error) {
    console.error('Error in createSubscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to subscribe',
      details: error.message,
    });
  }
};

module.exports = { createSubscription };