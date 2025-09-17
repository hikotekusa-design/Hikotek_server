// const admin = require('firebase-admin');
// const { auth } = require('../firebase');
// const { signInWithEmailAndPassword } = require('firebase/auth');


// class AuthModel {
//   static async verifyToken(idToken) {
//     try {
//       const decodedToken = await admin.auth().verifyIdToken(idToken);
//       return { success: true, decodedToken };
//     } catch (error) {
//       return { success: false, error: error.message };
//     }
//   }

//   static async isAdmin(uid) {
//     try {
//       const user = await admin.auth().getUser(uid);
//       return user.customClaims && user.customClaims.admin === true;
//     } catch (error) {
//       return false;
//     }
//   }

//  static async adminLogin(email, password) {
//   try {
//     const userCredential = await signInWithEmailAndPassword(auth, email, password);
//     console.log("Firebase auth success!"); // Debug log
    
//     const token = await userCredential.user.getIdToken();
//     const isAdmin = await this.isAdmin(userCredential.user.uid);
    
//     if (!isAdmin) {
//       console.log("❌ User is not an admin"); // Debug log
//       await auth.signOut();
//       return { success: false, error: "Not an admin user" };
//     }
    
//     return { success: true, token };
//   } catch (error) {
//     console.error("🔥 Firebase Error:", error.message); // Debug log
//     return { success: false, error: error.message };
//   }
// }
// }

// module.exports = AuthModel;

const admin = require('firebase-admin');
const { auth } = require('../firebase');
const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
const { ref, set, get } = require('firebase/database');
const { database } = require('../firebase');

class AuthModel {
  static async verifyToken(idToken) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return { success: true, decodedToken };
    } catch (error) {
      console.error('Token verification error:', error.message);
      return { success: false, error: error.message };
    }
  }

  static async isAdmin(uid) {
    try {
      const user = await admin.auth().getUser(uid);
      console.log('Checking admin status for UID:', uid, 'Custom claims:', user.customClaims);
      return user.customClaims && user.customClaims.admin === true;
    } catch (error) {
      console.error('isAdmin error:', error.message);
      return false;
    }
  }

  static async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase auth success for email:', email);
      
      const token = await userCredential.user.getIdToken();
      const isAdmin = await this.isAdmin(userCredential.user.uid);
      
      if (!isAdmin) {
        console.log('❌ User is not an admin for UID:', userCredential.user.uid);
        await auth.signOut();
        return { success: false, error: 'Not an admin user' };
      }
      
      return { success: true, token };
    } catch (error) {
      console.error('🔥 Firebase login error:', error.message);
      return { success: false, error: error.message };
    }
  }

  static async register(email, password, username) {
    try {
      console.log('Starting registration for email:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User created with UID:', user.uid);
      
      // Set admin custom claim
      await admin.auth().setCustomUserClaims(user.uid, { admin: true });
      console.log('Admin custom claim set for UID:', user.uid);
      
      // Store user data in Realtime Database
      const userRef = ref(database, `users/${user.uid}`);
      const userData = {
        username: username,
        email: email,
        createdAt: new Date().toISOString(),
        isAdmin: true,
      };
      await set(userRef, userData);
      console.log('User data saved to database:', userData);
      
      console.log('Admin registered successfully for UID:', user.uid);
      return { success: true, uid: user.uid };
    } catch (error) {
      console.error('Admin registration error:', error.message, error.stack);
      return { success: false, error: error.message };
    }
  }

  static async getAllAdmins() {
    try {
      console.log('Fetching all admins');
      // Fetch all users from Firebase Authentication
      const listUsersResult = await admin.auth().listUsers();
      const adminUids = [];
      
      // Filter users with admin custom claim
      for (const user of listUsersResult.users) {
        const isAdmin = await this.isAdmin(user.uid);
        if (isAdmin) {
          adminUids.push(user.uid);
        }
      }
      console.log('Admin UIDs found:', adminUids);

      // Fetch user data from Realtime Database
      const adminsData = [];
      for (const uid of adminUids) {
        const userRef = ref(database, `users/${uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          adminsData.push({
            uid,
            email: userData.email || 'N/A',
            username: userData.username || 'N/A',
          });
        } else {
          console.log(`No database data for admin UID: ${uid}`);
        }
      }
      
      console.log('Fetched admins data:', adminsData);
      return { success: true, admins: adminsData };
    } catch (error) {
      console.error('Error fetching all admins:', error.message, error.stack);
      return { success: false, error: error.message };
    }
  }
}

module.exports = AuthModel;