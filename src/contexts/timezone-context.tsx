'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth-context';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toUKTime } from '@/lib/utils/timezone';

interface TimezoneContextType {
  isStudyingAbroad: boolean;
  currentLocation: string | undefined;
  timeFormat: '12h' | '24h';
  formatTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  getTimeDifferenceMessage: () => string | null;
  isLoading: boolean;
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined);

export function TimezoneProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isStudyingAbroad, setIsStudyingAbroad] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>();
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('24h');
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
          setIsStudyingAbroad(!!data.studyingAbroadMode);
          setCurrentLocation(data.currentLocation);
          setTimeFormat(data.timeFormat || '24h');
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

  // Format time based on user preferences
  const formatTime = (
    date: Date | string | number,
    options: Intl.DateTimeFormatOptions = {}
  ) => {
    const formatOptions: Intl.DateTimeFormatOptions = {
      ...options,
      hour12: timeFormat === '12h',
    };

    return toUKTime(date, formatOptions);
  };

  // Get time difference message if studying abroad
  const getTimeDifferenceMessage = () => {
    if (!isStudyingAbroad || !currentLocation) {
      return null;
    }
    
    try {
      const now = new Date();
      const ukTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }));
      const localTime = new Date(now.toLocaleString('en-US', { timeZone: currentLocation }));
      
      const diffHours = Math.round((localTime.getTime() - ukTime.getTime()) / (1000 * 60 * 60));
      
      if (diffHours === 0) return 'same time as';
      return diffHours > 0 
        ? `${Math.abs(diffHours)} hours ahead of` 
        : `${Math.abs(diffHours)} hours behind`;
    } catch (error) {
      console.error('Error calculating time difference:', error);
      return null;
    }
  };

  const value = {
    isStudyingAbroad,
    currentLocation,
    timeFormat,
    formatTime,
    getTimeDifferenceMessage,
    isLoading,
  };

  return (
    <TimezoneContext.Provider value={value}>
      {children}
    </TimezoneContext.Provider>
  );
}

export function useTimezone() {
  const context = useContext(TimezoneContext);
  if (context === undefined) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
}
