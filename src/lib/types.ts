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