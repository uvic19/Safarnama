importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCmG319oBTmtjSvFBa6ocuuoA0TpIFIec0",
  authDomain: "kridleapps-9f92f.firebaseapp.com",
  projectId: "kridleapps-9f92f",
  storageBucket: "kridleapps-9f92f.firebasestorage.app",
  messagingSenderId: "404579931070",
  appId: "1:404579931070:web:c7ed76ee261b759a4f9fef"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body,
    icon: '/icons/icon-192.png',
    data: payload.data,
  };

  if (payload.fcmOptions?.link) {
    notificationOptions.data = { ...notificationOptions.data, link: payload.fcmOptions.link };
  }

  // If there are actions in the webpush block, unfortunately the Firebase compat SDK
  // doesn't always expose webpush actions inside the payload object here.
  if (payload.data?.actions) {
    try {
      notificationOptions.actions = JSON.parse(payload.data.actions);
    } catch(e) {}
  }

  // Let's explicitly show it:
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Intercept notification clicks for our Actions (Approve/Decline)
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification click Received.', event);

  event.notification.close(); // Close the notification

  // The payload data is stored in event.notification.data
  const data = event.notification.data || {};
  const { tripId, expenseId, kaptanId } = data;

  if (event.action === 'approve' || event.action === 'decline') {
    // Send a silent request to our Render Node.js backend
    // Since we are running locally for now, use local IP. In prod, this will be your render URL.
    const SERVER_URL = 'http://10.163.47.219:3000'; 
    
    event.waitUntil(
      fetch(`${SERVER_URL}/api/action/expense`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tripId,
          expenseId,
          kaptanId,
          action: event.action
        })
      })
      .then(res => res.json())
      .then(resData => {
         console.log('Action processed successfully:', resData);
         // Optionally, trigger another local notification to confirm it worked?
      })
      .catch(err => {
         console.error('Error processing action:', err);
      })
    );
  } else {
    // Regular click (on the body of the notification, not a button)
    // Open the app or focus it
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
        let urlToOpen = '/';
        if (tripId) urlToOpen = `/trips/${tripId}`;
        
        // Check if there is already a window/tab open with the target URL
        for (var i = 0; i < windowClients.length; i++) {
          var client = windowClients[i];
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});
