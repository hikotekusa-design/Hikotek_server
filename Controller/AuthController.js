// const AuthModel = require('../Model/AuthModel');

// class AuthController {
// static async loginAdmin(req, res) {
//   const { email, password } = req.body;
  
//   if (!email || !password) {
//     return res.status(400).json({ 
//       success: false, 
//       error: "Email and password are required" 
//     });
//   }

//   const result = await AuthModel.adminLogin(email, password);
  
//   if (result.success) {
//     res.json({ success: true, token: result.token });
//   } else {
//     res.status(401).json({ success: false, error: result.error });
//   }
// }
// }

// module.exports = AuthController;

const AuthModel = require('../Model/AuthModel');
const { ref, get } = require('firebase/database');
const { database } = require('../firebase');

class AuthController {
  static async login(req, res) {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: "Email and password are required" 
      });
    }

    const result = await AuthModel.login(email, password);
    
    if (result.success) {
      res.json({ success: true, token: result.token });
    } else {
      res.status(401).json({ success: false, error: result.error });
    }
  }

  static async register(req, res) {
    const { email, password, username } = req.body;
    
    if (!email || !password || !username) {
      return res.status(400).json({ 
        success: false, 
        error: "Email, password, and username are required" 
      });
    }

    const result = await AuthModel.register(email, password, username);
    
    if (result.success) {
      res.status(201).json({ success: true, message: "Admin registered successfully" });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  }

  static async getAdminProfile(req, res) {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    console.log('Received profile request with token:', idToken ? 'Token present' : 'No token');
    
    if (!idToken) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    try {
      const { success, decodedToken, error } = await AuthModel.verifyToken(idToken);
      console.log('Token verification result:', { success, uid: decodedToken?.uid, error });
      if (!success) {
        return res.status(401).json({ success: false, error: error || 'Invalid token' });
      }

      const isAdmin = await AuthModel.isAdmin(decodedToken.uid);
      console.log('Admin check for UID:', decodedToken.uid, 'Result:', isAdmin);
      if (!isAdmin) {
        return res.status(403).json({ success: false, error: 'Not an admin' });
      }

      const userRef = ref(database, `users/${decodedToken.uid}`);
      console.log('Fetching data from path:', `users/${decodedToken.uid}`);
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        console.log('No data found for UID:', decodedToken.uid);
        return res.status(404).json({ success: false, error: 'Admin data not found' });
      }

      const userData = snapshot.val();
      console.log('Retrieved user data:', userData);
      res.json({
        success: true,
        user: {
          uid: decodedToken.uid,
          email: userData.email || 'N/A',
          username: userData.username || 'N/A',
          createdAt: userData.createdAt || 'N/A',
          isAdmin: userData.isAdmin || false,
        },
      });
    } catch (error) {
      console.error('Error fetching admin profile:', error.message, error.stack);
      res.status(500).json({ success: false, error: `Failed to fetch admin profile: ${error.message}` });
    }
  }

  static async getAllAdmins(req, res) {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    console.log('Received get all admins request with token:', idToken ? 'Token present' : 'No token');
    
    if (!idToken) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    try {
      const { success, decodedToken, error } = await AuthModel.verifyToken(idToken);
      console.log('Token verification result:', { success, uid: decodedToken?.uid, error });
      if (!success) {
        return res.status(401).json({ success: false, error: error || 'Invalid token' });
      }

      const isAdmin = await AuthModel.isAdmin(decodedToken.uid);
      console.log('Admin check for UID:', decodedToken.uid, 'Result:', isAdmin);
      if (!isAdmin) {
        return res.status(403).json({ success: false, error: 'Not an admin' });
      }

      const result = await AuthModel.getAllAdmins();
      if (result.success) {
        res.json({ success: true, admins: result.admins });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error) {
      console.error('Error fetching all admins:', error.message, error.stack);
      res.status(500).json({ success: false, error: `Failed to fetch all admins: ${error.message}` });
    }
  }
  static async logout(req, res) {
    try {
      // Firebase Authentication is stateless, so no server-side session to invalidate
      console.log('Logout request received');
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error.message);
      res.status(500).json({ success: false, error: 'Failed to logout' });
    }
  }
}

module.exports = AuthController;