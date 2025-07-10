import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function DELETE(req: NextRequest) {
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

        // Get user data for backup before deletion
        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const userData = userDoc.data();

        // Create deletion record for audit trail
        await adminDb.collection('accountDeletions').add({
            userId: userId,
            userEmail: userData?.email,
            userName: userData?.name,
            deletionDate: new Date(),
            reason: 'user_requested',
            dataBackup: {
                userData: userData,
                deletionTimestamp: new Date().toISOString()
            }
        });

        // Delete Firebase Auth user FIRST
        try {
            await adminAuth.deleteUser(userId);
        } catch (error) {
            console.error('Could not delete Firebase Auth user:', error);
            return NextResponse.json(
                { error: 'Failed to delete authentication account. Please contact support.' },
                { status: 500 }
            );
        }

        // Now delete Firestore data
        // Delete user's sessions where they are a participant
        const sessionsSnapshot = await adminDb
            .collection('sessions')
            .where('participantIds', 'array-contains', userId)
            .get();
        const sessionDeletions = sessionsSnapshot.docs.map(doc => doc.ref.delete());
        // Delete user's notifications
        const notificationsSnapshot = await adminDb
            .collection(`users/${userId}/notifications`)
            .get();
        const notificationDeletions = notificationsSnapshot.docs.map(doc => doc.ref.delete());
        // Delete user's session feedback
        const feedbackSnapshot = await adminDb
            .collection('sessionFeedback')
            .where('userId', '==', userId)
            .get();
        const feedbackDeletions = feedbackSnapshot.docs.map(doc => doc.ref.delete());
        // Delete user's session issues
        const issuesSnapshot = await adminDb
            .collection('sessionIssues')
            .where('userId', '==', userId)
            .get();
        const issueDeletions = issuesSnapshot.docs.map(doc => doc.ref.delete());
        // Delete user's messages
        const messagesSnapshot = await adminDb
            .collection('messages')
            .where('participantIds', 'array-contains', userId)
            .get();
        const messageDeletions = messagesSnapshot.docs.map(doc => doc.ref.delete());
        // Delete user document
        await adminDb.collection('users').doc(userId).delete();
        // Delete user's notifications subcollection
        await adminDb.collection(`users/${userId}`).doc('notifications').delete();
        // Execute all deletions
        await Promise.all([
            ...sessionDeletions,
            ...notificationDeletions,
            ...feedbackDeletions,
            ...issueDeletions,
            ...messageDeletions
        ]);

        // Log successful deletion
        await adminDb.collection('deletionLogs').add({
            userId: userId,
            deletionDate: new Date(),
            dataTypesDeleted: [
                'user_profile',
                'sessions',
                'notifications',
                'feedback',
                'issues',
                'messages'
            ],
            totalRecordsDeleted:
                sessionsSnapshot.size +
                notificationsSnapshot.size +
                feedbackSnapshot.size +
                issuesSnapshot.size +
                messagesSnapshot.size + 1, // +1 for user document
            status: 'completed'
        });

        return NextResponse.json({
            success: true,
            message: 'Account and all associated data have been permanently deleted',
            deletionDate: new Date().toISOString(),
            dataTypesDeleted: [
                'user_profile',
                'sessions',
                'notifications',
                'feedback',
                'issues',
                'messages'
            ]
        });

    } catch (error) {
        console.error('Account deletion error:', error);
        return NextResponse.json(
            { error: 'Failed to delete account' },
            { status: 500 }
        );
    }
} 