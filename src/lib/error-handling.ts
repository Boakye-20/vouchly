/**
 * Centralized error handling function.
 * @param error - The error object or message.
 * @param context - A string providing context about where the error occurred.
 */
export function handleError(error: unknown, context: string) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`[${context}]:`, errorMessage);

  if (error instanceof Error && error.stack) {
    console.error('Stack trace:', error.stack);
  }

  // In a production environment, you might want to send this to a logging service
  // like Sentry, LogRocket, etc.
  // Example: Sentry.captureException(error, { extra: { context } });
}
