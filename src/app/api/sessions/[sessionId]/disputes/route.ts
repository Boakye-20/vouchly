import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { validate } from '@/lib/utils/validate';
import { SessionDispute } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';

// POST: Create a new dispute for a session
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;
        const body = await req.json();
        const { valid, errors } = validate({
            reportedBy: { required: true, type: 'string' },
            reportedAgainst: { required: true, type: 'string' },
            reason: { required: true, type: 'string' },
            description: { required: true, type: 'string' },
            // evidenceUrls will be checked manually
        }, body);
        if (!valid) {
            return NextResponse.json({ error: 'Invalid input', details: errors }, { status: 400 });
        }
        const { reportedBy, reportedAgainst, reason, description, evidenceUrls, sentryEventId } = body;
        if (evidenceUrls && !Array.isArray(evidenceUrls)) {
            return NextResponse.json({ error: 'evidenceUrls must be an array if provided' }, { status: 400 });
        }
        const now = new Date();
        const dispute: Omit<SessionDispute, 'id'> = {
            sessionId,
            reportedBy,
            reportedAgainst,
            reason,
            description,
            evidenceUrls,
            status: 'open',
            createdAt: now,
            updatedAt: now,
            ...(sentryEventId ? { sentryEventId } : {}),
        };
        const docRef = await adminDb.collection('sessionDisputes').add(dispute);
        return NextResponse.json({ success: true, id: docRef.id });
    } catch (error) {
        console.error('Dispute creation error:', error);
        return NextResponse.json({ error: 'Failed to create dispute' }, { status: 500 });
    }
}

// GET: List all disputes for a session
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;
        const snapshot = await adminDb.collection('sessionDisputes').where('sessionId', '==', sessionId).get();
        const disputes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json({ disputes });
    } catch (error) {
        console.error('Dispute fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch disputes' }, { status: 500 });
    }
} 