import { useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, arrayUnion, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';

// Initialize messaging once at module scope, matching the pattern used for auth/db.
// getMessaging() is idempotent, but calling it inside an effect on every user change is wasteful.
let messaging = null;
try {
  messaging = getMessaging();
} catch {
  // Messaging may not be supported in all environments (e.g. during SSR or older browsers)
  console.warn('[useFCM] Firebase Messaging not available in this environment.');
}

export function useFCM(user) {
  useEffect(() => {
    if (!user || !messaging) return;

    let unsubMessage = () => {};

    const setupFCM = async () => {
      try {
        if (Notification.permission === 'granted') {
          const currentToken = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
          });

          if (currentToken) {
            // Save token to user's Firestore document
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
              fcmTokens: arrayUnion(currentToken),
            }).catch(() => {
              // Ignore if document doesn't exist yet — it gets created on sign-up
            });
          } else {
            console.log('[useFCM] No registration token available. Request permission to generate one.');
          }

          // Listen to foreground messages and show a toast.
          // onMessage returns an unsubscribe function — store it for cleanup.
          unsubMessage = onMessage(messaging, (payload) => {
            toast(payload.notification?.title, {
              description: payload.notification?.body,
            });
          });
        }
      } catch (err) {
        console.error('[useFCM] Error during FCM setup:', err);
      }
    };

    setupFCM();

    // Clean up the foreground message listener when user changes or component unmounts
    return () => unsubMessage();
  }, [user]);
}
