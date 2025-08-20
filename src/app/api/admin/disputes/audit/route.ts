import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

        // --- Admin Auth Check ---
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const idToken = authHeader.split('Bearer ')[1];
        const { adminAuth, adminDb } = await import('@/lib/firebase-admin');
        let adminUserId = '';
        try {
            const decoded = await adminAuth.verifyIdToken(idToken);
            adminUserId = decoded.uid;
            const userDoc = await adminDb.collection('users').doc(adminUserId).get();
            if (!userDoc.exists || !userDoc.data()?.isAdmin) {
                return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
            }
        } catch {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const snapshot = await adminDb.collection('sessionDisputes').doc(id).collection('disputeAuditTrail').orderBy('timestamp', 'desc').get();
        const auditTrail = snapshot.docs.map(doc => doc.data());
        return NextResponse.json({ auditTrail });
    } catch (error) {
        console.error('Fetch audit trail error:', error);
        return NextResponse.json({ error: 'Failed to fetch audit trail' }, { status: 500 });
    }
} 