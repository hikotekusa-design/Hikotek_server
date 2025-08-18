const { ref, push, set, get, update } = require('firebase/database');
const { database } = require('../firebase');

class Distributor {
  static get distributorsRef() {
    return ref(database, 'distributors');
  }

  // Create a new distributor application
  static async createApplication(applicationData) {
    try {
      const newApplicationRef = push(Distributor.distributorsRef);
      const date = new Date().toISOString();
      await set(newApplicationRef, {
        ...applicationData,
        status: 'pending',
        date,
        createdAt: date,
        updatedAt: date
      });
      return newApplicationRef.key;
    } catch (error) {
      console.error("Error creating distributor application:", error);
      throw error;
    }
  }

  // Get all applications
  static async getAllApplications() {
    try {
      const snapshot = await get(Distributor.distributorsRef);
      if (snapshot.exists()) {
        const applications = [];
        snapshot.forEach((childSnapshot) => {
          applications.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        return applications;
      }
      return [];
    } catch (error) {
      console.error("Error getting applications:", error);
      throw error;
    }
  }

  // Get application by ID
  static async getApplicationById(id) {
    try {
      const applicationRef = ref(database, `distributors/${id}`);
      const snapshot = await get(applicationRef);
      if (snapshot.exists()) {
        return { id, ...snapshot.val() };
      }
      return null;
    } catch (error) {
      console.error("Error getting application:", error);
      throw error;
    }
  }

  // Update application status
  static async updateStatus(id, status) {
    try {
      const updates = {
        [`distributors/${id}/status`]: status.toLowerCase(),
        [`distributors/${id}/updatedAt`]: new Date().toISOString()
      };
      await update(ref(database), updates);
      return true;
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  }

  // Delete application
  static async deleteApplication(id) {
    try {
      const applicationRef = ref(database, `distributors/${id}`);
      await set(applicationRef, null);
      return true;
    } catch (error) {
      console.error("Error deleting application:", error);
      throw error;
    }
  }
}

module.exports = Distributor;