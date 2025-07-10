import { adminDb } from './firebase-admin';
import admin from 'firebase-admin';
import { formatInTimeZone } from 'date-fns-tz';
import { NotificationType, NotificationData } from '@/types/notifications';

interface SendNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  data?: Record<string, any>;
  actions?: {
    label: string;
    action: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  }[];
  expiresInHours?: number;
  sendEmail?: boolean;
  email?: string;
}

export async function sendNotification({
  userId,
  type,
  title,
  message,
  link = '',
  data = {},
  actions = [],
  expiresInHours = 168, // 1 week by default
  sendEmail = false,
  email,
}: SendNotificationParams): Promise<string> {
  const now = admin.firestore.Timestamp.now();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);

  const notification: Omit<NotificationData, 'id'> = {
    userId,
    type,
    title,
    message,
    link,
    data,
    actions,
    read: false,
    createdAt: now.toDate(),
    expiresAt,
  };

  const notifRef = adminDb.collection('users').doc(userId).collection('notifications').doc();
  await notifRef.set({
    ...notification,
    createdAt: now,
    expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
  });

  // Send email notification if enabled
  if (sendEmail && email) {
    await sendEmailNotification({
      to: email,
      subject: `Vouchly: ${title}`,
      text: message,
      html: `
        <div>
          <h2>${title}</h2>
          <p>${message}</p>
          ${link ? `<p><a href="${process.env.NEXT_PUBLIC_APP_URL}${link}">View in App</a></p>` : ''}
        </div>
      `,
    });
  }

  return notifRef.id;
}

import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const appName = 'Vouchly';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vouchly.app';

// Email notification function using Resend
interface EmailNotificationParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
  link?: string;
}

async function sendEmailNotification({
  to,
  subject,
  text,
  html,
  link = ''
}: EmailNotificationParams) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY is not set. Email notifications are disabled.');
      return;
    }

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: `[${appName}] ${subject}`,
      text: text,
      html: html || `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .container { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
          .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; }
          .content { padding: 24px; background-color: #ffffff; }
          .footer { text-align: center; padding: 16px; font-size: 12px; color: #6b7280; background-color: #f9fafb; }
          .button { display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; }
          .divider { height: 1px; background-color: #e5e7eb; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">${appName}</h1>
            <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">${subject}</p>
          </div>
          <div class="content">
            ${html || text.replace(/\n/g, '<br>')}
            
${link ? `
            <div style="margin-top: 24px; text-align: center;">
              <a href="${appUrl}${link}" class="button" style="color: white; text-decoration: none;">
                View in ${appName}
              </a>
            </div>
            ` : ''}
            
            <div class="divider"></div>
            
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">
              If you didn't request this email, you can safely ignore it.
            </p>
          </div>
          <div class="footer">
            <p style="margin: 0;">© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            <p style="margin: 4px 0 0; font-size: 11px; color: #9ca3af;">
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>`,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { error };
    }

    console.log('Email sent:', data);
    return { data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { error };
  }
}

export async function markNotificationRead(userId: string, notificationId: string) {
  await adminDb
    .collection('users')
    .doc(userId)
    .collection('notifications')
    .doc(notificationId)
    .update({ read: true });
}

export async function markAllNotificationsRead(userId: string) {
  const notifsSnap = await adminDb
    .collection('users')
    .doc(userId)
    .collection('notifications')
    .where('read', '==', false)
    .get();

  const batch = adminDb.batch();
  notifsSnap.docs.forEach((doc) => {
    batch.update(doc.ref, { read: true });
  });

  if (notifsSnap.docs.length > 0) {
    await batch.commit();
  }
}

export async function deleteNotification(userId: string, notificationId: string) {
  await adminDb
    .collection('users')
    .doc(userId)
    .collection('notifications')
    .doc(notificationId)
    .delete();
}

export async function getUnreadCount(userId: string): Promise<number> {
  const snapshot = await adminDb
    .collection('users')
    .doc(userId)
    .collection('notifications')
    .where('read', '==', false)
    .count()
    .get();

  return snapshot.data().count;
}

export async function cleanupExpiredNotifications() {
  const now = admin.firestore.Timestamp.now();
  const expiredSnap = await adminDb
    .collectionGroup('notifications')
    .where('expiresAt', '<=', now)
    .limit(1000)
    .get();

  const batch = adminDb.batch();
  expiredSnap.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  if (expiredSnap.docs.length > 0) {
    await batch.commit();
  }

  return expiredSnap.docs.length;
}

