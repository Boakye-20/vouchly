import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        const { status } = await req.json();

        if (!status || !['active', 'suspended'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status. Must be "active" or "suspended"' },
                { status: 400 }
            );
        }

        // Update user account status
        await adminDb.collection('users').doc(userId).update({
            accountStatus: status,
            updatedAt: new Date(),
        });

        return NextResponse.json({ success: true, status });
    } catch (error) {
        console.error('User Status Update Error:', error);
        return NextResponse.json(
            { error: 'Failed to update user status' },
            { status: 500 }
        );
    }
} 