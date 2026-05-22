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

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

export const expenseService = {
  /**
   * Add a new expense to a trip.
   * Auto-approved when: trip is SOLO, OR the user adding is the Kaptan.
   * All other cases go to PENDING for Kaptan approval.
   */
  async addExpense(tripId, expenseData, userId, tripMode, kaptanId, baseCurrency = 'INR') {
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
      payment_mode: expenseData.payment_mode || 'Cash',
      status: isAutoApproved ? 'APPROVED' : 'PENDING',
      created_by: userId,
      created_at: serverTimestamp(),
    };

    const expensesRef = collection(db, 'trips', tripId, 'expenses');
    const docRef = await addDoc(expensesRef, payload);
    
    try {
      const snap = await getDocs(collection(db, 'trips', tripId, 'members'));
      const members = snap.docs.map(d => d.data());
      
      let targetIds = [];
      if (userId === kaptanId) {
        // Kaptan added it -> Notify all other active members
        targetIds = members.filter(m => m.user_id && m.user_id !== userId).map(m => m.user_id);
      } else {
        // Member added it -> Notify Kaptan
        targetIds = [kaptanId];
      }

      const notifyTitle = userId === kaptanId ? 'New Expense Added' : 'Approval Needed';
      const notifyBody = `${expenseData.paid_by_name || 'A member'} added ${payload.currency} ${payload.amount} for ${payload.description}`;

      const notificationsPromises = targetIds.map(targetId => {
        return addDoc(collection(db, 'users', targetId, 'notifications'), {
          title: notifyTitle,
          body: notifyBody,
          type: userId === kaptanId ? 'EXPENSE_ADDED' : 'EXPENSE_APPROVAL',
          tripId,
          expenseId: docRef.id,
          is_read: false,
          created_at: serverTimestamp()
        });
      });
      await Promise.all(notificationsPromises);
    } catch (error) {
      console.error('Failed to create in-app notifications:', error);
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
  async approveExpense(tripId, expenseId, approverName = 'Kaptaan') {
    const ref = doc(db, 'trips', tripId, 'expenses', expenseId);
    await updateDoc(ref, { status: 'APPROVED' });
    
    try {
      // Fetch expense details to show in notification
      const { getDoc } = await import('firebase/firestore'); // ensure getDoc is available if not imported at top
      const expSnap = await getDoc(ref);
      if (!expSnap.exists()) return;
      const expData = expSnap.data();

      // Fetch members
      const membersSnap = await getDocs(collection(db, 'trips', tripId, 'members'));
      const members = membersSnap.docs.map(d => d.data());
      
      // Notify everyone except the approver (kaptan)
      const targetIds = members.filter(m => m.user_id && m.user_id !== expData.created_by).map(m => m.user_id);
      
      // Wait, let's notify the person who created it if they aren't the approver.
      // Actually, notify everyone who has a user_id except the approver.
      // But we don't have kaptanId here, so we assume approver is the one calling it.
      // But typically we can just notify the `created_by` user. Let's notify everyone in the trip.
      
      const promises = members
        .filter(m => m.user_id) // only real users
        .map(m => {
          return addDoc(collection(db, 'users', m.user_id, 'notifications'), {
            title: `Expense Approved`,
            body: `${approverName} approved the ${expData.currency} ${expData.amount} expense for ${expData.description}.`,
            type: 'EXPENSE_APPROVED',
            tripId,
            expenseId,
            is_read: false,
            created_at: serverTimestamp()
          });
        });
      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to create approval notifications:', error);
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
