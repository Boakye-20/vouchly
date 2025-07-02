// src/lib/vouch-score-client.ts (Production Version)
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from './firebase';

interface VouchScoreAdjustment {
    userId: string;
    sessionId: string;
    eventType: string;
}

function getEventMessage(eventType: string): string {
    const messages: { [key: string]: string } = {
        'COMPLETION_CONFIRMED': 'Session completed successfully! +2 points.',
        'UNILATERAL_NO_SHOW': 'No-show recorded. -10 points.',
        'MUTUAL_NO_SHOW': 'Mutual no-show recorded. -5 points.',
        'CONSECUTIVE_RESCHEDULE': 'Second consecutive reschedule. -5 points.',
        'REQUEST_ACCEPTED': 'Session accepted!',
        'REQUEST_DECLINED': 'Request declined.',
        'START_CONFIRMED': 'Session started!',
        'CANCELLED_WITH_NOTICE': 'Session cancelled.',
        'CANCELLED_LOCKED_IN': 'Session cancelled (locked-in). This counts as a no-show.',
        'RESCHEDULED_WITH_NOTICE': 'Reschedule request sent.',
    };
    return messages[eventType] || 'Action completed.';
}

function getScoreChange(eventType: string): number {
    const changes: { [key: string]: number } = {
        'COMPLETION_CONFIRMED': 2,
        'UNILATERAL_NO_SHOW': -10,
        'MUTUAL_NO_SHOW': -5,
        'CONSECUTIVE_RESCHEDULE': -5,
        'CANCELLED_LOCKED_IN': -10,
    };
    return changes[eventType] || 0;
}

async function addVouchHistory(userId: string, sessionId: string, eventType: string, scoreChange: number, previousScore: number, newScore: number) {
    const historyRef = collection(db, 'users', userId, 'vouchHistory');
    await addDoc(historyRef, {
        timestamp: serverTimestamp(),
        eventType: eventType,
        sessionId: sessionId,
        scoreChange: scoreChange,
        previousScore: previousScore,
        newScore: newScore,
    });
}

export async function adjustVouchScoreClient(params: VouchScoreAdjustment) {
    const { userId, sessionId, eventType } = params;

    try {
        const scoreChange = getScoreChange(eventType);

        // Only interact with the database if there's a score change or a reschedule event.
        if (scoreChange === 0 && eventType !== 'RESCHEDULED_WITH_NOTICE' && eventType !== 'COMPLETION_CONFIRMED') {
            return { success: true, message: getEventMessage(eventType) };
        }

        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error('User not found');
        }

        const userData = userSnap.data();
        const currentScore = userData.vouchScore || 80;
        const newScore = Math.max(0, Math.min(100, currentScore + scoreChange));

        const updates: any = {
            lastActivityDate: serverTimestamp(),
        };

        // Actually update the vouchScore field
        if (scoreChange !== 0) {
            updates.vouchScore = newScore;
        }

        // Handle reschedule tracking
        if (eventType === 'RESCHEDULED_WITH_NOTICE') {
            const currentConsecutive = userData.consecutiveReschedules || 0;
            updates.consecutiveReschedules = currentConsecutive + 1;

            if (currentConsecutive === 1) {
                const penaltyScore = Math.max(0, Math.min(100, currentScore - 5));
                updates.vouchScore = penaltyScore;
                updates.consecutiveReschedules = 0; // Reset counter

                await updateDoc(userRef, updates);
                await addVouchHistory(userId, sessionId, 'CONSECUTIVE_RESCHEDULE', -5, currentScore, penaltyScore);
                return { success: true, message: getEventMessage('CONSECUTIVE_RESCHEDULE') };
            }
        }

        // Reset consecutive reschedules and increment completed count on completion
        if (eventType === 'COMPLETION_CONFIRMED') {
            updates.consecutiveReschedules = 0;
            updates.sessionsCompleted = increment(1);
        }

        console.debug('[VOUCH DEBUG] About to update user doc', { userId, sessionId, eventType, updates });
        await updateDoc(userRef, updates);

        if (scoreChange !== 0) {
            console.debug('[VOUCH DEBUG] About to add vouchHistory', {
                userId, sessionId, eventType, scoreChange, currentScore, newScore
            });
            await addVouchHistory(userId, sessionId, eventType, scoreChange, currentScore, newScore);
        }

        console.debug('[VOUCH DEBUG] adjustVouchScoreClient success', { userId, sessionId, eventType });
        return { success: true, message: getEventMessage(eventType) };
    } catch (error) {
        console.error('[VOUCH DEBUG] Error adjusting vouch score:', {
            userId, sessionId, eventType, error
        });
        return { success: false, message: "Failed to update Vouch Score." };
    }
}