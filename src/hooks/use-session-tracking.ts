import { useCallback } from 'react';
import { sessionEvents } from '@/lib/google-analytics';

export function useSessionTracking() {
  const trackSessionCreated = useCallback((sessionType: string, duration: number) => {
    sessionEvents.sessionCreated(sessionType, duration);
  }, []);

  const trackSessionAccepted = useCallback((responseTimeMs: number) => {
    sessionEvents.sessionAccepted(Math.round(responseTimeMs / 1000));
  }, []);

  const trackSessionCompleted = useCallback((duration: number, vouchScoreChange: number) => {
    sessionEvents.sessionCompleted(duration, vouchScoreChange);
  }, []);

  const trackSessionCancelled = useCallback((reason: string, timeBeforeStartHours: number) => {
    sessionEvents.sessionCancelled(reason, timeBeforeStartHours);
  }, []);

  const trackNoShow = useCallback((userType: 'requester' | 'accepter') => {
    sessionEvents.noShow(userType);
  }, []);

  return {
    trackSessionCreated,
    trackSessionAccepted,
    trackSessionCompleted,
    trackSessionCancelled,
    trackNoShow,
  };
}
