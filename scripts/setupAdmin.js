
const { setAdminRole } = require('../config/firebaseConfig');

// Set admin@example.com as admin
setAdminRole('hikotekadmin@gmail.com')
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });