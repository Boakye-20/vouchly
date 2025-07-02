"use server";

import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { isValidSessionTransition, SessionStatus } from './session-states';
import { sendNotification } from './notifications';
import { logAnalyticsEvent } from './analytics';
import admin from 'firebase-admin';
import { adminDb } from './firebase-admin';
import { randomUUID } from 'crypto';
import { adjustVouchScore } from "@/ai/flows/vouch-score-accountability";
import type { VouchScoreEventInput } from "@/ai/flows/vouch-score-accountability.types";

// This is the main action called by the SessionCard component for most events.
export async function adjustVouchScoreAction(input: VouchScoreEventInput) {
    try {
        const { eventType, sessionId, userId } = input;
        const sessionRef = adminDb.doc(`sessions/${sessionId}`);
        const sessionSnap = await sessionRef.get();

        if (!sessionSnap.exists) throw new Error("Session not found!");
        const sessionData = sessionSnap.data()!;

        let updateData: any = {
            updatedAt: FieldValue.serverTimestamp()
        };
        let shouldAdjustVouchScore = true;
        let vouchResult: any = undefined;

        // --- Enforce valid session state transitions ---
        const fromStatus = sessionData.status as SessionStatus;
        let toStatus: SessionStatus | undefined;
        switch (eventType) {
            case 'REQUEST_ACCEPTED':
                toStatus = 'scheduled'; break;
            case 'START_CONFIRMED':
                toStatus = 'in_progress'; break;
            case 'COMPLETION_CONFIRMED':
                toStatus = 'completed'; break;
            case 'CANCELLED_WITH_NOTICE':
            case 'CANCELLED_LOCKED_IN':
                toStatus = 'cancelled'; break;
            case 'REQUEST_DECLINED':
                toStatus = 'cancelled'; break;
            case 'RESCHEDULED_WITH_NOTICE':
                toStatus = 'requested'; break;
            default:
                toStatus = undefined;
        }
        if (toStatus && !isValidSessionTransition(fromStatus, toStatus)) {
            throw new Error(`Invalid session state transition: ${fromStatus} → ${toStatus}`);
        }
        let vouchScoreEvent = eventType;

        // --- Analytics: log session event ---
        await logAnalyticsEvent({
            eventType,
            userId,
            sessionId,
            meta: { fromStatus, toStatus }
        });
        switch (eventType) {
            case 'REQUEST_ACCEPTED': {
                const scheduledStartTime = (sessionData.scheduledStartTime as Timestamp)?.toDate();
                if (!scheduledStartTime) throw new Error("Session is missing a start time.");

                // --- double-booking prevention (on accept) ---
                const { findBookingConflict } = await import('./services/booking-conflict');
                const senderConflict = await findBookingConflict(sessionData.initiatorId, scheduledStartTime, sessionData.durationMinutes, 15);
                if (senderConflict && senderConflict.id !== sessionData.id) {
                    throw new Error('You already have another accepted/scheduled session around that time.');
                }
                const recipientConflict = await findBookingConflict(sessionData.recipientId, scheduledStartTime, sessionData.durationMinutes, 15);
                if (recipientConflict && recipientConflict.id !== sessionData.id) {
                    throw new Error('Recipient has another accepted/scheduled session at that time. Please choose a different slot.');
                }

                const roomName = `vouchly-session-${randomUUID()}`;
                const videoRoomUrl = `https://meet.jit.si/${roomName}`;
                const videoJoinEnabledAt = new Date(scheduledStartTime.getTime() - 5 * 60 * 1000);

                updateData = {
                    ...updateData,
                    status: 'scheduled',
                    videoRoomUrl: videoRoomUrl,
                    videoJoinEnabledAt: Timestamp.fromDate(videoJoinEnabledAt)
                };
                break;
            }

            case 'REQUEST_DECLINED': {
                updateData = {
                    ...updateData,
                    status: 'cancelled',
                    cancellationReason: 'Declined by recipient'
                };
                break;
            }

            case 'START_CONFIRMED': {
                // Track who confirmed the start
                const startConfirmedBy = sessionData.startConfirmedBy || [];
                if (!startConfirmedBy.includes(userId)) {
                    startConfirmedBy.push(userId);
                }

                updateData = {
                    ...updateData,
                    status: 'in_progress',
                    startConfirmedBy: startConfirmedBy,
                    actualStartTime: FieldValue.serverTimestamp()
                };

                // Check if both users have confirmed start
                if (startConfirmedBy.length === 2) {
                    updateData.bothStartConfirmed = true;
                }
                break;
            }

            case 'COMPLETION_CONFIRMED':
            case 'COMPLETION_REPORTED_ISSUE': {
                const completionConfirmedBy = sessionData.completionConfirmedBy || {};
                completionConfirmedBy[userId] = eventType === 'COMPLETION_CONFIRMED';

                updateData = {
                    ...updateData,
                    status: 'completed',
                    completionConfirmedBy: completionConfirmedBy,
                    actualEndTime: FieldValue.serverTimestamp()
                };

                // Check if both users confirmed completion positively
                const confirmations = Object.values(completionConfirmedBy);
                if (confirmations.length === 2 && confirmations.every(c => c === true) && sessionData.bothStartConfirmed) {
                    // Both started AND completed successfully - award points
                    vouchScoreEvent = 'COMPLETION_CONFIRMED';
                } else {
                    // No points if not mutually confirmed
                    shouldAdjustVouchScore = false;
                }
                break;
            }

            case 'CANCELLED_WITH_NOTICE':
            case 'CANCELLED_LOCKED_IN': {
                updateData = {
                    ...updateData,
                    status: 'cancelled',
                    cancelledBy: userId,
                    cancellationTime: FieldValue.serverTimestamp(),
                    endTime: FieldValue.serverTimestamp() // Mark as valid session with end time
                };
                // If session is still 'requested', do not adjust vouch score
                if (sessionData.status === 'requested') {
                    shouldAdjustVouchScore = false;
                }
                break;
            }

            case 'RESCHEDULED_WITH_NOTICE': {
                updateData = {
                    ...updateData,
                    status: 'requested',
                    // Swap initiator/recipient so the other user must accept the new time
                    initiatorId: userId,
                    recipientId: sessionData.recipientId,
                    // Maintain the participants data - IMPORTANT
                    participants: sessionData.participants,
                    participantIds: sessionData.participantIds, // Keep this unchanged
                    // Keep other important fields
                    focusTopic: sessionData.focusTopic,
                    durationMinutes: sessionData.durationMinutes,
                    // Clear any previous confirmations
                    startConfirmedBy: [],
                    completionConfirmedBy: {},
                    bothStartConfirmed: false,
                };
                break;
            }

            default:
                break;
        }

        await sessionRef.update(updateData);

        // --- Log state change to sessionStateHistory subcollection ---
        if (toStatus && fromStatus !== toStatus) {
            const stateHistoryRef = sessionRef.collection('sessionStateHistory').doc();
            await stateHistoryRef.set({
                from: fromStatus,
                to: toStatus,
                actor: userId,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                eventType
            });
        }

        // --- Send notifications for session events ---
        const initiatorId = sessionData.initiatorId;
        const recipientId = sessionData.recipientId;
        const sessionTime = sessionData.scheduledStartTime instanceof Date ? sessionData.scheduledStartTime : (sessionData.scheduledStartTime?.toDate?.() || '');
        const topic = sessionData.focusTopic || 'a study session';
        const sessionLink = `/dashboard/sessions`;
        if (eventType === 'REQUEST_ACCEPTED') {
            await sendNotification({
                userId: initiatorId,
                text: `Your study request for "${topic}" was accepted!`,
                link: sessionLink,
                type: 'success',
            });
            await sendNotification({
                userId: recipientId,
                text: `You accepted a study request for "${topic}".`,
                link: sessionLink,
                type: 'info',
            });
        } else if (eventType === 'REQUEST_DECLINED') {
            await sendNotification({
                userId: initiatorId,
                text: `Your study request for "${topic}" was declined.`,
                link: sessionLink,
                type: 'warning',
            });
        } else if (eventType === 'CANCELLED_WITH_NOTICE' || eventType === 'CANCELLED_LOCKED_IN') {
            const otherUserId = userId === initiatorId ? recipientId : initiatorId;
            await sendNotification({
                userId: otherUserId,
                text: `A study session for "${topic}" was cancelled.`,
                link: sessionLink,
                type: 'warning',
            });
        } else if (eventType === 'COMPLETION_CONFIRMED') {
            await sendNotification({
                userId: initiatorId,
                text: `Session "${topic}" marked as complete. Well done!`,
                link: sessionLink,
                type: 'success',
            });
            await sendNotification({
                userId: recipientId,
                text: `Session "${topic}" marked as complete. Well done!`,
                link: sessionLink,
                type: 'success',
            });
        }

        // Optionally adjust vouch score
        if (shouldAdjustVouchScore) {
            vouchResult = await adjustVouchScore({
                ...input,
                eventType: vouchScoreEvent
            });
        }

        // Use vouchResult.message if available, else default
        let resultMessage;
        if (shouldAdjustVouchScore && typeof vouchResult !== 'undefined' && vouchResult.message) {
            resultMessage = vouchResult.message;
        } else {
            resultMessage = getDefaultMessage(eventType);
        }
        return { success: true, data: { message: resultMessage } };

    } catch (error) {
        console.error("Error in adjustVouchScoreAction:", error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
        return { success: false, error: errorMessage };
    }
}

// Helper function for default messages
function getDefaultMessage(eventType: string): string {
    const messages: { [key: string]: string } = {
        'REQUEST_ACCEPTED': 'Session accepted and video room created!',
        'REQUEST_DECLINED': 'Request declined.',
        'START_CONFIRMED': 'Session started! Make sure your partner also confirms.',
        'COMPLETION_CONFIRMED': 'Session marked as completed.',
        'COMPLETION_REPORTED_ISSUE': 'Issue reported.',
        'CANCELLED_WITH_NOTICE': 'Session cancelled.',
        'CANCELLED_LOCKED_IN': 'Session cancelled (locked-in period).',
        'RESCHEDULED_WITH_NOTICE': 'Reschedule request sent to your partner.'
    };
    return messages[eventType] || 'Action completed.';
}

// This action is called by the StudyRequestModal and is correct.
export async function sendStudyRequestAction(requestData: {
    senderId: string;
    senderName: string;
    recipientId: string;
    recipientName: string;
    focusTopic: string;
    initialMessage: string;
    scheduledStartTime: Date;
    durationMinutes: number;
}) {
    try {
        const { senderId, recipientId, senderName, recipientName, focusTopic, initialMessage, scheduledStartTime, durationMinutes } = requestData;


        const batch = adminDb.batch();

        const sessionRef = adminDb.collection('sessions').doc();
        batch.set(sessionRef, {
            initiatorId: senderId,
            recipientId: recipientId,
            status: 'requested',
            createdAt: FieldValue.serverTimestamp(),
            participantIds: [senderId, recipientId],
            participants: {
                [senderId]: { name: senderName },
                [recipientId]: { name: recipientName }
            },
            focusTopic: focusTopic,
            initialMessage: initialMessage,
            scheduledStartTime: Timestamp.fromDate(scheduledStartTime),
            durationMinutes: durationMinutes
        });

        const notificationRef = adminDb.collection(`users/${recipientId}/notifications`).doc();
        batch.set(notificationRef, {
            text: `You have a new study request from ${senderName}.`,
            link: '/dashboard/sessions',
            read: false,
            createdAt: FieldValue.serverTimestamp()
        });

        await batch.commit();
        return { success: true, message: "Study request sent successfully!" };
    } catch (error) {
        console.error("Error sending study request:", error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
        return { success: false, error: errorMessage };
    }
}

// --- NEW: A dedicated action for handling reschedule requests ---
export async function rescheduleSessionAction(params: {
    sessionId: string;
    newDateTime: Date;
    requesterId: string;
    requesterName: string;
}) {
    try {
        const { sessionId, newDateTime, requesterId, requesterName } = params;
        console.log("Reschedule params:", params);

        const sessionRef = adminDb.doc(`sessions/${sessionId}`);
        const sessionSnap = await sessionRef.get();

        if (!sessionSnap.exists) {
            throw new Error("Session to reschedule not found.");
        }

        const sessionData = sessionSnap.data()!;
        console.log("Session data:", sessionData);
        console.log("Participant IDs:", sessionData.participantIds);

        // Find the ID of the other person in the session
        const otherParticipantId = sessionData.participantIds?.find((id: string) => id !== requesterId);
        console.log("Other participant ID:", otherParticipantId);

        if (!otherParticipantId) {
            throw new Error("Could not find partner to notify.");
        }

        const batch = adminDb.batch();

        // 1. Update the session with the new time and reset its status
        batch.update(sessionRef, {
            scheduledStartTime: Timestamp.fromDate(newDateTime),
            videoRoomUrl: null, // A new link will be generated on re-acceptance
            videoJoinEnabledAt: null,
            status: 'requested', // Set status back to 'requested' for re-confirmation
            // Swap initiator/recipient so the other user must accept the new time
            initiatorId: requesterId,
            recipientId: otherParticipantId,
            // Maintain the participants data - IMPORTANT
            participants: sessionData.participants,
            participantIds: sessionData.participantIds, // Keep this unchanged
            // Keep other important fields
            focusTopic: sessionData.focusTopic,
            durationMinutes: sessionData.durationMinutes,
            // Clear any previous confirmations
            startConfirmedBy: [],
            completionConfirmedBy: {},
            bothStartConfirmed: false,
            updatedAt: FieldValue.serverTimestamp()
        });

        // 2. Create a notification for the other user
        const notificationRef = adminDb.collection(`users/${otherParticipantId}/notifications`).doc();
        batch.set(notificationRef, {
            text: `${requesterName} has proposed a new time for your session.`,
            link: `/dashboard/sessions`,
            read: false,
            createdAt: FieldValue.serverTimestamp()
        });

        await batch.commit();
        console.log("Reschedule batch committed successfully");
        return { success: true, message: "Reschedule proposal sent!" };
    } catch (error) {
        console.error("Error rescheduling session:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to send reschedule request.";
        return { success: false, error: errorMessage };
    }
}