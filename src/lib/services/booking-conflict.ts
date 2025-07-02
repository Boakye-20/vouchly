import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';

// Statuses that block time on the user's calendar
const BLOCKING_STATUSES = [
  'scheduled', // accepted and scheduled
  'in_progress',
  'accepted', // legacy naming if used
  'ongoing'
] as const;

export type BlockingStatus = (typeof BLOCKING_STATUSES)[number];

/**
 * Check if a user already has a session that overlaps the given time window.
 * @param userId The user to check availability for
 * @param startUTC The proposed start time in UTC
 * @param durationMinutes Proposed session duration in minutes
 * @param bufferMinutes Optional buffer to apply before/after each session (default 0)
 * @returns Conflicting session data if found, otherwise null
 */
export async function findBookingConflict(
  userId: string,
  startUTC: Date,
  durationMinutes: number,
  bufferMinutes = 0
) {
  const startMs = startUTC.getTime();
  const endMs = startMs + durationMinutes * 60_000;
  const windowStartMs = startMs - bufferMinutes * 60_000 - durationMinutes * 60_000; // include duration to cover earlier sessions overlapping into window
  const windowEndMs = endMs + bufferMinutes * 60_000;

  const windowStart = Timestamp.fromMillis(windowStartMs);
  const windowEnd = Timestamp.fromMillis(windowEndMs);

  const snapshot = await adminDb
    .collection('sessions')
    .where('participantIds', 'array-contains', userId)
    .where('status', 'in', BLOCKING_STATUSES as unknown as string[])
    .where('scheduledStartTime', '>=', windowStart)
    .where('scheduledStartTime', '<=', windowEnd)
    .get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const existingStart: Timestamp = data.scheduledStartTime;
    const existingDuration: number = data.durationMinutes ?? 60; // default 60 if missing

    const existingStartMs = existingStart.toMillis();
    const existingEndMs = existingStartMs + existingDuration * 60_000;

    // simple overlap test
    const overlap = startMs < existingEndMs && endMs > existingStartMs;
    if (overlap) {
      return { id: doc.id, ...data };
    }
  }

  return null;
}
