const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function clearTokens() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  
  let count = 0;
  for (const doc of snapshot.docs) {
    if (doc.data().fcmTokens) {
      await doc.ref.update({ fcmTokens: [] });
      count++;
    }
  }
  console.log(`Cleared tokens for ${count} users!`);
  process.exit(0);
}

clearTokens();
