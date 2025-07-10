// Session state machine for Vouchly
// Defines all valid session states and allowed transitions

export type SessionStatus =
    | 'requested'
    | 'scheduled'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'pending_cancellation'
    | 'no_show'; // Added for no-show detection

export const SESSION_STATES: SessionStatus[] = [
    'requested',
    'scheduled',
    'in_progress',
    'completed',
    'cancelled',
    'pending_cancellation',
    'no_show',
];

// Allowed transitions: fromState -> [toStates]
export const SESSION_TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
    requested: ['scheduled', 'cancelled', 'pending_cancellation'],
    scheduled: ['in_progress', 'cancelled', 'pending_cancellation', 'no_show'],
    in_progress: ['completed', 'cancelled', 'pending_cancellation'],
    pending_cancellation: ['scheduled', 'in_progress', 'cancelled'], // Can revert or confirm
    completed: [],
    cancelled: [],
    no_show: [],
};

export function isValidSessionTransition(from: SessionStatus, to: SessionStatus): boolean {
    return SESSION_TRANSITIONS[from]?.includes(to);
}
