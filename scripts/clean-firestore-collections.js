// scripts/clean-firestore-collections.js

const admin = require('firebase-admin');
const readline = require('readline');

// Update this path to your service account key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function deleteAllDocsInCollection(collectionName) {
    const snapshot = await db.collection(collectionName).get();
    if (snapshot.empty) {
        console.log(`No documents found in ${collectionName}`);
        return;
    }
    const batchSize = 500;
    let deleted = 0;
    while (!snapshot.empty) {
        const batch = db.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        deleted += snapshot.docs.length;
        if (snapshot.docs.length < batchSize) break;
    }
    console.log(`Deleted ${deleted} documents from ${collectionName}`);
}

async function cleanCollections() {
    await deleteAllDocsInCollection('analytics');
    await deleteAllDocsInCollection('undoActions');
    await deleteAllDocsInCollection('users');
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('WARNING: This will DELETE ALL DOCUMENTS in analytics, undoActions, and users. Type "CLEAN" to continue: ', async (answer) => {
    if (answer === 'CLEAN') {
        await cleanCollections();
        console.log('Selected collections cleaned.');
    } else {
        console.log('Aborted.');
    }
    rl.close();
    process.exit();
});