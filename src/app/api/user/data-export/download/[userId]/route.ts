import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
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
        const requestingUserId = decodedToken.uid;
        const { userId } = await params;

        // Ensure user can only download their own data
        if (requestingUserId !== userId) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        // Fetch all user data (same as export endpoint)
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

        // Return as downloadable JSON file
        const jsonString = JSON.stringify(dataExport, null, 2);
        const filename = `vouchly-data-export-${userId}-${new Date().toISOString().split('T')[0]}.json`;

        return new NextResponse(jsonString, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

    } catch (error) {
        console.error('Data download error:', error);
        return NextResponse.json(
            { error: 'Failed to download data' },
            { status: 500 }
        );
    }
} 