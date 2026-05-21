import { db } from '../lib/firebase';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';

export const settlementService = {
  async recordSettlement(tripId, payload, isAutoConfirmed = false) {
    const data = {
      ...payload,
      amount: Number(payload.amount),
      status: isAutoConfirmed ? 'CONFIRMED' : 'PENDING',
      created_at: serverTimestamp(),
      confirmed_at: isAutoConfirmed ? serverTimestamp() : null,
    };

    const ref = collection(db, 'trips', tripId, 'settlements');
    const docRef = await addDoc(ref, data);
    return docRef.id;
  },

  /**
   * Listen to all settlements for a trip.
   */
  subscribeToSettlements(tripId, callback) {
    const q = query(
      collection(db, 'trips', tripId, 'settlements'),
      orderBy('created_at', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const settlements = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(settlements);
    });
  },

  /** Confirm a pending settlement (changes status to CONFIRMED). */
  async confirmSettlement(tripId, settlementId) {
    const ref = doc(db, 'trips', tripId, 'settlements', settlementId);
    await updateDoc(ref, { 
      status: 'CONFIRMED',
      confirmed_at: serverTimestamp() 
    });
  },

  /** Reject or cancel a settlement. */
  async deleteSettlement(tripId, settlementId) {
    const ref = doc(db, 'trips', tripId, 'settlements', settlementId);
    await deleteDoc(ref);
  },

  /** 
   * Update a member's UPI ID within the trip context.
   * Modifies the trip's member document.
   */
  async updateMemberUPI(tripId, memberId, upiId) {
    const ref = doc(db, 'trips', tripId, 'members', memberId);
    await updateDoc(ref, { upi_id: upiId });
  }
};
