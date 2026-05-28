import { db } from '../lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

export const suggestionService = {
  /**
   * Real-time listener for all suggestions in a trip (newest first).
   * Returns unsubscribe function.
   */
  subscribeToSuggestions(tripId, callback) {
    const q = query(
      collection(db, 'trips', tripId, 'suggestions'),
      orderBy('created_at', 'desc'),
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  },

  /** Add a new suggestion to a trip. */
  async addSuggestion(tripId, { placeName, lat, lng, userId, userName }) {
    await addDoc(collection(db, 'trips', tripId, 'suggestions'), {
      place_name: placeName,
      lat: lat || null,
      lng: lng || null,
      created_by: userId,
      created_by_name: userName || 'Traveler',
      created_at: serverTimestamp(),
    });
  },
};
