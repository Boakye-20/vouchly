import { adminDb as db } from '../src/lib/firebase-admin';
import { toUTC } from '../src/lib/utils/timezone';
import * as admin from 'firebase-admin';

/**
 * This script migrates all session timestamps to UTC using the Firebase Admin SDK.
 * It must be run in an environment where Firebase Admin credentials are available.
 * Run with: npx tsx scripts/migrate-sessions-to-utc.ts
 */

async function migrateSessionsToUTC() {
  console.log('Starting session migration to UTC using Admin SDK...');

  try {
    const sessionsRef = db.collection('sessions');
    const querySnapshot = await sessionsRef.get();

    if (querySnapshot.empty) {
      console.log('No sessions found to migrate.');
      return;
    }

    let batch = db.batch();
    let batchCount = 0;
    const batchSize = 100; // Firestore batch limit is 500
    let totalProcessed = 0;
    let totalUpdated = 0;

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const updates: Record<string, any> = {};
      let needsUpdate = false;

      // Check and update scheduledStartTime
      if (data.scheduledStartTime && !data._utcMigrated) {
        const currentTime = data.scheduledStartTime.toDate();
        updates.scheduledStartTime = admin.firestore.Timestamp.fromDate(toUTC(currentTime));
        updates._utcMigrated = true;
        needsUpdate = true;
      }

      // Add other timestamp fields here if needed (e.g., createdAt, updatedAt)

      if (needsUpdate) {
        batch.update(doc.ref, updates);
        batchCount++;
        totalUpdated++;

        if (batchCount >= batchSize) {
          console.log(`Committing batch of ${batchCount} updates...`);
          await batch.commit();
          batch = db.batch();
          batchCount = 0;
        }
      }

      totalProcessed++;
      if (totalProcessed % 100 === 0) {
        console.log(`Processed ${totalProcessed} of ${querySnapshot.size} sessions...`);
      }
    }

    if (batchCount > 0) {
      console.log(`Committing final batch of ${batchCount} updates...`);
      await batch.commit();
    }

    console.log(`\nMigration complete!`);
    console.log(`Total sessions processed: ${totalProcessed}`);
    console.log(`Total sessions updated: ${totalUpdated}`);

  } catch (error) {
    console.error('FATAL: Error during migration:', error);
    process.exit(1);
  }
}

migrateSessionsToUTC().then(() => {
    // The process will exit within the function on success or failure
}).catch(e => {
    console.error('Unhandled promise rejection in migration script:', e);
    process.exit(1);
});
