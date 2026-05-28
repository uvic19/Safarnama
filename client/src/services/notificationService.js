import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';

export const notificationService = {
  /**
   * Creates in-app notifications for a set of target user IDs.
   *
   * @param {string[]} targetIds - UIDs to notify
   * @param {{ title: string, body: string, type: string, tripId?: string, expenseId?: string }} payload
   */
  async notify(targetIds, payload) {
    if (!targetIds?.length) return;
    const promises = targetIds.map((uid) =>
      addDoc(collection(db, 'users', uid, 'notifications'), {
        ...payload,
        is_read: false,
        created_at: serverTimestamp(),
      }),
    );
    await Promise.all(promises);
  },

  /**
   * Notifies all active members of a trip (optionally excluding a specific UID).
   * Uses a pre-fetched members array if provided, otherwise fetches from Firestore.
   *
   * @param {string} tripId
   * @param {{ title: string, body: string, type: string, expenseId?: string }} payload
   * @param {{ exclude?: string, members?: object[] }} options
   */
  async notifyTripMembers(tripId, payload, { exclude, members } = {}) {
    let memberList = members;
    if (!memberList) {
      const snap = await getDocs(collection(db, 'trips', tripId, 'members'));
      memberList = snap.docs.map((d) => d.data());
    }
    const targetIds = memberList
      .filter((m) => m.user_id && m.user_id !== exclude)
      .map((m) => m.user_id);

    return this.notify(targetIds, { ...payload, tripId });
  },
};
