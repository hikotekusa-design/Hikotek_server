const { ref, push, set, get, update, remove } = require('firebase/database');
const { database } = require('../firebase');

class AboutContent {
  static get aboutRef() {
    return ref(database, 'about');
  }

  // Get all about data
  static async getAboutData() {
    try {
      const aboutRef = AboutContent.aboutRef;
      const snapshot = await get(aboutRef);
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      console.error('Error getting about data:', error);
      throw error;
    }
  }

  // Update about data
  static async updateAboutData(aboutData) {
    try {
      const aboutRef = AboutContent.aboutRef;
      await update(aboutRef, {
        ...aboutData,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Error updating about data:', error);
      throw error;
    }
  }

  // Validate about data
  static validateAboutData(aboutData) {
    const errors = [];

    if (!aboutData.tagline || aboutData.tagline.trim() === '') {
      errors.push('Tagline is required');
    }

    if (!aboutData.companyProfile || aboutData.companyProfile.trim() === '') {
      errors.push('Company profile is required');
    }

    if (!aboutData.profileTitle || aboutData.profileTitle.trim() === '') {
      errors.push('Profile title is required');
    }

    if (!aboutData.profileDescription || aboutData.profileDescription.trim() === '') {
      errors.push('Profile description is required');
    }

    // Validate stats
    if (!aboutData.stats || !Array.isArray(aboutData.stats) || aboutData.stats.length === 0) {
      errors.push('Stats are required');
    } else {
      aboutData.stats.forEach((stat, index) => {
        if (typeof stat.value !== 'number' || stat.value < 0) {
          errors.push(`Stat ${index + 1} value must be a positive number`);
        }
        if (!stat.label || stat.label.trim() === '') {
          errors.push(`Stat ${index + 1} label is required`);
        }
      });
    }

    return errors;
  }
}

module.exports = AboutContent;