import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { toUKTime, getTimeDifference } from '@/lib/utils/timezone';

interface TimezonePreferences {
  studyingAbroadMode?: boolean;
  currentLocation?: string;
  timeFormat?: '12h' | '24h';
}

export function useTimezone() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<TimezonePreferences>({
    studyingAbroadMode: false,
    timeFormat: '24h',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load user preferences
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setPreferences({
            studyingAbroadMode: data.studyingAbroadMode || false,
            currentLocation: data.currentLocation,
            timeFormat: data.timeFormat || '24h',
          });
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Error loading timezone preferences:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Update preferences in Firestore
  const updatePreferences = async (updates: Partial<TimezonePreferences>) => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, updates);
      setPreferences(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating timezone preferences:', error);
      throw error;
    }
  };

  // Format time based on user preferences
  const formatTime = (
    date: Date | string | number,
    options: Intl.DateTimeFormatOptions = {}
  ) => {
    const formatOptions: Intl.DateTimeFormatOptions = {
      ...options,
      hour12: preferences.timeFormat === '12h',
    };

    return toUKTime(date, formatOptions);
  };

  // Get time difference message if studying abroad
  const getTimeDifferenceMessage = () => {
    if (!preferences.studyingAbroadMode || !preferences.currentLocation) {
      return null;
    }
    return `You are ${getTimeDifference(preferences.currentLocation)} UK time`;
  };

  return {
    ...preferences,
    isLoading,
    formatTime,
    getTimeDifferenceMessage,
    updatePreferences,
  };
}
