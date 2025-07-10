import { NotificationType } from '@/types/notifications';
import { sendNotification as sendNotif } from '../notifications';

interface SendNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  data?: Record<string, any>;
  sendEmail?: boolean;
  email?: string;
}

export async function sendNotification({
  userId,
  type,
  title,
  message,
  link,
  data,
  sendEmail = true,
  email,
}: SendNotificationParams) {
  // Common actions based on notification type
  const getActions = () => {
    switch (type) {
      case 'session_request':
        return [
          { label: 'Accept', action: `accept:${data?.sessionId}`, variant: 'default' as const },
          { label: 'Decline', action: `decline:${data?.sessionId}`, variant: 'outline' as const },
        ];
      case 'reschedule_request':
        return [
          { label: 'Accept New Time', action: `accept_reschedule:${data?.sessionId}`, variant: 'default' as const },
          { label: 'Suggest New Time', action: `suggest_reschedule:${data?.sessionId}`, variant: 'outline' as const },
        ];
      default:
        return [];
    }
  };

  return sendNotif({
    userId,
    type,
    title,
    message,
    link,
    data,
    actions: getActions(),
    sendEmail,
    email,
  });
}

// Helper functions for common notification types
export const notificationTemplates = {
  sessionRequest: (params: {
    userId: string;
    sessionId: string;
    partnerName: string;
    scheduledTime: Date;
    timezone: string;
    email?: string;
  }) => {
    const formattedTime = new Date(params.scheduledTime).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: params.timezone,
    });

    return sendNotification({
      userId: params.userId,
      type: 'session_request',
      title: 'New Session Request',
      message: `${params.partnerName} has requested a study session on ${formattedTime}`,
      link: `/sessions/${params.sessionId}`,
      data: {
        sessionId: params.sessionId,
        scheduledTime: params.scheduledTime.toISOString(),
        timezone: params.timezone,
      },
      email: params.email,
    });
  },

  sessionAccepted: (params: {
    userId: string;
    sessionId: string;
    partnerName: string;
    scheduledTime: Date;
    timezone: string;
    email?: string;
  }) => {
    const formattedTime = new Date(params.scheduledTime).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: params.timezone,
    });

    return sendNotification({
      userId: params.userId,
      type: 'session_accepted',
      title: 'Session Confirmed',
      message: `${params.partnerName} has accepted your session request for ${formattedTime}`,
      link: `/sessions/${params.sessionId}`,
      data: {
        sessionId: params.sessionId,
        scheduledTime: params.scheduledTime.toISOString(),
      },
      email: params.email,
    });
  },

  rescheduleRequest: (params: {
    userId: string;
    sessionId: string;
    partnerName: string;
    oldTime: Date;
    newTime: Date;
    timezone: string;
    email?: string;
  }) => {
    const formatTime = (date: Date) =>
      date.toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: params.timezone,
      });

    return sendNotification({
      userId: params.userId,
      type: 'reschedule_request',
      title: 'Reschedule Request',
      message: `${params.partnerName} has requested to reschedule your session from ${formatTime(
        params.oldTime
      )} to ${formatTime(params.newTime)}`,
      link: `/sessions/${params.sessionId}`,
      data: {
        sessionId: params.sessionId,
        oldTime: params.oldTime.toISOString(),
        newTime: params.newTime.toISOString(),
        timezone: params.timezone,
      },
      email: params.email,
    });
  },

  sessionReminder: (params: {
    userId: string;
    sessionId: string;
    partnerName: string;
    scheduledTime: Date;
    timezone: string;
    email?: string;
  }) => {
    const formattedTime = new Date(params.scheduledTime).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: params.timezone,
    });

    return sendNotification({
      userId: params.userId,
      type: 'session_reminder',
      title: 'Upcoming Session',
      message: `Your session with ${params.partnerName} is coming up at ${formattedTime}`,
      link: `/sessions/${params.sessionId}`,
      data: {
        sessionId: params.sessionId,
        scheduledTime: params.scheduledTime.toISOString(),
      },
      email: params.email,
    });
  },

  sessionCancelled: (params: {
    userId: string;
    sessionId: string;
    partnerName: string;
    scheduledTime: Date;
    timezone: string;
    reason: string;
    email?: string;
  }) => {
    const formattedTime = new Date(params.scheduledTime).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: params.timezone,
    });

    return sendNotification({
      userId: params.userId,
      type: 'session_cancelled',
      title: 'Session Cancelled',
      message: `Your session with ${params.partnerName} scheduled for ${formattedTime} has been cancelled. ${params.reason}`,
      link: `/sessions/${params.sessionId}`,
      data: {
        sessionId: params.sessionId,
        scheduledTime: params.scheduledTime.toISOString(),
        reason: params.reason,
      },
      email: params.email,
    });
  },

  sessionCompleted: (params: {
    userId: string;
    sessionId: string;
    partnerName: string;
    scheduledTime: Date;
    timezone: string;
    email?: string;
  }) => {
    const formattedDate = new Date(params.scheduledTime).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: params.timezone,
    });

    return sendNotification({
      userId: params.userId,
      type: 'session_completed',
      title: 'Session Completed',
      message: `Great job completing your session with ${params.partnerName} on ${formattedDate}!`,
      link: `/sessions/${params.sessionId}/feedback`,
      data: {
        sessionId: params.sessionId,
        completedAt: new Date().toISOString(),
      },
      email: params.email,
    });
  },
};

// No need to re-export since it's already exported above
