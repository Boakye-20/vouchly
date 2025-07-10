// WARNING: This script will irreversibly delete ALL users and their data from Firebase Auth and Firestore.
// Make sure you have a backup before running!
// Usage: node scripts/wipe-all-users.js

const admin = require('firebase-admin');
const readline = require('readline');

// TODO: Replace with your service account key path
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

async function deleteAllAuthUsers(nextPageToken) {
    const listUsersResult = await auth.listUsers(1000, nextPageToken);
    const uids = listUsersResult.users.map(userRecord => userRecord.uid);
    if (uids.length > 0) {
        await auth.deleteUsers(uids);
        console.log(`Deleted ${uids.length} users from Auth.`);
    }
    if (listUsersResult.pageToken) {
        await deleteAllAuthUsers(listUsersResult.pageToken);
    }
}

async function deleteCollection(collectionPath) {
    const snapshot = await db.collection(collectionPath).get();
    const batchSize = 500;
    let deleted = 0;
    while (!snapshot.empty) {
        const batch = db.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        deleted += snapshot.docs.length;
        if (snapshot.docs.length < batchSize) break;
    }
    console.log(`Deleted ${deleted} documents from ${collectionPath}`);
}

async function wipeAll() {
    // Delete Auth users
    await deleteAllAuthUsers();

    // Delete Firestore collections
    await deleteCollection('users');
    await deleteCollection('sessions');
    // Add more collections as needed, e.g. vouchHistory, notifications, etc.
}

// Confirmation prompt
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('WARNING: This will DELETE ALL USERS and DATA. Type "WIPE" to continue: ', async (answer) => {
    if (answer === 'WIPE') {
        await wipeAll();
        console.log('All users and data wiped.');
    } else {
        console.log('Aborted.');
    }
    rl.close();
    process.exit();
}); 