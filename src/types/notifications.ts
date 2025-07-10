export type NotificationType =
    | 'session_request'
    | 'session_accepted'
    | 'session_declined'
    | 'session_reminder'
    | 'session_cancelled'
    | 'session_completed'
    | 'reschedule_request'
    | 'reschedule_accepted'
    | 'reschedule_declined'
    | 'message_received'
    | 'vouch_score_updated'
    | 'inactive_reminder'
    | 'system';

export interface NotificationData {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    read: boolean;
    data?: Record<string, any>;
    createdAt: Date;
    expiresAt?: Date;
    actions?: {
        label: string;
        action: string;
        variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    }[];
}

export const NOTIFICATION_TITLES: Record<NotificationType, string> = {
    session_request: 'New Session Request',
    session_accepted: 'Session Accepted',
    session_declined: 'Session Declined',
    session_reminder: 'Upcoming Session',
    session_cancelled: 'Session Cancelled',
    session_completed: 'Session Completed',
    reschedule_request: 'Reschedule Request',
    reschedule_accepted: 'Reschedule Accepted',
    reschedule_declined: 'Reschedule Declined',
    message_received: 'New Message',
    vouch_score_updated: 'Vouch Score Updated',
    inactive_reminder: 'We Miss You!',
    system: 'System Notification'
};

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
    session_request: 'calendar-plus',
    session_accepted: 'calendar-check',
    session_declined: 'calendar-x',
    session_completed: 'check-circle',
    session_reminder: 'bell',
    session_cancelled: 'calendar-off',
    reschedule_request: 'calendar-clock',
    reschedule_accepted: 'calendar-check',
    reschedule_declined: 'calendar-x',
    message_received: 'message-square',
    vouch_score_updated: 'award',
    inactive_reminder: 'heart',
    system: 'info'
};
