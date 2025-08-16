const { db } = require('../firebase-admin');

class ProductModel {
  static async create(productData) {
    const productRef = db.collection('products').doc();
    await productRef.set({
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return productRef.id;
  }

  static async getAll() {
    const snapshot = await db.collection('products').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getById(id) {
    const doc = await db.collection('products').doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() };
  }

  static async update(id, productData) {
    await db.collection('products').doc(id).update({
      ...productData,
      updatedAt: new Date()
    });
  }

  static async delete(id) {
    await db.collection('products').doc(id).delete();
  }
}

module.exports = ProductModel;