// Vouchly: Scheduled background jobs for reminders and no-show detection
// To be deployed as a Firebase Cloud Function (or run as a cron job)
import { adminDb } from './firebase-admin';
import { sendNotification } from './notifications';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { finalizeExpiredPendingCancellations, cleanupExpiredUndoActions } from './undo';
import { adjustVouchScore } from '@/ai/flows/vouch-score-accountability';

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
                title: 'Upcoming Session Reminder',
                message: `Your session starts soon at ${session.scheduledStartTime.toDate().toLocaleString()}!`,
                link: '/dashboard/sessions',
                type: 'session_reminder',
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
                title: 'No-Show Detected',
                message: `Your session scheduled for ${session.scheduledStartTime.toDate().toLocaleString()} was not started.`,
                link: '/dashboard/sessions',
                type: 'system',
            });
        }
    }
}

// Scheduled job to finalize expired pending cancellations and clean up undo actions
export async function runSessionCleanupJob() {
    try {
        console.log('Starting session cleanup job...');

        // Finalize expired pending cancellations
        const finalizedCount = await finalizeExpiredPendingCancellations();

        // Clean up expired undo actions
        await cleanupExpiredUndoActions();

        console.log(`Session cleanup job completed. Finalized ${finalizedCount} sessions.`);

        return {
            success: true,
            finalizedCount,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error in session cleanup job:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        };
    }
}

// Analytics data aggregation job
export async function aggregateAnalyticsData() {
    try {
        console.log('Starting analytics aggregation job...');

        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Aggregate daily session statistics
        const sessionsSnap = await adminDb.collection('sessions')
            .where('createdAt', '>=', Timestamp.fromDate(yesterday))
            .get();

        const dailyStats = {
            totalSessions: sessionsSnap.size,
            completedSessions: 0,
            cancelledSessions: 0,
            averageDuration: 0,
            totalDuration: 0,
            date: yesterday.toISOString().split('T')[0]
        };

        let totalDuration = 0;

        for (const doc of sessionsSnap.docs) {
            const session = doc.data();
            if (session.status === 'completed') {
                dailyStats.completedSessions++;
                if (session.actualDuration) {
                    totalDuration += session.actualDuration;
                }
            } else if (session.status === 'cancelled') {
                dailyStats.cancelledSessions++;
            }
        }

        if (dailyStats.completedSessions > 0) {
            dailyStats.averageDuration = Math.round(totalDuration / dailyStats.completedSessions);
        }
        dailyStats.totalDuration = totalDuration;

        // Store aggregated data
        await adminDb.collection('analytics').doc('daily').collection('stats').add({
            ...dailyStats,
            createdAt: FieldValue.serverTimestamp()
        });

        console.log('Analytics aggregation completed:', dailyStats);

        return {
            success: true,
            stats: dailyStats,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error in analytics aggregation job:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        };
    }
}

// Email reminder system for inactive users
export async function sendInactiveUserReminders() {
    try {
        console.log('Starting inactive user reminder job...');

        const now = new Date();
        const inactiveThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days

        // Find users who haven't been active in 7 days
        const usersSnap = await adminDb.collection('users')
            .where('lastActive', '<', Timestamp.fromDate(inactiveThreshold))
            .where('accountStatus', '==', 'active')
            .get();

        let reminderCount = 0;

        for (const doc of usersSnap.docs) {
            const user = doc.data();

            // Send reminder notification
            await sendNotification({
                userId: doc.id,
                title: 'We miss you!',
                message: 'It\'s been a while since your last study session. Ready to find your next study partner?',
                link: '/dashboard/browse',
                type: 'inactive_reminder'
            });

            reminderCount++;
        }

        console.log(`Sent ${reminderCount} inactive user reminders`);

        return {
            success: true,
            reminderCount,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error in inactive user reminder job:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        };
    }
}

// Vouch score penalty application for no-shows
export async function applyNoShowPenalties() {
    try {
        console.log('Starting no-show penalty job...');

        const now = new Date();
        const noShowThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

        // Find sessions that were scheduled but never started
        const sessionsSnap = await adminDb.collection('sessions')
            .where('status', '==', 'scheduled')
            .where('scheduledStartTime', '<', Timestamp.fromDate(noShowThreshold))
            .get();

        let penaltyCount = 0;

        for (const doc of sessionsSnap.docs) {
            const session = doc.data();

            // Apply penalty to both participants for no-show
            for (const userId of session.participantIds) {
                try {
                    await adjustVouchScore({
                        userId,
                        sessionId: doc.id,
                        eventType: 'CANCELLED_LOCKED_IN'
                    });
                    penaltyCount++;
                } catch (error) {
                    console.error(`Failed to apply penalty to user ${userId}:`, error);
                }
            }

            // Mark session as cancelled
            await doc.ref.update({
                status: 'cancelled',
                cancellationReason: 'No-show detected by system',
                cancelledAt: FieldValue.serverTimestamp()
            });
        }

        console.log(`Applied ${penaltyCount} no-show penalties`);

        return {
            success: true,
            penaltyCount,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error in no-show penalty job:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        };
    }
}

// Export for manual execution or external scheduling
export { runSessionCleanupJob as default };

// To use: schedule all jobs via Firebase Scheduler or cron
// Recommended schedule:
// - sendUpcomingSessionReminders: every 5 minutes
// - detectNoShows: every 10 minutes  
// - runSessionCleanupJob: every hour
// - aggregateAnalyticsData: daily at 2 AM
// - sendInactiveUserReminders: weekly on Monday at 9 AM
// - applyNoShowPenalties: daily at 1 AM
