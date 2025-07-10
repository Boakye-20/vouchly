import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        const { vouchScore } = await req.json();

        if (typeof vouchScore !== 'number' || vouchScore < 0 || vouchScore > 100) {
            return NextResponse.json(
                { error: 'Invalid vouch score. Must be a number between 0 and 100' },
                { status: 400 }
            );
        }

        // Update user vouch score
        await adminDb.collection('users').doc(userId).update({
            vouchScore: vouchScore,
            updatedAt: new Date(),
        });

        // Log the manual adjustment for audit purposes
        await adminDb.collection('vouchScoreHistory').add({
            userId: userId,
            previousScore: 0, // We could fetch this if needed
            newScore: vouchScore,
            reason: 'Manual admin adjustment',
            adjustedBy: 'admin',
            adjustedAt: new Date(),
        });

        return NextResponse.json({ success: true, vouchScore });
    } catch (error) {
        console.error('Vouch Score Update Error:', error);
        return NextResponse.json(
            { error: 'Failed to update vouch score' },
            { status: 500 }
        );
    }
} 