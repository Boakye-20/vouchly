export interface UndoAction {
  id: string;
  action: 'CANCEL_SESSION';
  sessionId: string;
  previousState: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface UndoResponse {
  success: boolean;
  message: string;
}
