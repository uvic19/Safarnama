import { db } from '../lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';

export const planService = {
  /**
   * Real-time listener for all plans in a trip (newest first).
   * Returns unsubscribe function.
   */
  subscribeToPlans(tripId, callback) {
    const q = query(
      collection(db, 'trips', tripId, 'plans'),
      orderBy('created_at', 'desc'),
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  },

  /** Add a new voting plan suggestion. */
  async addPlan(tripId, { title, description, estimatedCost, userId }) {
    await addDoc(collection(db, 'trips', tripId, 'plans'), {
      title,
      description,
      estimated_cost: estimatedCost ? Number(estimatedCost) : null,
      created_by: userId,
      created_at: serverTimestamp(),
      voter_ids: [userId], // Creator auto-votes
      is_winner: false,
    });
  },

  /** Toggle a vote (add or remove the user's uid from voter_ids). */
  async toggleVote(tripId, planId, userId, isVoting) {
    const planRef = doc(db, 'trips', tripId, 'plans', planId);
    await updateDoc(planRef, {
      voter_ids: isVoting ? arrayUnion(userId) : arrayRemove(userId),
    });
  },

  /**
   * Mark a single plan as the winner and unset all others.
   *
   * @param {string} tripId
   * @param {string} winnerPlanId
   * @param {string[]} allPlanIds - IDs of all plans so we can reset them atomically
   */
  async selectWinner(tripId, winnerPlanId, allPlanIds) {
    const promises = allPlanIds.map((planId) =>
      updateDoc(doc(db, 'trips', tripId, 'plans', planId), {
        is_winner: planId === winnerPlanId,
      }),
    );
    await Promise.all(promises);
  },
};
