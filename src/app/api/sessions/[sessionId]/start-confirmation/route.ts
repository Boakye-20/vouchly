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

        // Get the session document
        const sessionRef = adminDb.collection('sessions').doc(sessionId);
        const sessionDoc = await sessionRef.get();

        if (!sessionDoc.exists) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        const sessionData = sessionDoc.data();
        const currentConfirmations = sessionData?.startConfirmedBy || [];

        // Check if user is a participant
        if (!sessionData?.participantIds?.includes(userId)) {
            return NextResponse.json(
                { error: 'User is not a participant in this session' },
                { status: 403 }
            );
        }

        // Add user to confirmations if not already confirmed
        if (!currentConfirmations.includes(userId)) {
            const updatedConfirmations = [...currentConfirmations, userId];

            // Update session with new confirmation
            await sessionRef.update({
                startConfirmedBy: updatedConfirmations,
                updatedAt: new Date()
            });

            // If both participants have confirmed, start the session
            if (updatedConfirmations.length === 2) {
                await sessionRef.update({
                    status: 'in_progress',
                    actualStartTime: new Date(),
                    updatedAt: new Date()
                });
            }

            return NextResponse.json({
                success: true,
                confirmed: true,
                bothConfirmed: updatedConfirmations.length === 2
            });
        }

        return NextResponse.json({
            success: true,
            confirmed: false,
            message: 'User already confirmed'
        });

    } catch (error) {
        console.error('Session start confirmation error:', error);
        return NextResponse.json(
            { error: 'Failed to confirm session start' },
            { status: 500 }
        );
    }
} 