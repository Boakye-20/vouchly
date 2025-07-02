/**
 * Timezone utilities for consistent time handling across the application
 * All times are stored in UTC and converted to UK time for display
 */

export const UK_TIMEZONE = 'Europe/London';

/**
 * Converts any Date to UTC
 */
export function toUTC(date: Date | string | number): Date {
  if (date instanceof Date) {
    return new Date(date.toISOString());
  }
  return new Date(date);
}

/**
 * Converts a UTC date to UK time string for display
 */
export function toUKTime(
  utcDate: Date | string | number,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const date = toUTC(utcDate);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: UK_TIMEZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
    hour12: false
  };

  return new Intl.DateTimeFormat('en-GB', { ...defaultOptions, ...options }).format(date);
}

/**
 * Gets the time difference between a location and UK time
 */
export function getTimeDifference(location: string): string {
  // This is a simplified version - in production, you'd use a timezone library
  // like moment-timezone or date-fns-tz for accurate timezone calculations
  const now = new Date();
  const ukTime = new Date(now.toLocaleString('en-US', { timeZone: UK_TIMEZONE }));
  const localTime = new Date(now.toLocaleString('en-US', { timeZone: location }));
  
  const diffHours = (localTime.getTime() - ukTime.getTime()) / (1000 * 60 * 60);
  
  if (diffHours === 0) return 'same time as';
  return diffHours > 0 
    ? `${Math.abs(diffHours)} hours ahead of` 
    : `${Math.abs(diffHours)} hours behind`;
}

/**
 * Converts a time string to UTC based on UK time
 */
export function parseUKTimeToUTC(timeString: string, referenceDate: Date = new Date()): Date {
  // Implementation depends on your date parsing needs
  // This is a simplified version
  return new Date(timeString);
}
