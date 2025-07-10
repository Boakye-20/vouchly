import { NextResponse } from 'next/server';
import { processUndoAction } from '@/lib/undo';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    const { undoId } = await request.json();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
        return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const userEmail = decodedToken.email;
        if (!userEmail) {
            return NextResponse.json({ error: 'User email not found in token' }, { status: 400 });
        }
        const result = await processUndoAction(undoId, userEmail);
        if (!result.success) {
            return NextResponse.json({ error: result.message }, { status: 400 });
        }
        return NextResponse.json({ success: true, message: result.message });
    } catch (error) {
        console.error('Error processing undo:', error);
        return NextResponse.json(
            { error: 'Failed to process undo' },
            { status: 500 }
        );
    }
}
