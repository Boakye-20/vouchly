import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
    try {
        // Verify user authentication
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        // Fetch all user data
        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const userData = userDoc.data();

        // Fetch user's sessions
        const sessionsSnapshot = await adminDb
            .collection('sessions')
            .where('participantIds', 'array-contains', userId)
            .get();

        const sessions = sessionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Fetch user's notifications
        const notificationsSnapshot = await adminDb
            .collection(`users/${userId}/notifications`)
            .get();

        const notifications = notificationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Fetch user's session feedback
        const feedbackSnapshot = await adminDb
            .collection('sessionFeedback')
            .where('userId', '==', userId)
            .get();

        const feedback = feedbackSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Fetch user's session issues
        const issuesSnapshot = await adminDb
            .collection('sessionIssues')
            .where('userId', '==', userId)
            .get();

        const issues = issuesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Compile complete data export
        const dataExport = {
            exportDate: new Date().toISOString(),
            userId: userId,
            userData: {
                ...userData,
                // Remove sensitive fields
                password: undefined,
                firebaseTokens: undefined
            },
            sessions: sessions,
            notifications: notifications,
            feedback: feedback,
            issues: issues,
            metadata: {
                totalSessions: sessions.length,
                totalNotifications: notifications.length,
                totalFeedback: feedback.length,
                totalIssues: issues.length
            }
        };

        // Log the export request for audit
        await adminDb.collection('dataExports').add({
            userId: userId,
            exportDate: new Date(),
            requestType: 'user_requested',
            dataTypes: ['user', 'sessions', 'notifications', 'feedback', 'issues']
        });

        return NextResponse.json({
            success: true,
            data: dataExport,
            downloadUrl: `/api/user/data-export/download/${userId}`,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        });

    } catch (error) {
        console.error('Data export error:', error);
        return NextResponse.json(
            { error: 'Failed to export data' },
            { status: 500 }
        );
    }
} 