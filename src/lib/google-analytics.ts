import ReactGA from 'react-ga4';

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

// Initialize Google Analytics
export const initGA = () => {
  if (GA_TRACKING_ID && typeof window !== 'undefined') {
    ReactGA.initialize(GA_TRACKING_ID);
    
    // Enable debug mode in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Google Analytics initialized in development mode:', GA_TRACKING_ID);
    }
  } else if (process.env.NODE_ENV === 'development') {
    console.log('Google Analytics not initialized - NEXT_PUBLIC_GA_TRACKING_ID not set');
    console.log('This is normal for local development. Set up GA after deploying to production.');
  }
};

// Track page views
export const trackPageView = (path: string) => {
  if (GA_TRACKING_ID) {
    ReactGA.send({ hitType: 'pageview', page: path });
  } else if (process.env.NODE_ENV === 'development') {
    console.log('[GA Dev] Page view:', path);
  }
};

// Track custom events
export const trackEvent = (eventName: string, parameters?: Record<string, unknown>) => {
  if (GA_TRACKING_ID) {
    ReactGA.event(eventName, {
      ...parameters,
      timestamp: new Date().toISOString(),
    });
  } else if (process.env.NODE_ENV === 'development') {
    console.log('[GA Dev] Event:', eventName, parameters);
  }
};

// Session-specific tracking
export const sessionEvents = {
  sessionCreated: (sessionType: string, duration: number) => {
    trackEvent('session_created', {
      session_type: sessionType,
      duration_minutes: duration,
    });
  },

  sessionAccepted: (responseTime: number) => {
    trackEvent('session_accepted', {
      response_time_seconds: responseTime,
    });
  },

  sessionCompleted: (duration: number, vouchScoreChange: number) => {
    trackEvent('session_completed', {
      actual_duration_minutes: duration,
      vouch_score_change: vouchScoreChange,
    });
  },

  sessionCancelled: (reason: string, timeBeforeStart: number) => {
    trackEvent('session_cancelled', {
      cancellation_reason: reason,
      time_before_start_hours: timeBeforeStart,
    });
  },

  noShow: (userType: 'requester' | 'accepter') => {
    trackEvent('session_no_show', {
      user_type: userType,
    });
  }
};

// User behavior tracking
export const userEvents = {
  signUp: (method: string, university?: string) => {
    trackEvent('sign_up', {
      method,
      university,
    });
  },

  profileCompleted: () => {
    trackEvent('profile_completed');
  },

  vouchScoreUpdated: (newScore: number, change: number) => {
    trackEvent('vouch_score_updated', {
      new_score: newScore,
      score_change: change,
    });
  },

  dashboardView: (section: string) => {
    trackEvent('dashboard_view', {
      section,
    });
  }
};

// Admin analytics tracking
export const adminEvents = {
  analyticsViewed: () => {
    trackEvent('admin_analytics_viewed');
  },

  exportData: (dataType: string) => {
    trackEvent('admin_data_export', {
      data_type: dataType,
    });
  }
};
