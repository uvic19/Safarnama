import { db } from '../lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { notificationService } from './notificationService';

export const expenseService = {
  /**
   * Add a new expense to a trip.
   * Auto-approved when: trip is SOLO, OR the user adding is the Kaptan.
   * All other cases go to PENDING for Kaptan approval.
   *
   * @param {string} tripId
   * @param {object} expenseData
   * @param {{ userId: string, tripMode: string, kaptanId: string, baseCurrency?: string }} context
   */
  async addExpense(tripId, expenseData, { userId, tripMode, kaptanId, baseCurrency = 'INR' }) {
    const isAutoApproved = tripMode === 'SOLO' || userId === kaptanId;

    const payload = {
      amount: Number(expenseData.amount),
      currency: expenseData.currency || baseCurrency,
      amount_in_base: Number(expenseData.amount_in_base || expenseData.amount),
      exchange_rate: Number(expenseData.exchange_rate || 1),
      category: expenseData.category || 'Misc',
      description: expenseData.description || '',
      paid_by_id: expenseData.paid_by_id || userId,
      paid_by_name: expenseData.paid_by_name || 'You',
      split_among: expenseData.split_among || [],
      split_mode: expenseData.split_mode || 'EQUAL',
      split_details: expenseData.split_details || {},
      payment_mode: expenseData.payment_mode || 'Cash',
      status: isAutoApproved ? 'APPROVED' : 'PENDING',
      created_by: userId,
      created_at: serverTimestamp(),
    };

    const expensesRef = collection(db, 'trips', tripId, 'expenses');
    const docRef = await addDoc(expensesRef, payload);

    // Send in-app notifications (non-blocking; failure doesn't affect expense creation)
    try {
      const snap = await getDocs(collection(db, 'trips', tripId, 'members'));
      const members = snap.docs.map((d) => d.data());

      const notifyTitle = userId === kaptanId ? 'New Expense Added' : 'Approval Needed';
      const notifyBody = `${expenseData.paid_by_name || 'A member'} added ${payload.currency} ${payload.amount} for ${payload.description}`;
      const type = userId === kaptanId ? 'EXPENSE_ADDED' : 'EXPENSE_APPROVAL';

      let targetIds;
      if (userId === kaptanId) {
        // Kaptan added it → notify all other active members
        targetIds = members.filter((m) => m.user_id && m.user_id !== userId).map((m) => m.user_id);
      } else {
        // Member added it → notify Kaptan
        targetIds = [kaptanId];
      }

      await notificationService.notify(targetIds, {
        title: notifyTitle,
        body: notifyBody,
        type,
        tripId,
        expenseId: docRef.id,
      });
    } catch (error) {
      console.error('[expenseService] Failed to create in-app notifications:', error);
    }

    return docRef.id;
  },

  /** Update an existing expense in a trip. */
  async updateExpense(tripId, expenseId, expenseData, baseCurrency = 'INR') {
    const payload = {
      amount: Number(expenseData.amount),
      currency: expenseData.currency || baseCurrency,
      amount_in_base: Number(expenseData.amount_in_base || expenseData.amount),
      exchange_rate: Number(expenseData.exchange_rate || 1),
      category: expenseData.category || 'Misc',
      description: expenseData.description || '',
      paid_by_id: expenseData.paid_by_id,
      paid_by_name: expenseData.paid_by_name,
      split_among: expenseData.split_among || [],
      split_mode: expenseData.split_mode || 'EQUAL',
      split_details: expenseData.split_details || {},
      payment_mode: expenseData.payment_mode || 'Cash',
    };

    if (expenseData.created_at) {
      payload.created_at = expenseData.created_at;
    }

    const ref = doc(db, 'trips', tripId, 'expenses', expenseId);
    await updateDoc(ref, payload);
  },

  /**
   * Real-time listener for all expenses in a trip (newest first).
   * Returns unsubscribe function.
   */
  subscribeToExpenses(tripId, callback) {
    const q = query(
      collection(db, 'trips', tripId, 'expenses'),
      orderBy('created_at', 'desc'),
    );
    return onSnapshot(q, (snap) => {
      const expenses = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(expenses);
    });
  },

  /**
   * Get all members of a trip from the members subcollection.
   * Returns both online (user_id) and offline (offline_name) members.
   */
  async getMembers(tripId) {
    const snap = await getDocs(collection(db, 'trips', tripId, 'members'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  /** Approve a pending expense. */
  async approveExpense(tripId, expenseId, approverName = 'Kaptaan') {
    const ref = doc(db, 'trips', tripId, 'expenses', expenseId);
    await updateDoc(ref, { status: 'APPROVED' });

    // Notify all real members (non-blocking)
    try {
      const { getDoc } = await import('firebase/firestore');
      const expSnap = await getDoc(ref);
      if (!expSnap.exists()) return;
      const expData = expSnap.data();

      await notificationService.notifyTripMembers(tripId, {
        title: 'Expense Approved',
        body: `${approverName} approved the ${expData.currency} ${expData.amount} expense for ${expData.description}.`,
        type: 'EXPENSE_APPROVED',
        expenseId,
      });
    } catch (error) {
      console.error('[expenseService] Failed to create approval notifications:', error);
    }
  },

  /** Reject a pending expense with a reason. */
  async rejectExpense(tripId, expenseId, reason = '') {
    const ref = doc(db, 'trips', tripId, 'expenses', expenseId);
    await updateDoc(ref, { status: 'REJECTED', rejection_reason: reason });
  },

  /** Delete an expense permanently. */
  async deleteExpense(tripId, expenseId) {
    const ref = doc(db, 'trips', tripId, 'expenses', expenseId);
    await deleteDoc(ref);
  },
};
