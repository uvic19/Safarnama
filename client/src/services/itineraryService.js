import { db } from '../lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

export const itineraryService = {
  /**
   * Real-time listener for all itinerary stops in a trip (ordered by order_index).
   * Returns unsubscribe function.
   */
  subscribeToStops(tripId, callback, onError) {
    const q = query(
      collection(db, 'trips', tripId, 'itinerary'),
      orderBy('order_index', 'asc'),
    );
    return onSnapshot(
      q,
      (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      onError,
    );
  },

  /** Add a new itinerary stop. */
  async addStop(tripId, payload) {
    await addDoc(collection(db, 'trips', tripId, 'itinerary'), {
      ...payload,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  },

  /** Update an existing itinerary stop. */
  async updateStop(tripId, stopId, payload) {
    await updateDoc(doc(db, 'trips', tripId, 'itinerary', stopId), {
      ...payload,
      updated_at: serverTimestamp(),
    });
  },

  /** Delete an itinerary stop. */
  async deleteStop(tripId, stopId) {
    await deleteDoc(doc(db, 'trips', tripId, 'itinerary', stopId));
  },

  /** Toggle the locked state of the itinerary. */
  async setLocked(tripId, locked) {
    await updateDoc(doc(db, 'trips', tripId), { itinerary_locked: locked });
  },
};
