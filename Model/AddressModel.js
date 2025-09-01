const { db } = require('../firebase-admin');

class Address {
  constructor(data) {
    this.title = data.title || '';
    this.name = data.name || '';
    this.address = data.address || '';
    this.phone = data.phone || '';
    this.email = data.email || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.status = data.status || 'active'; // active, inactive
  }

  // Validate address data
  static validate(addressData) {
    const errors = [];
    
    if (!addressData.title || addressData.title.trim() === '') {
      errors.push('Title is required');
    }
    
    if (!addressData.name || addressData.name.trim() === '') {
      errors.push('Name is required');
    }
    
    if (!addressData.address || addressData.address.trim() === '') {
      errors.push('Address is required');
    }
    
    if (!addressData.phone || addressData.phone.trim() === '') {
      errors.push('Phone is required');
    }
    
    if (!addressData.email || addressData.email.trim() === '') {
      errors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(addressData.email)) {
      errors.push('Email is invalid');
    }
    
    return errors;
  }

  // Get all addresses
  static async getAllAddresses() {
    try {
      const snapshot = await db.ref('addresses').once('value');
      const addresses = snapshot.val();
      
      if (!addresses) {
        return [];
      }
      
      // Convert object to array with IDs
      return Object.keys(addresses).map(key => ({
        id: key,
        ...addresses[key]
      }));
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }
  }

  // Get address by ID
  static async getAddressById(id) {
    try {
      const snapshot = await db.ref(`addresses/${id}`).once('value');
      const address = snapshot.val();
      
      if (!address) {
        return null;
      }
      
      return { id, ...address };
    } catch (error) {
      console.error('Error fetching address:', error);
      throw error;
    }
  }

  // Create new address
  static async createAddress(addressData) {
    try {
      const validationErrors = this.validate(addressData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }
      
      const address = new Address(addressData);
      const newAddressRef = db.ref('addresses').push();
      await newAddressRef.set(address);
      
      return newAddressRef.key;
    } catch (error) {
      console.error('Error creating address:', error);
      throw error;
    }
  }

  // Update address
  static async updateAddress(id, updateData) {
    try {
      // Check if address exists
      const existingAddress = await this.getAddressById(id);
      if (!existingAddress) {
        throw new Error('Address not found');
      }
      
      // Validate update data if any required fields are being updated
      if (updateData.title || updateData.name || updateData.address || 
          updateData.phone || updateData.email) {
        const validationData = { ...existingAddress, ...updateData };
        const validationErrors = this.validate(validationData);
        if (validationErrors.length > 0) {
          throw new Error(validationErrors.join(', '));
        }
      }
      
      // Add updated timestamp
      updateData.updatedAt = new Date().toISOString();
      
      await db.ref(`addresses/${id}`).update(updateData);
      return true;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }

  // Delete address
  static async deleteAddress(id) {
    try {
      // Check if address exists
      const existingAddress = await this.getAddressById(id);
      if (!existingAddress) {
        throw new Error('Address not found');
      }
      
      await db.ref(`addresses/${id}`).remove();
      return true;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }

  // Get active addresses (for user display)
  static async getActiveAddresses() {
    try {
      const snapshot = await db.ref('addresses')
        .orderByChild('status')
        .equalTo('active')
        .once('value');
      
      const addresses = snapshot.val();
      
      if (!addresses) {
        return [];
      }
      
      // Convert object to array with IDs
      return Object.keys(addresses).map(key => ({
        id: key,
        ...addresses[key]
      }));
    } catch (error) {
      console.error('Error fetching active addresses:', error);
      throw error;
    }
  }
}

module.exports = Address;