'use server';
/**
 * @fileOverview A flow that automatically adjusts a user's Vouch score and records the transaction.
 */

import { ai } from '@/ai/genkit';
import {
    VouchScoreEventInputSchema,
    type VouchScoreEventInput,
    VouchScoreEventOutputSchema,
    type VouchScoreEventOutput,
} from './vouch-score-accountability.types';
// --- UPDATED: Add collection, addDoc, serverTimestamp ---
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';


export type { VouchScoreEventInput, VouchScoreEventOutput };

export async function adjustVouchScore(input: VouchScoreEventInput): Promise<VouchScoreEventOutput> {
    return adjustVouchScoreFlow(input);
}

const adjustVouchScoreFlow = ai.defineFlow(
    {
        name: 'adjustVouchScoreFlow',
        inputSchema: VouchScoreEventInputSchema,
        outputSchema: VouchScoreEventOutputSchema,
    },
    async ({ userId, sessionId, eventType }) => {

        const userRef = adminDb.doc(`users/${userId}`);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            throw new Error(`User with ID ${userId} not found.`);
        }

        const userData = userSnap.data();
        if (!userData) {
            throw new Error(`User data for ${userId} is missing.`);
        }
        const currentVouchScore = userData.vouchScore || 80;
        const currentReschedules = userData.consecutiveReschedules || 0;
        const sessionsCompleted = userData.sessionsCompleted || 0;

        let pointsChange = 0;
        let reason = '';
        let newRescheduleCount = currentReschedules;
        let didCompleteSession = false;

        switch (eventType) {
            case 'COMPLETION_CONFIRMED':
                pointsChange = 2;
                newRescheduleCount = 0;
                didCompleteSession = true; // Flag that a session was completed
                reason = `Completed session`;
                break;
            case 'START_CONFIRMED':
                pointsChange = 0;
                reason = `Session started`;
                break;
            case 'COMPLETION_REPORTED_ISSUE':
                pointsChange = 0;
                reason = `Session issue reported`;
                break;
            case 'RESCHEDULED_WITH_NOTICE':
                newRescheduleCount++;
                if (newRescheduleCount >= 2) {
                    pointsChange = -5;
                    newRescheduleCount = 0;
                    reason = `2nd consecutive reschedule`;
                } else {
                    pointsChange = 0;
                    reason = `Session rescheduled`;
                }
                break;
            case 'CANCELLED_LOCKED_IN':
                pointsChange = -10;
                reason = `Cancelled locked-in session (no-show)`;
                break;
        }

        const newVouchScore = Math.max(0, Math.min(100, currentVouchScore + pointsChange));

        // ---> NEW: If the score changed, create a historical record <---
        if (pointsChange !== 0) {
            const historyRef = adminDb.collection(`users/${userId}/vouchHistory`);
            await historyRef.add({
                change: pointsChange,
                reason: reason,
                sessionId: sessionId,
                timestamp: FieldValue.serverTimestamp(),
                scoreBefore: currentVouchScore,
                scoreAfter: newVouchScore,
            });
        }

        // Update the main user document
        await userRef.update({
            vouchScore: newVouchScore,
            consecutiveReschedules: newRescheduleCount,
            // Increment sessionsCompleted count if applicable
            sessionsCompleted: didCompleteSession ? sessionsCompleted + 1 : sessionsCompleted,
        });

        return {
            newVouchScore: newVouchScore,
            success: true,
            message: `Vouch Score updated to ${newVouchScore}. Reason: ${reason}.`,
        };
    }
);