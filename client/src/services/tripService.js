import { db } from '../lib/firebase';
import { arrayUnion, collection, addDoc, doc, getDocs, limit, query, setDoc, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { userService } from './userService';
import { notificationService } from './notificationService';

export const tripService = {
  async createTrip(tripData, userId) {
    try {
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
      const userProfile = await userService.getUserProfile(userId);
      const memberRef = doc(db, 'trips', docRef.id, 'members', userId);
      await setDoc(memberRef, {
        user_id: userId,
        role: 'KAPTAN',
        joined_at: serverTimestamp(),
        is_active: true,
        upi_id: userProfile?.upi_id || null,
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
              is_active: true,
            });
          }
        }
      }

      // Add template itinerary if provided
      if (tripData.template_itinerary && Array.isArray(tripData.template_itinerary)) {
        const itineraryRef = collection(db, 'trips', docRef.id, 'itinerary');
        const startDate = tripData.start_date ? new Date(tripData.start_date) : new Date();

        for (let i = 0; i < tripData.template_itinerary.length; i++) {
          const item = tripData.template_itinerary[i];
          const itemDate = new Date(startDate);
          itemDate.setDate(itemDate.getDate() + (item.day_offset || 0));

          await addDoc(itineraryRef, {
            place_name: item.place_name || '',
            stop_type: item.stop_type || 'TOURIST',
            lat: item.lat || null,
            lng: item.lng || null,
            notes: item.notes || null,
            date: itemDate,
            order_index: i,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
          });
        }
      }

      return docRef.id;
    } catch (error) {
      console.error('[tripService] Error creating trip:', error);
      throw error;
    }
  },

  async updateTrip(tripId, updates, currentTripData = null) {
    try {
      const docRef = doc(db, 'trips', tripId);
      const payload = { ...updates, updated_at: serverTimestamp() };

      if (payload.destinations && typeof payload.destinations === 'string') {
        payload.destinations = payload.destinations.split(',').map((d) => d.trim()).filter(Boolean);
      }
      if (payload.total_budget !== undefined) {
        payload.total_budget = payload.total_budget ? Number(payload.total_budget) : null;
      }

      // If switching to GROUP_FULL and no invite code exists, generate one
      if (payload.mode === 'GROUP_FULL' && (!currentTripData || !currentTripData.invite_code)) {
        payload.invite_code = Math.random().toString(36).substring(2, 8).toUpperCase();
      }

      await updateDoc(docRef, payload);
    } catch (error) {
      console.error('[tripService] Error updating trip:', error);
      throw error;
    }
  },

  async deleteTrip(tripId) {
    try {
      // Deleting the parent doc removes it from all UI queries.
      // Subcollection cleanup should be handled by a Cloud Function in future.
      const docRef = doc(db, 'trips', tripId);
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(docRef);
    } catch (error) {
      console.error('[tripService] Error deleting trip:', error);
      throw error;
    }
  },

  async joinTripByInviteCode(inviteCode, user) {
    const code = inviteCode.trim().toUpperCase();
    if (!code) throw new Error('Invite code is required');

    const tripsQuery = query(
      collection(db, 'trips'),
      where('invite_code', '==', code),
      where('mode', '==', 'GROUP_FULL'),
      limit(1),
    );
    const snap = await getDocs(tripsQuery);

    if (snap.empty) {
      throw new Error('No trip found for this invite code');
    }

    const tripDoc = snap.docs[0];
    const trip = { id: tripDoc.id, ...tripDoc.data() };

    if (trip.member_ids?.includes(user.uid)) {
      return tripDoc.id;
    }

    await updateDoc(doc(db, 'trips', tripDoc.id), {
      member_ids: arrayUnion(user.uid),
    });

    const userProfile = await userService.getUserProfile(user.uid);
    await setDoc(doc(db, 'trips', tripDoc.id, 'members', user.uid), {
      user_id: user.uid,
      display_name: user.displayName || user.email || 'Member',
      email: user.email || null,
      role: 'MEMBER',
      joined_at: serverTimestamp(),
      is_active: true,
      upi_id: userProfile?.upi_id || null,
    });

    // Notify existing members (non-blocking)
    try {
      const existingMemberIds = (trip.member_ids || []).filter((id) => id !== user.uid);
      await notificationService.notify(existingMemberIds, {
        title: `New Member in ${trip.name}`,
        body: `${user.displayName || user.email || 'A new member'} has joined the trip!`,
        type: 'MEMBER_JOINED',
        tripId: tripDoc.id,
      });
    } catch (error) {
      console.error('[tripService] Failed to create member joined notification:', error);
    }

    return tripDoc.id;
  },

  async removeMember(tripId, memberId, userIdToRemove) {
    try {
      const { deleteDoc, arrayRemove } = await import('firebase/firestore');
      const memberRef = doc(db, 'trips', tripId, 'members', memberId);
      await deleteDoc(memberRef);

      if (userIdToRemove) {
        const tripRef = doc(db, 'trips', tripId);
        await updateDoc(tripRef, {
          member_ids: arrayRemove(userIdToRemove),
        });
      }
    } catch (error) {
      console.error('[tripService] Error removing member:', error);
      throw error;
    }
  },

  /**
   * Remove the current user from a trip.
   * Delegates directly to removeMember — the outer try/catch was a misleading double-catch.
   */
  leaveTrip(tripId, userId) {
    return this.removeMember(tripId, userId, userId);
  },

  async updateOfflineMemberName(tripId, memberId, newName) {
    try {
      if (!newName.trim()) throw new Error('Name cannot be empty');
      const memberRef = doc(db, 'trips', tripId, 'members', memberId);
      await updateDoc(memberRef, { offline_name: newName.trim() });
    } catch (error) {
      console.error('[tripService] Error updating member name:', error);
      throw error;
    }
  },

  async addOfflineMember(tripId, name) {
    try {
      if (!name.trim()) throw new Error('Name cannot be empty');
      const membersRef = collection(db, 'trips', tripId, 'members');
      await addDoc(membersRef, {
        user_id: null,
        offline_name: name.trim(),
        role: 'MEMBER',
        joined_at: serverTimestamp(),
        is_active: true,
      });
    } catch (error) {
      console.error('[tripService] Error adding offline member:', error);
      throw error;
    }
  },
};
