// Session state machine for Vouchly
// Defines all valid session states and allowed transitions

export type SessionStatus =
  | 'requested'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export const SESSION_STATES: SessionStatus[] = [
  'requested',
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
];

// Allowed transitions: fromState -> [toStates]
export const SESSION_TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
  requested: ['scheduled', 'cancelled'],
  scheduled: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export function isValidSessionTransition(from: SessionStatus, to: SessionStatus): boolean {
  return SESSION_TRANSITIONS[from]?.includes(to);
}
