const admin = require('firebase-admin');

const serviceAccount = require('../keys/fire-base.service');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});