// Notification utility for Vouchly
// Used to send in-app notifications for session events
import { adminDb } from './firebase-admin';
import admin from 'firebase-admin';

// Enhanced notification utility for Vouchly
// Supports eventType, timezone-aware time, and (scaffolded) email
import { formatInTimeZone } from 'date-fns-tz';

export async function sendNotification({
  userId,
  text,
  link = '',
  type = 'info',
  eventType = '',
  sessionTime,
  timezone,
  sendEmail = false,
  email,
}: {
  userId: string;
  text: string;
  link?: string;
  type?: string;
  eventType?: string;
  sessionTime?: Date;
  timezone?: string;
  sendEmail?: boolean;
  email?: string;
}) {
  let displayText = text;
  if (sessionTime && timezone) {
    // Append local time info to notification
    displayText += `\nTime: ${formatInTimeZone(sessionTime, timezone, 'yyyy-MM-dd HH:mm zzz')}`;
  }
  const notifRef = adminDb.collection('users').doc(userId).collection('notifications').doc();
  await notifRef.set({
    text: displayText,
    link,
    type,
    eventType,
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  // Scaffold: send email (implement with nodemailer/sendgrid if needed)
  if (sendEmail && email) {
    // await sendEmailNotification({ to: email, subject: 'Vouchly Notification', body: displayText });
  }
}

// Bulk mark notifications as read
export async function markAllNotificationsRead(userId: string) {
  const notifsSnap = await adminDb.collection('users').doc(userId).collection('notifications').where('read', '==', false).get();
  const batch = adminDb.batch();
  notifsSnap.docs.forEach(doc => batch.update(doc.ref, { read: true }));
  await batch.commit();
}

