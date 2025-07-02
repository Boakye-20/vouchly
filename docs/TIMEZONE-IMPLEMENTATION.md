# Timezone Implementation Guide

This document outlines the timezone handling implementation in Vouchly, which ensures consistent time display and handling across the application, especially important for UK university students who may be studying abroad.

## Key Components

1. **Timezone Utilities** (`/src/lib/utils/timezone.ts`)
   - Core functions for timezone conversion and formatting
   - Handles conversion between UTC and UK time
   - Provides time difference calculations

2. **Timezone Context** (`/src/contexts/timezone-context.tsx`)
   - React context for timezone preferences
   - Manages user's timezone settings
   - Provides time formatting functions

3. **Time Display Component** (`/src/components/ui/time-display.tsx`)
   - Reusable component for displaying dates and times
   - Handles relative time formatting (e.g., "2 hours ago")
   - Supports tooltips with additional timezone information

4. **Timezone Settings** (`/src/components/settings/timezone-settings.tsx`)
   - UI for users to configure their timezone preferences
   - Options for 12/24 hour format
   - Study abroad mode for timezone differences

## Data Storage

- All timestamps are stored in UTC in Firestore
- User preferences are stored in the user document:
  ```typescript
  interface UserPreferences {
    studyingAbroadMode?: boolean;
    currentLocation?: string;  // IANA timezone name (e.g., "Europe/London")
    timeFormat?: '12h' | '24h';
  }
  ```

## Migration

To migrate existing session data to use UTC timestamps:

1. Make sure you have the latest Firestore rules and indexes deployed
2. Run the migration script:
   ```bash
   npx ts-node scripts/migrate-sessions-to-utc.ts
   ```

## Best Practices

1. **Always use the TimeDisplay component** for showing dates/times to users
2. **Store all timestamps in UTC** using Firestore's `Timestamp`
3. **Use the timezone utilities** for any timezone conversions
4. **Test with different timezones** to ensure consistent behavior

## Testing

Test the implementation by:
1. Setting different timezones in user settings
2. Verifying that session times display correctly
3. Creating and viewing sessions across different timezones
4. Testing the migration script with a backup of your production data

## Future Improvements

1. Add more timezone options for international students
2. Implement automatic timezone detection
3. Add support for DST changes
4. Add more date/time formatting options
