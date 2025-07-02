// Vouchly: Scheduled background jobs for reminders and no-show detection
// To be deployed as a Firebase Cloud Function (or run as a cron job)
import { adminDb } from './firebase-admin';
import { sendNotification } from './notifications';
import { Timestamp } from 'firebase-admin/firestore';

const REMINDER_MINUTES_BEFORE = 30; // send reminders 30 min before
const NO_SHOW_GRACE_MINUTES = 15; // consider no-show if not started 15 min after

export async function sendUpcomingSessionReminders() {
  const now = new Date();
  const reminderWindowStart = new Date(now.getTime() + REMINDER_MINUTES_BEFORE * 60000);
  const reminderWindowEnd = new Date(now.getTime() + (REMINDER_MINUTES_BEFORE + 5) * 60000);
  // Find sessions scheduled to start in the next window
  const sessionsSnap = await adminDb.collection('sessions')
    .where('status', '==', 'scheduled')
    .where('scheduledStartTime', '>=', Timestamp.fromDate(reminderWindowStart))
    .where('scheduledStartTime', '<', Timestamp.fromDate(reminderWindowEnd))
    .get();
  for (const doc of sessionsSnap.docs) {
    const session = doc.data();
    for (const userId of session.participantIds) {
      await sendNotification({
        userId,
        text: `Reminder: Your session starts soon at ${session.scheduledStartTime.toDate().toLocaleString()}!`,
        link: '/dashboard/sessions',
        type: 'reminder',
      });
    }
  }
}

export async function detectNoShows() {
  const now = new Date();
  const graceWindow = new Date(now.getTime() - NO_SHOW_GRACE_MINUTES * 60000);
  // Find sessions that should have started but are not in progress or completed/cancelled
  const sessionsSnap = await adminDb.collection('sessions')
    .where('status', '==', 'scheduled')
    .where('scheduledStartTime', '<', Timestamp.fromDate(graceWindow))
    .get();
  for (const doc of sessionsSnap.docs) {
    const session = doc.data();
    // Optionally update session status or flag
    for (const userId of session.participantIds) {
      await sendNotification({
        userId,
        text: `No-show detected: Your session scheduled for ${session.scheduledStartTime.toDate().toLocaleString()} was not started.`,
        link: '/dashboard/sessions',
        type: 'no_show',
      });
    }
  }
}

// To use: schedule sendUpcomingSessionReminders and detectNoShows via Firebase Scheduler or cron
