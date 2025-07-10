import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, subDays, startOfDay, endOfDay } from 'date-fns';
import { rateLimit } from '@/lib/utils/rate-limit';

export async function GET(request: NextRequest) {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const { allowed, retryAfter } = rateLimit(ip as string);
    if (!allowed) {
        return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429, headers: { 'Retry-After': retryAfter?.toString() || '60' } });
    }

    try {
        const authHeader = request.headers.get('authorization');
        console.log('Auth header:', authHeader ? 'Present' : 'Missing');

        if (!authHeader?.startsWith('Bearer ')) {
            console.log('Invalid auth header format');
            return NextResponse.json({ error: 'Unauthorized - No valid authorization header' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        console.log('Token length:', token.length);

        let userId: string;
        try {
            const decodedToken = await adminAuth.verifyIdToken(token);
            userId = decodedToken.uid;
            console.log('User ID:', userId);
        } catch (tokenError) {
            console.error('Token verification failed:', tokenError);
            return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
        }

        // Get user's sessions
        const sessionsRef = adminDb.collection('sessions');
        const sessionsQuery = sessionsRef
            .where('participants', 'array-contains', userId)
            .orderBy('startTime', 'desc');
        const sessionsSnapshot = await sessionsQuery.get();
        const sessions = sessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

        // If no sessions, return default stats
        if (!sessions || sessions.length === 0) {
            // Fetch user vouchScore from Firestore
            const userRef = adminDb.collection('users').doc(userId);
            const userDoc = await userRef.get();
            const userData = userDoc.data();
            const vouchScore = userData?.vouchScore ?? 0;
            return NextResponse.json({
                totalSessions: 0,
                completedSessions: 0,
                cancelledSessions: 0,
                avgSessionDuration: 0,
                vouchScore,
                vouchScoreHistory: [],
                sessions: [],
                earlyEndingStats: {
                    count: 0,
                    percentage: 0,
                    lastOccurrence: ''
                },
            });
        }

        // Calculate basic stats
        const totalSessions = sessions.length;
        const completedSessions = sessions.filter(s => s.status === 'completed').length;
        const cancelledSessions = sessions.filter(s => s.status === 'cancelled').length;

        const completedSessionDurations = sessions
            .filter(s => s.status === 'completed' && s.actualDuration)
            .map(s => s.actualDuration);
        const avgSessionDuration = completedSessionDurations.length > 0
            ? Math.round(completedSessionDurations.reduce((a: number, b: number) => a + b, 0) / completedSessionDurations.length)
            : 0;

        // Get user's vouch score
        const userRef = adminDb.collection('users').doc(userId);
        const userDoc = await userRef.get();
        const userData = userDoc.data();
        const vouchScore = userData?.vouchScore ?? 0;

        // Get vouch score history
        const vouchHistoryRef = adminDb.collection('vouchScoreHistory');
        const vouchHistoryQuery = vouchHistoryRef
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(20);
        const vouchHistorySnapshot = await vouchHistoryQuery.get();
        const vouchScoreHistory = vouchHistorySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                date: format(data.timestamp.toDate(), 'MMM dd'),
                score: data.newScore,
                change: data.scoreChange,
                reason: data.reason || 'Session completion'
            };
        });

        // Get study partners
        const partnerStats = new Map();
        sessions.forEach(session => {
            if (session.status === 'completed') {
                const partnerId = session.participants.find((id: string) => id !== userId);
                if (partnerId) {
                    const partnerName = session.participantNames?.[partnerId] || 'Unknown';
                    const existing = partnerStats.get(partnerName) || { sessions: 0, ratings: [], lastSession: '' };
                    existing.sessions++;
                    if (session.ratings?.[userId]) {
                        existing.ratings.push(session.ratings[userId]);
                    }
                    if (!existing.lastSession || session.endTime > existing.lastSession) {
                        existing.lastSession = session.endTime;
                    }
                    partnerStats.set(partnerName, existing);
                }
            }
        });

        const studyPartners = Array.from(partnerStats.entries()).map(([name, stats]) => ({
            name,
            sessions: stats.sessions,
            lastSession: stats.lastSession ? format(stats.lastSession.toDate(), 'MMM dd') : 'Never',
            avgRating: stats.ratings.length > 0
                ? stats.ratings.reduce((a: number, b: number) => a + b, 0) / stats.ratings.length
                : 0
        }));

        // Calculate weekly activity
        const weekStart = startOfWeek(new Date());
        const weekDays = eachDayOfInterval({
            start: weekStart,
            end: new Date()
        });

        const weeklyActivity = weekDays.map(day => {
            const dayStart = startOfDay(day);
            const dayEnd = endOfDay(day);
            const daySessions = sessions.filter(s => {
                const sessionTime = s.startTime.toDate();
                return sessionTime >= dayStart && sessionTime <= dayEnd;
            });
            return {
                name: format(day, 'EEE'),
                sessions: daySessions.length,
                completed: daySessions.filter(s => s.status === 'completed').length
            };
        });

        // Session duration distribution
        const sessionDurationDistribution = {
            '30min': sessions.filter(s => s.duration === 30).length,
            '60min': sessions.filter(s => s.duration === 60).length,
            '90min': sessions.filter(s => s.duration === 90).length,
            '120min': sessions.filter(s => s.duration === 120).length,
        };

        // Early ending stats
        const earlyEndingSessions = sessions.filter(s =>
            s.status === 'completed' && s.endedEarly
        );
        const earlyEndingStats = {
            count: earlyEndingSessions.length,
            percentage: totalSessions > 0 ? Math.round((earlyEndingSessions.length / totalSessions) * 100) : 0,
            lastOccurrence: earlyEndingSessions.length > 0
                ? format(earlyEndingSessions[0].endTime.toDate(), 'MMM dd, yyyy')
                : null
        };

        // Generate achievements
        const achievements = [
            {
                name: 'First Session',
                description: 'Complete your first study session',
                earned: totalSessions > 0,
                progress: Math.min(totalSessions, 1),
                target: 1
            },
            {
                name: 'Study Streak',
                description: 'Complete 5 sessions in a week',
                earned: weeklyActivity.some(day => day.completed >= 5),
                progress: Math.max(...weeklyActivity.map(day => day.completed)),
                target: 5
            },
            {
                name: 'Reliable Partner',
                description: 'Maintain a vouch score above 85',
                earned: vouchScore >= 85,
                progress: vouchScore,
                target: 85
            },
            {
                name: 'Social Butterfly',
                description: 'Study with 10 different partners',
                earned: studyPartners.length >= 10,
                progress: studyPartners.length,
                target: 10
            },
            {
                name: 'Marathon Runner',
                description: 'Complete a 2-hour session',
                earned: sessionDurationDistribution['120min'] > 0,
                progress: sessionDurationDistribution['120min'],
                target: 1
            },
            {
                name: 'Consistency King',
                description: 'Complete 20 sessions total',
                earned: completedSessions >= 20,
                progress: completedSessions,
                target: 20
            }
        ];

        const stats = {
            totalSessions,
            completedSessions,
            cancelledSessions,
            avgSessionDuration,
            vouchScore,
            vouchScoreHistory,
            studyPartners,
            weeklyActivity,
            sessionDurationDistribution,
            earlyEndingStats,
            achievements
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 