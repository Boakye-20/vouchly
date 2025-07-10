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

        // Get user data
        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const userData = userDoc.data();

        // Get user's sessions
        const sessionsSnapshot = await adminDb
            .collection('sessions')
            .where('participantIds', 'array-contains', userId)
            .get();

        const sessions = sessionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Get user's messages
        const messagesSnapshot = await adminDb
            .collection('messages')
            .where('participantIds', 'array-contains', userId)
            .get();

        const messages = messagesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Get user's notifications
        const notificationsSnapshot = await adminDb
            .collection('notifications')
            .where('userId', '==', userId)
            .get();

        const notifications = notificationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Compile export data
        const exportData = {
            exportDate: new Date().toISOString(),
            userId: userId,
            userEmail: userData?.email,
            profile: {
                ...userData,
                // Remove sensitive fields
                password: undefined,
                firebaseUid: undefined
            },
            sessions: sessions,
            messages: messages,
            notifications: notifications,
            dataSummary: {
                totalSessions: sessions.length,
                totalMessages: messages.length,
                totalNotifications: notifications.length,
                accountCreated: userData?.createdAt,
                lastActive: userData?.updatedAt
            }
        };

        // Return as JSON file
        return new NextResponse(JSON.stringify(exportData, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="vouchly-data-${new Date().toISOString().split('T')[0]}.json"`
            }
        });

    } catch (error: any) {
        console.error('Data export error:', error);
        return NextResponse.json(
            { error: 'Failed to export data' },
            { status: 500 }
        );
    }
} 