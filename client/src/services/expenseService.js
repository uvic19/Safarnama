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

export const expenseService = {
  /**
   * Add a new expense to a trip.
   * Auto-approved when: trip is SOLO, OR the user adding is the Kaptan.
   * All other cases go to PENDING for Kaptan approval.
   */
  async addExpense(tripId, expenseData, userId, tripMode, kaptanId) {
    const isAutoApproved = tripMode === 'SOLO' || userId === kaptanId;

    const payload = {
      amount: Number(expenseData.amount),
      category: expenseData.category || 'Misc',
      description: expenseData.description || '',
      paid_by_id: expenseData.paid_by_id || userId,
      paid_by_name: expenseData.paid_by_name || 'You',
      split_among: expenseData.split_among || [],
      payment_mode: expenseData.payment_mode || 'Cash',
      status: isAutoApproved ? 'APPROVED' : 'PENDING',
      created_by: userId,
      created_at: serverTimestamp(),
    };

    const expensesRef = collection(db, 'trips', tripId, 'expenses');
    const docRef = await addDoc(expensesRef, payload);
    return docRef.id;
  },

  /** Update an existing expense in a trip. */
  async updateExpense(tripId, expenseId, expenseData) {
    const payload = {
      amount: Number(expenseData.amount),
      category: expenseData.category || 'Misc',
      description: expenseData.description || '',
      paid_by_id: expenseData.paid_by_id,
      paid_by_name: expenseData.paid_by_name,
      split_among: expenseData.split_among || [],
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
      orderBy('created_at', 'desc')
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
  async approveExpense(tripId, expenseId) {
    const ref = doc(db, 'trips', tripId, 'expenses', expenseId);
    await updateDoc(ref, { status: 'APPROVED' });
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
