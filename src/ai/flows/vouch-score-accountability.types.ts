import { z } from 'genkit';

export const VouchScoreEventInputSchema = z.object({
  userId: z.number().describe('The ID of the user whose vouch score needs adjustment.'),
  sessionId: z.number().describe('The ID of the session related to the event.'),
  eventType: z.enum(['COMPLETION_CONFIRMED', 'COMPLETION_REPORTED_ISSUE', 'RESCHEDULED_WITH_NOTICE', 'CANCELLED_LOCKED_IN']).describe('The type of event that occurred.'),
});
export type VouchScoreEventInput = z.infer<typeof VouchScoreEventInputSchema>;

export const VouchScoreEventOutputSchema = z.object({
  newVouchScore: z.number().describe("The user's new vouch score after the adjustment."),
  success: z.boolean().describe('Whether the vouch score adjustment was successful.'),
  message: z.string().describe('A message indicating the result of the vouch score adjustment.'),
});
export type VouchScoreEventOutput = z.infer<typeof VouchScoreEventOutputSchema>;
