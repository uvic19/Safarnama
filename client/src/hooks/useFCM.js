import { useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, arrayUnion, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';

export function useFCM(user) {
  useEffect(() => {
    if (!user) return;

    const setupFCM = async () => {
      try {
        if (Notification.permission === 'granted') {
          const messaging = getMessaging();
          const currentToken = await getToken(messaging, { 
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY 
          });

          if (currentToken) {
            // Save token to user's Firestore document
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
              fcmTokens: arrayUnion(currentToken)
            }).catch(() => {
               // Ignore if document doesn't exist yet, it usually gets created on sign-up
            });
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }

          // Listen to foreground messages (optional, you can just show a toast if they are actively in the app)
          onMessage(messaging, (payload) => {
            console.log('Message received in foreground: ', payload);
            toast(payload.notification.title, {
              description: payload.notification.body,
              // Optionally we could add action buttons here in the foreground toast too, but for now simple toast
            });
          });
        }
      } catch (err) {
        console.error('An error occurred while retrieving token. ', err);
      }
    };

    setupFCM();
  }, [user]);
}
