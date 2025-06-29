"use server";

import { adjustVouchScore, type VouchScoreEventInput } from "@/ai/flows/vouch-score-accountability";

export async function adjustVouchScoreAction(input: VouchScoreEventInput) {
  try {
    const result = await adjustVouchScore(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in adjustVouchScoreAction:", error);
    return { success: false, error: "Failed to adjust Vouch Score." };
  }
}
