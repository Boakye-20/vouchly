// vouch-score-accountability.ts
'use server';
/**
 * @fileOverview A flow that automatically adjusts a user's Vouch score based on their participation and reliability in study sessions.
 *
 * - adjustVouchScore - A function that handles the vouch score adjustment process.
 * - VouchScoreEventInput - The input type for the adjustVouchScore function.
 * - VouchScoreEventOutput - The return type for the adjustVouchScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const VouchScoreEventInputSchema = z.object({
  userId: z.number().describe('The ID of the user whose vouch score needs adjustment.'),
  sessionId: z.number().describe('The ID of the session related to the event.'),
  eventType: z.enum(['COMPLETED', 'REPORTED_ISSUE', 'RESCHEDULED']).describe('The type of event that occurred.'),
});
export type VouchScoreEventInput = z.infer<typeof VouchScoreEventInputSchema>;

export const VouchScoreEventOutputSchema = z.object({
  newVouchScore: z.number().describe("The user's new vouch score after the adjustment."),
  success: z.boolean().describe('Whether the vouch score adjustment was successful.'),
  message: z.string().describe('A message indicating the result of the vouch score adjustment.'),
});
export type VouchScoreEventOutput = z.infer<typeof VouchScoreEventOutputSchema>;

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
    const mockUser = { vouch_score: 80, consecutive_reschedules: 0 }; // Example starting state.

    let pointsChange = 0;
    let reason = '';
    let newRescheduleCount = mockUser.consecutive_reschedules;

    switch (eventType) {
      case 'COMPLETED':
        pointsChange = 2;
        newRescheduleCount = 0; // Reset counter on successful completion
        reason = `Vouch Score increased by ${pointsChange} for successfully completing a session.`;
        break;
      
      case 'REPORTED_ISSUE':
        pointsChange = 0;
        reason = `Thank you for your feedback. This session has been flagged for review. Your Vouch Score is not affected.`;
        break;

      case 'RESCHEDULED':
        newRescheduleCount++;
        if (newRescheduleCount >= 2) {
          pointsChange = -5;
          newRescheduleCount = 0; // Reset after penalty
          reason = `Vouch Score decreased by ${Math.abs(pointsChange)} due to a second consecutive reschedule.`;
        } else {
          pointsChange = 0;
          reason = `Session rescheduled. Note: a second consecutive reschedule will incur a penalty.`;
        }
        break;
    }

    const newVouchScore = Math.max(0, Math.min(100, mockUser.vouch_score + pointsChange));

    return {
      newVouchScore: newVouchScore,
      success: true,
      message: reason,
    };
  }
);
