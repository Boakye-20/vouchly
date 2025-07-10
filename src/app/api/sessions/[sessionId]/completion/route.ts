import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { validate } from '@/lib/utils/validate';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;
        const body = await req.json();
        const { valid, errors } = validate({ userId: { required: true, type: 'string' } }, body);
        if (!valid) {
            return NextResponse.json({ error: 'Invalid input', details: errors }, { status: 400 });
        }
        const { userId, feedback, issueReport } = body;

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
        const currentCompletions = sessionData?.completionConfirmedBy || {};

        // Check if user is a participant
        if (!sessionData?.participantIds?.includes(userId)) {
            return NextResponse.json(
                { error: 'User is not a participant in this session' },
                { status: 403 }
            );
        }

        // Calculate actual duration if session is in progress
        let actualDuration = sessionData.durationMinutes;
        let isEarlyEnding = false;
        let earlyEndingPercentage = 0;

        if (sessionData.status === 'in_progress' && sessionData.actualStartTime) {
            const startTime = sessionData.actualStartTime.toDate();
            const endTime = new Date();
            actualDuration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

            // Check if session ended early (less than 75% of scheduled duration)
            const scheduledDuration = sessionData.durationMinutes;
            const earlyEndingThreshold = 0.75; // 75% of scheduled time
            isEarlyEnding = actualDuration < (scheduledDuration * earlyEndingThreshold);
            earlyEndingPercentage = Math.round((actualDuration / scheduledDuration) * 100);
        }

        // Update session with completion confirmation
        const updatedCompletions = {
            ...currentCompletions,
            [userId]: true
        };

        const updateData: any = {
            completionConfirmedBy: updatedCompletions,
            updatedAt: new Date()
        };

        // If both participants have completed, mark session as completed
        const participantIds = sessionData.participantIds || [];
        const completedParticipants = Object.keys(updatedCompletions).filter(id => updatedCompletions[id]);

        if (completedParticipants.length === participantIds.length) {
            updateData.status = 'completed';
            updateData.actualDuration = actualDuration;
            updateData.completedAt = new Date();
        }

        await sessionRef.update(updateData);

        // Track early ending if applicable
        if (isEarlyEnding) {
            const userRef = adminDb.collection('users').doc(userId);
            await userRef.update({
                earlyEndingCount: FieldValue.increment(1),
                lastEarlyEnding: new Date(),
                earlyEndingPercentage: earlyEndingPercentage
            });
        }

        // Store feedback if provided
        if (feedback) {
            await adminDb.collection('sessionFeedback').add({
                sessionId,
                userId,
                feedback: feedback.feedback,
                wouldStudyAgain: feedback.wouldStudyAgain,
                createdAt: new Date()
            });
        }

        // Send notification to partner if session ended early
        if (isEarlyEnding) {
            const partnerId = sessionData.participantIds.find((id: string) => id !== userId);
            if (partnerId) {
                await adminDb.collection(`users/${partnerId}/notifications`).add({
                    text: `Your study partner ended the session early (${actualDuration}min / ${sessionData.durationMinutes}min scheduled).`,
                    link: '/dashboard/sessions',
                    read: false,
                    createdAt: new Date(),
                    type: 'early_ending'
                });
            }
        }

        // Store issue report if provided
        if (issueReport) {
            await adminDb.collection('sessionIssues').add({
                sessionId,
                userId,
                issue: issueReport,
                status: 'reported',
                createdAt: new Date()
            });
        }

        return NextResponse.json({
            success: true,
            completed: true,
            bothCompleted: completedParticipants.length === participantIds.length
        });

    } catch (error) {
        console.error('Session completion error:', error);
        return NextResponse.json(
            { error: 'Failed to complete session' },
            { status: 500 }
        );
    }
} 