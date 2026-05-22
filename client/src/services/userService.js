import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const userService = {
  /**
   * Fetch the global user profile from Firestore.
   */
  async getUserProfile(uid) {
    if (!uid) return null;
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return null;
  },

  /**
   * Update or create a user profile in Firestore.
   */
  async updateUserProfile(uid, data) {
    if (!uid) return;
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, data, { merge: true });
  }
};
