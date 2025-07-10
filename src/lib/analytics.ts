// Vouchly Analytics Utility
// Logs analytics events to Firestore (or BigQuery in future)
import { adminDb } from './firebase-admin';

export async function logAnalyticsEvent({
  eventType,
  userId,
  sessionId = '',
  meta = {},
}: {
  eventType: string;
  userId: string;
  sessionId?: string;
  meta?: Record<string, unknown>;
}) {
  await adminDb.collection('analytics').add({
    eventType,
    userId,
    sessionId,
    meta,
    timestamp: new Date(),
  });
}
