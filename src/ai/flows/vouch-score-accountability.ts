'use server';
/**
 * @fileOverview A flow that automatically adjusts a user's Vouch score based on their participation and reliability in study sessions.
 *
 * - adjustVouchScore - A function that handles the vouch score adjustment process.
 * - VouchScoreEventInput - The input type for the adjustVouchScore function.
 * - VouchScoreEventOutput - The return type for the adjustVouchScore function.
 */

import { ai } from '@/ai/genkit';
import {
  VouchScoreEventInputSchema,
  type VouchScoreEventInput,
  VouchScoreEventOutputSchema,
  type VouchScoreEventOutput,
} from './vouch-score-accountability.types';

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
  async ({ userId, eventType }) => {
    // NOTE: This is a simulation. In a real app, we would fetch the user from a database.
    // We'll use a mock user state to demonstrate the logic from the PRD.
    // Setting consecutive_reschedules to 1 to test the penalty on the next reschedule.
    const mockUser = { vouch_score: 80, consecutive_reschedules: 1 };

    let pointsChange = 0;
    let reason = '';
    let newRescheduleCount = mockUser.consecutive_reschedules;

    switch (eventType) {
      case 'COMPLETION_CONFIRMED':
        pointsChange = 2;
        newRescheduleCount = 0; // Reset counter on successful completion
        reason = `Vouch Score increased by ${pointsChange} for successfully completing a session. Consecutive reschedule counter reset.`;
        break;
      
      case 'COMPLETION_REPORTED_ISSUE':
        pointsChange = 0;
        reason = `Thank you for your feedback. This session has been flagged for review. Your Vouch Score is not affected.`;
        break;

      case 'RESCHEDULED_WITH_NOTICE':
        newRescheduleCount++;
        if (newRescheduleCount >= 2) {
          pointsChange = -5;
          newRescheduleCount = 0; // Reset after penalty
          reason = `Vouch Score decreased by ${Math.abs(pointsChange)} due to a second consecutive reschedule. The counter has been reset.`;
        } else {
          pointsChange = 0;
          reason = `Session rescheduled. Note: a second consecutive reschedule will incur a penalty.`;
        }
        break;

      case 'CANCELLED_LOCKED_IN':
        pointsChange = -10;
        reason = `Vouch Score decreased by ${Math.abs(pointsChange)} due to a no-show (cancelling a locked-in session).`;
        break;
    }

    const newVouchScore = Math.max(0, Math.min(100, mockUser.vouch_score + pointsChange));

    // In a real app, you would save the newVouchScore and newRescheduleCount to the database here.

    return {
      newVouchScore: newVouchScore,
      success: true,
      message: reason,
    };
  }
);
