const admin = require('firebase-admin');
const serviceaccount = require('../env/firebase_credentials.json');


admin.initializeApp({
  credential: admin.credential.cert(serviceaccount)
});

const fdb = admin.firestore();

class firebaseservice {

  async savelog(logdata) {
    try {

      await fdb.collection('parkinglog').add(logdata);
      console.log('registro analítico guardado en nosql exitosamente');
      return true;
    } catch (error) {
      console.error('error al guardar en firebase:', error);
      return false;
    }
  }
}

module.exports = new firebaseservice();