const { ref, push, set, get,update } = require('firebase/database');
const { database } = require('../firebase'); // Import the initialized database

class Enquiry {
  static get enquiriesRef() {
    return ref(database, 'enquiries');
  }

  // Create a new enquiry
  static async createEnquiry(enquiryData) {
    try {
      const newEnquiryRef = push(Enquiry.enquiriesRef);
      await set(newEnquiryRef, {
        ...enquiryData,
        status: 'new',
        createdAt: new Date().toISOString()
      });
      return newEnquiryRef.key;
    } catch (error) {
      console.error("Error creating enquiry:", error);
      throw error;
    }
  }

  // Get all enquiries
  static async getAllEnquiries() {
    try {
      const snapshot = await get(Enquiry.enquiriesRef);
      if (snapshot.exists()) {
        const enquiries = [];
        snapshot.forEach((childSnapshot) => {
          enquiries.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        return enquiries;
      }
      return [];
    } catch (error) {
      console.error("Error getting enquiries:", error);
      throw error;
    }
  }

  // Get enquiry by ID
  static async getEnquiryById(id) {
    try {
      const enquiryRef = ref(database, `enquiries/${id}`);
      const snapshot = await get(enquiryRef);
      if (snapshot.exists()) {
        return {
          id,
          ...snapshot.val()
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting enquiry:", error);
      throw error;
    }
  }

    static async updateStatus(id, status) {
    try {
      const enquiryRef = ref(database, `enquiries/${id}/status`);
      await update(enquiryRef, { status });
      return true;
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  }
}

module.exports = Enquiry;