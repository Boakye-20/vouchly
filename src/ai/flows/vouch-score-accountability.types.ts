import { z } from 'genkit';

// --- CORRECTED SCHEMA ---
// The userId and sessionId have been changed from z.number() to z.string()
// to match the data types of Firebase Auth UIDs and Firestore Document IDs.
export const VouchScoreEventInputSchema = z.object({
    userId: z.string().describe('The ID of the user whose vouch score needs adjustment.'),
    sessionId: z.string().describe('The ID of the session related to the event.'),
    eventType: z.enum([
        'COMPLETION_CONFIRMED',
        'COMPLETION_REPORTED_ISSUE',
        'RESCHEDULED_WITH_NOTICE',
        'CANCELLED_LOCKED_IN',
        'START_CONFIRMED',
        // It's good practice to include all possible events here
        'REQUEST_ACCEPTED',
        'REQUEST_DECLINED',
        'CANCELLED_WITH_NOTICE'
    ]).describe('The type of event that occurred.'),
});
export type VouchScoreEventInput = z.infer<typeof VouchScoreEventInputSchema>;


export const VouchScoreEventOutputSchema = z.object({
    newVouchScore: z.number().describe("The user's new vouch score after the adjustment."),
    success: z.boolean().describe('Whether the vouch score adjustment was successful.'),
    message: z.string().describe('A message indicating the result of the vouch score adjustment.'),
});
export type VouchScoreEventOutput = z.infer<typeof VouchScoreEventOutputSchema>;