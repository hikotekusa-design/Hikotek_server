const { ref, push, set, get, update, remove } = require('firebase/database');
const { database } = require('../firebase');

class HomeContent {
  static get carouselRef() {
    return ref(database, 'carousel');
  }

  static get topImagesRef() {
    return ref(database, 'topImages');
  }

  static get bottomImagesRef() {
    return ref(database, 'bottomImages');
  }

  // Helper to get reference based on section
  static getSectionRef(section) {
    switch (section) {
      case 'carousel': return HomeContent.carouselRef;
      case 'topImages': return HomeContent.topImagesRef;
      case 'bottomImages': return HomeContent.bottomImagesRef;
      default: throw new Error('Invalid section');
    }
  }

  // Create a new item
  static async createItem(section, itemData) {
    try {
      const sectionRef = HomeContent.getSectionRef(section);
      const newItemRef = push(sectionRef);
      await set(newItemRef, {
        ...itemData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return newItemRef.key;
    } catch (error) {
      console.error(`Error creating item in ${section}:`, error);
      throw error;
    }
  }

  // Get all items for a section
  static async getAllItems(section) {
    try {
      const sectionRef = HomeContent.getSectionRef(section);
      const snapshot = await get(sectionRef);
      if (snapshot.exists()) {
        const items = [];
        snapshot.forEach((childSnapshot) => {
          items.push({
            id: childSnapshot.key,
            ...childSnapshot.val(),
          });
        });
        return items;
      }
      return [];
    } catch (error) {
      console.error(`Error getting items from ${section}:`, error);
      throw error;
    }
  }

  // Get item by ID
  static async getItemById(section, id) {
    try {
      const sectionRef = HomeContent.getSectionRef(section);
      const itemRef = ref(database, `${section}/${id}`);
      const snapshot = await get(itemRef);
      if (snapshot.exists()) {
        return {
          id,
          ...snapshot.val(),
        };
      }
      return null;
    } catch (error) {
      console.error(`Error getting item from ${section}:`, error);
      throw error;
    }
  }

  // Update item
  static async updateItem(section, id, itemData) {
    try {
      const itemRef = ref(database, `${section}/${id}`);
      await update(itemRef, {
        ...itemData,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error(`Error updating item in ${section}:`, error);
      throw error;
    }
  }

  // Delete item
  static async deleteItem(section, id) {
    try {
      const itemRef = ref(database, `${section}/${id}`);
      await remove(itemRef);
      return true;
    } catch (error) {
      console.error(`Error deleting item from ${section}:`, error);
      throw error;
    }
  }

  // Validate item data
  static validateItem(section, itemData) {
    const errors = [];

    if (section === 'carousel' && (!itemData.title || itemData.title.trim() === '')) {
      errors.push('Title is required for carousel items');
    }

    if (!itemData.imageUrl || itemData.imageUrl.trim() === '') {
      errors.push('Image URL is required');
    }

    return errors;
  }
}

module.exports = HomeContent;