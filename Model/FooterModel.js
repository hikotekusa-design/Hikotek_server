const { db } = require('../firebase-admin');

class Footer {
  constructor() {
    this.ref = db.ref('footer');
  }

  // Get all footer details
  async getAll() {
    try {
      const snapshot = await this.ref.once('value');
      const data = snapshot.val();
      
      if (!data) return [];
      
      // Convert the object to an array of items with their IDs
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    } catch (error) {
      console.error('Error getting footer details:', error);
      throw error;
    }
  }

  // Get footer details by ID
  async getById(id) {
    try {
      const snapshot = await this.ref.child(id).once('value');
      const data = snapshot.val();
      
      if (!data) return null;
      return { id, ...data };
    } catch (error) {
      console.error('Error getting footer detail:', error);
      throw error;
    }
  }

  // Create new footer details
  async create(footerData) {
    try {
      const newFooterRef = this.ref.push();
      await newFooterRef.set({
        ...footerData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return newFooterRef.key;
    } catch (error) {
      console.error('Error creating footer detail:', error);
      throw error;
    }
  }

  // Update footer details
  async update(id, footerData) {
    try {
      await this.ref.child(id).update({
        ...footerData,
        updatedAt: new Date().toISOString(),
      });
      return id;
    } catch (error) {
      console.error('Error updating footer detail:', error);
      throw error;
    }
  }

  // Delete footer details
  async delete(id) {
    try {
      await this.ref.child(id).remove();
      return id;
    } catch (error) {
      console.error('Error deleting footer detail:', error);
      throw error;
    }
  }
}

// Export an instance of the class
module.exports = new Footer();