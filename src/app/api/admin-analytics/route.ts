import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { subDays, format, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';

export async function GET(req: NextRequest) {
    try {
        // Fetch all sessions
        const sessionsSnapshot = await adminDb.collection('sessions').get();
        const sessions = sessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch all users for detailed analytics
        const usersSnapshot = await adminDb.collection('users').get();
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch active users (users with any session activity in the last 30 days)
        const monthAgo = subDays(new Date(), 30);
        const activeUsersSnapshot = await adminDb.collection('sessions')
            .where('createdAt', '>=', monthAgo)
            .select('userId')
            .get();
        const uniqueUserIds = new Set(activeUsersSnapshot.docs.map(doc => doc.data().userId));
        const activeUsers = uniqueUserIds.size;

        // Calculate basic metrics
        const totalSessions = sessions.length;
        const completedSessions = sessions.filter((s: any) => s.status === 'completed').length;
        const cancelledSessions = sessions.filter((s: any) => s.status === 'cancelled').length;
        const noShowSessions = sessions.filter((s: any) => s.status === 'no_show').length;
        const rescheduledSessions = sessions.filter((s: any) => s.status === 'rescheduled').length;
        const completionRate = totalSessions > 0 ? (completedSessions / totalSessions * 100).toFixed(1) + '%' : '0%';
        const totalDuration = sessions.filter((s: any) => s.durationMinutes).reduce((acc: number, curr: any) => acc + (curr.durationMinutes || 0), 0);
        const avgDuration = totalSessions > 0 ? `${Math.round(totalDuration / totalSessions)}m` : '0m';
        const noShowRate = totalSessions > 0 ? `${((noShowSessions / totalSessions) * 100).toFixed(1)}%` : '0%';
        const rescheduleRate = totalSessions > 0 ? `${((rescheduledSessions / totalSessions) * 100).toFixed(1)}%` : '0%';

        // Enhanced metrics
        const totalUsers = users.length;
        const verifiedUsers = users.filter((u: any) => u.emailVerified).length;
        const usersWithSessions = users.filter((u: any) => u.sessionsCompleted > 0).length;
        const avgVouchScore = users.length > 0 ? Math.round(users.reduce((acc: number, u: any) => acc + (u.vouchScore || 80), 0) / users.length) : 80;

        // University usage statistics
        const universityStats = users.reduce((acc: any, user: any) => {
            const uni = user.university || 'Unknown';
            if (!acc[uni]) {
                acc[uni] = { count: 0, sessions: 0, avgScore: 0 };
            }
            acc[uni].count++;
            acc[uni].sessions += user.sessionsCompleted || 0;
            acc[uni].avgScore += user.vouchScore || 80;
            return acc;
        }, {});

        // Calculate averages for universities
        Object.keys(universityStats).forEach(uni => {
            universityStats[uni].avgScore = Math.round(universityStats[uni].avgScore / universityStats[uni].count);
        });

        // Top universities by user count
        const topUniversities = Object.entries(universityStats)
            .map(([uni, stats]: [string, any]) => ({
                name: uni,
                users: stats.count,
                sessions: stats.sessions,
                avgScore: stats.avgScore
            }))
            .sort((a, b) => b.users - a.users)
            .slice(0, 10);

        // Popular study times
        const timeSlots = sessions.reduce((acc: any, session: any) => {
            if (session.scheduledStartTime) {
                const hour = session.scheduledStartTime.toDate().getHours();
                const timeSlot = `${hour}:00-${hour + 1}:00`;
                acc[timeSlot] = (acc[timeSlot] || 0) + 1;
            }
            return acc;
        }, {});

        const popularTimes = Object.entries(timeSlots)
            .map(([time, count]) => ({ time, count: count as number }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);

        // Vouch score distribution
        const scoreRanges = {
            '90-100': 0,
            '80-89': 0,
            '70-79': 0,
            '60-69': 0,
            '0-59': 0
        };

        users.forEach((user: any) => {
            const score = user.vouchScore || 80;
            if (score >= 90) scoreRanges['90-100']++;
            else if (score >= 80) scoreRanges['80-89']++;
            else if (score >= 70) scoreRanges['70-79']++;
            else if (score >= 60) scoreRanges['60-69']++;
            else scoreRanges['0-59']++;
        });

        // Session duration distribution
        const durationRanges = {
            '30min': 0,
            '60min': 0,
            '90min': 0,
            '120min': 0
        };

        sessions.forEach((session: any) => {
            const duration = session.durationMinutes;
            if (duration === 30) durationRanges['30min']++;
            else if (duration === 60) durationRanges['60min']++;
            else if (duration === 90) durationRanges['90min']++;
            else if (duration === 120) durationRanges['120min']++;
        });

        // Early ending statistics
        const earlyEndingUsers = users.filter((u: any) => (u.earlyEndingCount || 0) > 0).length;
        const avgEarlyEndingPercentage = users
            .filter((u: any) => u.earlyEndingPercentage)
            .reduce((acc: number, u: any) => acc + (u.earlyEndingPercentage || 0), 0) /
            users.filter((u: any) => u.earlyEndingPercentage).length || 0;

        // Weekly trend calculation
        const now = new Date();
        const weekAgoDay = subDays(now, 7);

        interface DayData {
            name: string;
            date: Date;
            sessions: number;
            completed: number;
        }

        const days: DayData[] = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekAgoDay);
            date.setDate(weekAgoDay.getDate() + i);
            days.push({
                name: date.toLocaleDateString('en-US', { weekday: 'short' }),
                date: startOfDay(date),
                sessions: 0,
                completed: 0,
            });
        }
        sessions.forEach((session: any) => {
            const sessionDate = session.scheduledStartTime?.toDate?.() || session.createdAt?.toDate?.();
            if (!sessionDate) return;
            const day = days.find(d => sessionDate >= d.date && sessionDate < new Date(d.date.getTime() + 24 * 60 * 60 * 1000));
            if (day) {
                day.sessions++;
                if (session.status === 'completed') day.completed++;
            }
        });
        const weeklyTrend = days.map(({ name, sessions, completed }) => ({ name, sessions, completed }));

        // Recent activity (last 10 sessions)
        const recentSessions = sessions
            .sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
            .slice(0, 10);
        const recentActivity = recentSessions.map((session: any) => ({
            id: session.id,
            user: 'User', // Optionally fetch user name
            action: session.status,
            time: session.createdAt ? format(session.createdAt.toDate(), 'MMM d, yyyy') : 'Unknown',
        }));

        return NextResponse.json({
            metrics: {
                totalSessions,
                completedSessions,
                cancelledSessions,
                activeUsers,
                avgSessionDuration: avgDuration,
                completionRate,
                noShowRate,
                rescheduleRate,
                totalUsers,
                verifiedUsers,
                usersWithSessions,
                avgVouchScore,
                earlyEndingUsers,
                avgEarlyEndingPercentage: Math.round(avgEarlyEndingPercentage)
            },
            weeklyTrend,
            recentActivity,
            topUniversities,
            popularTimes,
            scoreRanges,
            durationRanges
        });
    } catch (error) {
        console.error('Admin Analytics API Error:', error);
        return NextResponse.json({ error: 'Failed to load analytics data' }, { status: 500 });
    }
}
