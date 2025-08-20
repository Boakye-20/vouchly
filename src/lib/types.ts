export interface VouchlyUser {
    uid: string;
    email: string;
    name: string;
    university: string;
    course: string;
    subjectGroup: string;
    yearOfStudy: string;
    vouchScore: number;
    sessionsCompleted: number;
    availability: {
        morning: string[];
        afternoon: string[];
        evening: string[];
    };
    coStudyingAtmosphere: 'Silent & Independent' | 'Quietly Co-working' | 'Motivational & Social';
    cameraPreference: string;
    bio?: string;
    weeklyGoal?: number;
    status: 'available' | 'busy' | 'offline';
    createdAt: Date;
}

export interface SessionDispute {
    id: string; // Firestore doc ID
    sessionId: string;
    reportedBy: string; // userId
    reportedAgainst: string; // userId
    reason: string; // e.g., "no-show", "inappropriate behaviour", "technical issue"
    description: string;
    evidenceUrls?: string[]; // links to uploaded files/screenshots
    status: 'open' | 'under_review' | 'resolved' | 'rejected' | 'appealed';
    adminNotes?: string;
    resolution?: string;
    createdAt: Date;
    updatedAt: Date;
}