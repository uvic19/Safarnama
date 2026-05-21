import { db } from '../lib/firebase';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export const tripService = {
  async createTrip(tripData, userId) {
    try {
      // Ensure specific fields are present as per PRD
      const payload = {
        name: tripData.name || 'Untitled Trip',
        destinations: tripData.destinations || [],
        start_date: tripData.start_date || null,
        end_date: tripData.end_date || null,
        mode: tripData.mode || 'SOLO',
        base_currency: tripData.base_currency || 'INR',
        total_budget: tripData.total_budget ? Number(tripData.total_budget) : null,
        budget_limits: tripData.budget_limits || {},
        kaptan_id: userId,
        // member_ids stores all member uids as a flat array for dashboard queries.
        // Firestore collection queries can only filter on document fields, not subcollections.
        member_ids: [userId],
        status: 'PLANNING',
        itinerary_locked: false,
        is_template: false,
        created_at: serverTimestamp(),
      };

      if (tripData.mode === 'GROUP_FULL') {
        // Generate a random 6 char invite code
        payload.invite_code = Math.random().toString(36).substring(2, 8).toUpperCase();
      }

      // Create trip document
      const tripsRef = collection(db, 'trips');
      const docRef = await addDoc(tripsRef, payload);

      // Add creator as KAPTAN in members subcollection
      const memberRef = doc(db, 'trips', docRef.id, 'members', userId);
      await setDoc(memberRef, {
        user_id: userId,
        role: 'KAPTAN',
        joined_at: serverTimestamp(),
        is_active: true
      });

      // Add offline members if mode is KAPTAN_ONLY
      if (tripData.mode === 'GROUP_KAPTAN_ONLY' && tripData.offline_members) {
        const membersRef = collection(db, 'trips', docRef.id, 'members');
        for (const name of tripData.offline_members) {
          if (name.trim()) {
            await addDoc(membersRef, {
              user_id: null,
              offline_name: name.trim(),
              role: 'MEMBER',
              joined_at: serverTimestamp(),
              is_active: true
            });
          }
        }
      }

      return docRef.id;
    } catch (error) {
      console.error('Error creating trip:', error);
      throw error;
    }
  }
};
