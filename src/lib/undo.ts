import { adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { logAnalyticsEvent } from './analytics';
import { adjustVouchScore } from "@/ai/flows/vouch-score-accountability";

const UNDO_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

interface UndoAction {
    action: 'CANCEL_SESSION';
    sessionId: string;
    previousState: string;
    userId: string;
    expiresAt: Date;
}

export async function createUndoAction(params: {
    action: 'CANCEL_SESSION';
    sessionId: string;
    previousState: string;
    userId: string;
}): Promise<string> {
    const undoId = `undo_${Date.now()}`;
    const undoAction: UndoAction = {
        ...params,
        expiresAt: new Date(Date.now() + UNDO_WINDOW_MS),
    };

    await adminDb.collection('undoActions').doc(undoId).set(undoAction);
    return undoId;
}

export async function processUndoAction(undoId: string, userEmail: string): Promise<{ success: boolean; message: string }> {
    const undoRef = adminDb.collection('undoActions').doc(undoId);
    const undoDoc = await undoRef.get();

    if (!undoDoc.exists) {
        return { success: false, message: 'Undo action not found or expired' };
    }

    const undoAction = undoDoc.data() as UndoAction;

    // Check if the undo action is expired
    if (new Date(undoAction.expiresAt) < new Date()) {
        await undoRef.delete();
        return { success: false, message: 'Undo window has expired' };
    }

    // Verify user has permission to undo this action
    if (undoAction.userId !== userEmail) {
        return { success: false, message: 'Unauthorized' };
    }

    const sessionRef = adminDb.collection('sessions').doc(undoAction.sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
        return { success: false, message: 'Session not found' };
    }

    const sessionData = sessionDoc.data();

    if (sessionData?.status !== 'pending_cancellation') {
        return { success: false, message: 'Session is not pending cancellation' };
    }

    // Restore previous state
    await sessionRef.update({
        status: undoAction.previousState,
        cancelledBy: FieldValue.delete(),
        cancellationTime: FieldValue.delete(),
        pendingCancellationAt: FieldValue.delete(),
        previousState: FieldValue.delete(),
    });

    // Delete the undo action
    await undoRef.delete();

    // Log the undo event
    await logAnalyticsEvent({
        eventType: 'UNDO_CANCELLATION',
        userId: userEmail,
        sessionId: undoAction.sessionId,
    });

    return { success: true, message: 'Session cancellation undone successfully' };
}

// Finalize pending cancellations that have expired undo windows
export async function finalizeExpiredPendingCancellations() {
    const now = new Date();

    // Find all sessions in pending_cancellation status
    const pendingSessions = await adminDb.collection('sessions')
        .where('status', '==', 'pending_cancellation')
        .get();

    const batch = adminDb.batch();
    let finalizedCount = 0;

    for (const sessionDoc of pendingSessions.docs) {
        const sessionData = sessionDoc.data();
        const sessionId = sessionDoc.id;

        // Check if there are any valid undo actions for this session
        const undoActions = await adminDb.collection('undoActions')
            .where('sessionId', '==', sessionId)
            .where('expiresAt', '>', now)
            .get();

        // If no valid undo actions exist, finalize the cancellation
        if (undoActions.empty) {
            const sessionRef = adminDb.collection('sessions').doc(sessionId);

            // Update session to cancelled status
            batch.update(sessionRef, {
                status: 'cancelled',
                cancellationTime: FieldValue.serverTimestamp(),
                pendingCancellationAt: FieldValue.delete(),
                previousState: FieldValue.delete(),
            });

            // Apply vouch score penalty for the user who cancelled
            if (sessionData.cancelledBy) {
                try {
                    // Determine the correct penalty type based on when the session was cancelled
                    const scheduledStartTime = sessionData.scheduledStartTime?.toDate();
                    const now = new Date();
                    const timeDiffHours = scheduledStartTime ?
                        (scheduledStartTime.getTime() - now.getTime()) / (1000 * 60 * 60) : 0;

                    // Only apply penalty for locked-in cancellations (within 4 hours)
                    // CANCELLED_WITH_NOTICE has no penalty as "life happens"
                    const eventType = timeDiffHours < 4 ? 'CANCELLED_LOCKED_IN' : 'CANCELLED_WITH_NOTICE';

                    await adjustVouchScore({
                        userId: sessionData.cancelledBy,
                        sessionId: sessionId,
                        eventType: eventType,
                    });
                } catch (error) {
                    console.error(`Failed to adjust vouch score for session ${sessionId}:`, error);
                }
            }

            // Log the finalization
            await logAnalyticsEvent({
                eventType: 'CANCELLATION_FINALIZED',
                userId: sessionData.cancelledBy || 'unknown',
                sessionId: sessionId,
            });

            finalizedCount++;
        }
    }

    if (finalizedCount > 0) {
        await batch.commit();
        console.log(`Finalized ${finalizedCount} expired pending cancellations`);
    }

    return finalizedCount;
}

// Clean up expired undo actions
export async function cleanupExpiredUndoActions() {
    const now = new Date();
    const expiredActions = await adminDb.collection('undoActions')
        .where('expiresAt', '<', now)
        .get();

    const batch = adminDb.batch();
    expiredActions.docs.forEach(doc => {
        batch.delete(doc.ref);
    });

    if (expiredActions.docs.length > 0) {
        await batch.commit();
        console.log(`Cleaned up ${expiredActions.docs.length} expired undo actions`);
    }
}
