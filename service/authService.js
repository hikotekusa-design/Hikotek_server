const admin = require('firebase-admin');
const Admin = require('../Model/AuthModel');

class AuthService {
  static async loginAdmin(email, password) {
    // 1. Validate credentials in Firestore
    const adminUser = await Admin.findByEmail(email);
    if (!adminUser) {
      throw new Error('Invalid credentials');
    }

    // 2. Verify password
    const validPassword = await Admin.verifyPassword(password, adminUser.password);
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    // 3. Get Firebase user
    const user = await admin.auth().getUserByEmail(email);
    
    // 4. Verify admin claim
    if (!user.customClaims?.admin) {
      throw new Error('Admin privileges required');
    }

    // 5. Generate token
    const token = await admin.auth().createCustomToken(user.uid);
    
    return { token, uid: user.uid };
  }
}

module.exports = AuthService;