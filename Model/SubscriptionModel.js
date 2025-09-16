const { ref, push, set, get, query, orderByChild, equalTo } = require('firebase/database');
const { database } = require('../firebase');

class Subscription {
  static get subscriptionRef() {
    return ref(database, 'subscriptions');
  }

  // Save subscription to Firebase Realtime Database
  static async createSubscription(email) {
    try {
      const subscriptionRef = Subscription.subscriptionRef;
      
      // Create a query to check if email already exists
      const emailQuery = query(
        subscriptionRef, 
        orderByChild('email'), 
        equalTo(email)
      );
      
      // Check if email already exists
      const snapshot = await get(emailQuery);
      if (snapshot.exists()) {
        throw new Error('Email already subscribed');
      }

      // Save new subscription
      const newSubscriptionRef = push(subscriptionRef);
      await set(newSubscriptionRef, {
        email,
        subscribedAt: new Date().toISOString(),
      });

      return { success: true, id: newSubscriptionRef.key };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  // Validate subscription data
  static validateSubscriptionData(email) {
    const errors = [];

    if (!email || email.trim() === '') {
      errors.push('Email is required');
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.push('Invalid email address');
    }

    return errors;
  }
}

module.exports = Subscription;