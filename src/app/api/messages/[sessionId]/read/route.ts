import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Mark all messages in this session as read for the user
        const messagesRef = adminDb.collection('sessions').doc(sessionId).collection('messages');
        const unreadMessages = await messagesRef.get();

        if (!unreadMessages.empty) {
            const batch = adminDb.batch();
            unreadMessages.docs.forEach(doc => {
                batch.update(doc.ref, { isRead: true });
            });
            await batch.commit();
        }

        // Update the unread count on the session document
        const sessionRef = adminDb.collection('sessions').doc(sessionId);
        await sessionRef.update({
            [`unreadCount.${userId}`]: 0
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Mark messages as read error:', error);
        return NextResponse.json(
            { error: 'Failed to mark messages as read' },
            { status: 500 }
        );
    }
} 