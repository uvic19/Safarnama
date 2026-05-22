require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const messaging = admin.messaging();

const app = express();
app.use(cors());
app.use(express.json());

// Helper to get tokens for a user or list of users
async function getTokensForUsers(userIds) {
  const tokens = [];
  const chunkSize = 10;
  for (let i = 0; i < userIds.length; i += chunkSize) {
    const chunk = userIds.slice(i, i + chunkSize);
    const snaps = await db.collection('users').where(admin.firestore.FieldPath.documentId(), 'in', chunk).get();
    snaps.forEach(doc => {
      const data = doc.data();
      if (data.fcmTokens && Array.isArray(data.fcmTokens)) {
        tokens.push(...data.fcmTokens);
      }
    });
  }
  return [...new Set(tokens)]; // unique tokens
}

// 1. Notify Expense Added
app.post('/api/notify/expense-added', async (req, res) => {
  console.log(`\n--- Received POST /api/notify/expense-added ---`);
  try {
    const { tripId, expenseId, addedById, amount, currency, description, addedByName } = req.body;
    
    // Fetch trip
    const tripSnap = await db.collection('trips').doc(tripId).get();
    if (!tripSnap.exists) return res.status(404).json({ error: 'Trip not found' });
    const trip = tripSnap.data();

    // Fetch members
    const membersSnap = await db.collection('trips').doc(tripId).collection('members').get();
    const memberIds = membersSnap.docs.map(d => d.id);

    let targetIds = [];
    let payload = {};

    if (addedById === trip.kaptan_id) {
      // Kaptan added it -> Notify all other members
      targetIds = memberIds.filter(id => id !== addedById);
      payload = {
        notification: {
          title: `New Expense in ${trip.name}`,
          body: `${addedByName} added an expense: ${currency} ${amount} for ${description}`
        },
        data: {
          type: 'EXPENSE_ADDED',
          tripId,
          expenseId
        }
      };
    } else {
      // Member added it -> Notify Kaptan for approval with Actions
      targetIds = [trip.kaptan_id];
      payload = {
        notification: {
          title: `Approval Needed: ${trip.name}`,
          body: `${addedByName} logged ${currency} ${amount} for ${description}`
        },
        data: {
          type: 'EXPENSE_APPROVAL',
          tripId,
          expenseId,
          kaptanId: trip.kaptan_id,
          // Stringify actions because FCM data only accepts strings
          actions: JSON.stringify([
            { action: 'approve', title: 'Approve' },
            { action: 'decline', title: 'Decline' }
          ])
        },
        webpush: {
          notification: {
            title: `Approval Needed: ${trip.name}`,
            body: `${addedByName} logged ${currency} ${amount} for ${description}`,
            actions: [
              { action: 'approve', title: 'Approve' },
              { action: 'decline', title: 'Decline' }
            ]
          }
        }
      };
    }

    if (targetIds.length > 0) {
      console.log(`Looking up tokens for ${targetIds.length} users...`);
      const tokens = await getTokensForUsers(targetIds);
      console.log(`Found ${tokens.length} tokens. Sending notifications...`);
      if (tokens.length > 0) {
        const response = await messaging.sendEachForMulticast({ tokens, ...payload });
        console.log(`Successfully sent ${response.successCount} messages. Failed: ${response.failureCount}`);
        if (response.failureCount > 0) {
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              console.error(`Token ${idx} failed:`, resp.error);
            }
          });
        }
      } else {
        console.log('No tokens found for these users.');
      }
    } else {
      console.log('No target users to notify.');
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error in expense-added:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Notify Expense Approved
app.post('/api/notify/expense-approved', async (req, res) => {
  try {
    const { tripId, expenseId, approverName } = req.body;
    
    const expenseSnap = await db.collection('trips').doc(tripId).collection('expenses').doc(expenseId).get();
    const tripSnap = await db.collection('trips').doc(tripId).get();
    
    if (!expenseSnap.exists || !tripSnap.exists) return res.json({ success: false });
    
    const expense = expenseSnap.data();
    const trip = tripSnap.data();
    
    const membersSnap = await db.collection('trips').doc(tripId).collection('members').get();
    // Notify everyone except the kaptan (approver)
    const targetIds = membersSnap.docs.map(d => d.id).filter(id => id !== trip.kaptan_id);
    
    if (targetIds.length > 0) {
      const tokens = await getTokensForUsers(targetIds);
      if (tokens.length > 0) {
        await messaging.sendEachForMulticast({
          tokens,
          notification: {
            title: `Expense Approved in ${trip.name}`,
            body: `${approverName} approved the ${expense.currency} ${expense.amount} expense for ${expense.description}.`
          },
          data: { type: 'EXPENSE_APPROVED', tripId, expenseId }
        });
      }
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error in expense-approved:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Notify Member Joined
app.post('/api/notify/member-joined', async (req, res) => {
  try {
    const { tripId, newMemberId, newMemberName } = req.body;
    
    const tripSnap = await db.collection('trips').doc(tripId).get();
    if (!tripSnap.exists) return res.json({ success: false });
    const trip = tripSnap.data();

    const membersSnap = await db.collection('trips').doc(tripId).collection('members').get();
    // Notify everyone currently in the trip except the new guy
    const targetIds = membersSnap.docs.map(d => d.id).filter(id => id !== newMemberId);
    
    if (targetIds.length > 0) {
      const tokens = await getTokensForUsers(targetIds);
      if (tokens.length > 0) {
        await messaging.sendEachForMulticast({
          tokens,
          notification: {
            title: `New Member in ${trip.name}`,
            body: `${newMemberName} has joined the trip!`
          },
          data: { type: 'MEMBER_JOINED', tripId }
        });
      }
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error in member-joined:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Notify Settlement
app.post('/api/notify/settlement', async (req, res) => {
  try {
    const { tripId, fromId, fromName, toId, toName, amount, currency } = req.body;
    
    const tokens = await getTokensForUsers([fromId, toId]);
    if (tokens.length > 0) {
      await messaging.sendEachForMulticast({
        tokens,
        notification: {
          title: `Settlement Recorded`,
          body: `${fromName} paid ${currency} ${amount} to ${toName}.`
        },
        data: { type: 'SETTLEMENT', tripId }
      });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error in settlement:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Action Endpoint (Hit directly by Service Worker)
app.post('/api/action/expense', async (req, res) => {
  try {
    const { tripId, expenseId, action, kaptanId } = req.body;
    // VERY BASIC security check for the SW call
    if (!tripId || !expenseId || !action || !kaptanId) {
       return res.status(400).json({ error: 'Missing parameters' });
    }

    const tripSnap = await db.collection('trips').doc(tripId).get();
    if (!tripSnap.exists) return res.status(404).json({ error: 'Trip not found' });
    
    if (tripSnap.data().kaptan_id !== kaptanId) {
      return res.status(403).json({ error: 'Unauthorized: Only kaptan can perform this action' });
    }

    const expenseRef = db.collection('trips').doc(tripId).collection('expenses').doc(expenseId);
    if (action === 'approve') {
      await expenseRef.update({ status: 'APPROVED' });
      
      // Also optionally notify others that it was approved
      // We can fetch the expense and fire the notification
      const expSnap = await expenseRef.get();
      if(expSnap.exists) {
        const expData = expSnap.data();
        const membersSnap = await db.collection('trips').doc(tripId).collection('members').get();
        const targetIds = membersSnap.docs.map(d => d.id).filter(id => id !== kaptanId);
        if (targetIds.length > 0) {
          const tokens = await getTokensForUsers(targetIds);
          if (tokens.length > 0) {
            await messaging.sendEachForMulticast({
              tokens,
              notification: {
                title: `Expense Approved`,
                body: `An expense of ${expData.currency} ${expData.amount} for ${expData.description} was approved.`
              },
              data: { type: 'EXPENSE_APPROVED', tripId, expenseId }
            });
          }
        }
      }
    } else if (action === 'decline') {
      // Typically we either delete or set status REJECTED
      // Assuming REJECTED or deleting. Let's delete it for simplicity or set to REJECTED.
      // I'll delete it to clean it up.
      await expenseRef.delete();
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error in action/expense:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Safarnama Notifications Backend running on port ${PORT}`);
});
