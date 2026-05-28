import { db } from '../lib/firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';

export const userNotificationService = {
  /**
   * Fetch recent notifications for a user (one-time read, newest first).
   *
   * @param {string} userId
   * @param {number} [maxItems=50]
   * @returns {Promise<Array>}
   */
  async getNotifications(userId, maxItems = 50) {
    const q = query(
      collection(db, 'users', userId, 'notifications'),
      orderBy('created_at', 'desc'),
      limit(maxItems),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  /** Mark a single notification as read. */
  async markAsRead(userId, notificationId) {
    await updateDoc(doc(db, 'users', userId, 'notifications', notificationId), {
      is_read: true,
    });
  },

  /** Mark all provided notifications as read in parallel. */
  async markAllAsRead(userId, notificationIds) {
    if (!notificationIds?.length) return;
    await Promise.all(
      notificationIds.map((id) => this.markAsRead(userId, id)),
    );
  },
};
