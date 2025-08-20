import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type { Query } from 'firebase-admin/firestore';

// GET: List all disputes (optionally filter by status)
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        let query: Query = adminDb.collection('sessionDisputes');
        if (status) {
            query = query.where('status', '==', status);
        }
        const snapshot = await query.get();
        const disputes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json({ disputes });
    } catch (error) {
        console.error('Admin GET disputes error:', error);
        return NextResponse.json({ error: 'Failed to fetch disputes' }, { status: 500 });
    }
}

// PATCH: Update dispute status, admin notes, or resolution
export async function PATCH(req: NextRequest) {
    try {
        const { id, status, adminNotes, resolution, appealReason, appealEvidenceUrls } = await req.json();
        if (!id || !status) {
            return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
        }
        const updateData: any = { status, updatedAt: new Date() };
        if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
        if (resolution !== undefined) updateData.resolution = resolution;
        // --- Appeal fields ---
        if (status === 'appealed') {
            if (appealReason !== undefined) updateData.appealReason = appealReason;
            if (appealEvidenceUrls !== undefined) updateData.appealEvidenceUrls = appealEvidenceUrls;
            updateData.appealedAt = new Date();
        }
        await adminDb.collection('sessionDisputes').doc(id).update(updateData);

        // Fetch dispute to get user IDs
        const disputeDoc = await adminDb.collection('sessionDisputes').doc(id).get();
        const dispute = disputeDoc.data();
        if (dispute && ['resolved', 'rejected', 'appealed'].includes(status)) {
            const notif = {
                title: 'Dispute Update',
                message: `Your dispute for session ${dispute.sessionId} has been ${status}.`,
                link: '/dashboard/sessions',
                read: false,
                createdAt: new Date(),
                type: 'dispute',
            };
            // Fetch emails for both users
            let reporterEmail = '';
            let reportedAgainstEmail = '';
            if (dispute.reportedBy) {
                const reporterDoc = await adminDb.collection('users').doc(dispute.reportedBy).get();
                const reporterData = reporterDoc.exists ? reporterDoc.data() : undefined;
                reporterEmail = reporterData?.email || '';
            }
            if (dispute.reportedAgainst) {
                const reportedAgainstDoc = await adminDb.collection('users').doc(dispute.reportedAgainst).get();
                const reportedAgainstData = reportedAgainstDoc.exists ? reportedAgainstDoc.data() : undefined;
                reportedAgainstEmail = reportedAgainstData?.email || '';
            }
            // Notify reporter
            if (dispute.reportedBy) {
                await import('@/lib/notifications').then(({ sendNotification }) =>
                    sendNotification({
                        userId: dispute.reportedBy,
                        type: 'dispute',
                        title: notif.title,
                        message: notif.message,
                        link: notif.link,
                        sendEmail: true,
                        email: reporterEmail,
                    })
                );
            }
            // Notify reportedAgainst
            if (dispute.reportedAgainst) {
                await import('@/lib/notifications').then(({ sendNotification }) =>
                    sendNotification({
                        userId: dispute.reportedAgainst,
                        type: 'dispute',
                        title: notif.title,
                        message: `A dispute involving you for session ${dispute.sessionId} has been ${status}.`,
                        link: notif.link,
                        sendEmail: true,
                        email: reportedAgainstEmail,
                    })
                );
            }
        }
        // Notify all admins if status is appealed
        if (status === 'appealed') {
            // Query all admin users
            const adminsSnap = await adminDb.collection('users').where('isAdmin', '==', true).get();
            const { sendNotification } = await import('@/lib/notifications');
            for (const adminDoc of adminsSnap.docs) {
                const adminData = adminDoc.data();
                await sendNotification({
                    userId: adminDoc.id,
                    type: 'dispute',
                    title: 'New Dispute Appeal Submitted',
                    message: `A user has submitted an appeal for dispute ${id} (session ${dispute?.sessionId || ''}). Review in the admin dashboard.`,
                    link: '/dashboard/admin/disputes',
                    sendEmail: true,
                    email: adminData.email,
                });
            }
        }
        // After updating the dispute and sending notifications
        // --- Audit Trail Logging ---
        let adminEmail = 'unknown';
        // --- Admin Auth Check ---
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const idToken = authHeader.split('Bearer ')[1];
        const { adminAuth } = await import('@/lib/firebase-admin');
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
        // Fetch previous dispute data for diff
        const prevDoc = await adminDb.collection('sessionDisputes').doc(id).get();
        const prevData = prevDoc.exists ? prevDoc.data() || {} : {};
        const auditEntry: any = {
            admin: adminEmail,
            timestamp: new Date(),
            action: 'update',
            oldStatus: prevData?.status,
            newStatus: status,
            oldAdminNotes: prevData?.adminNotes,
            newAdminNotes: adminNotes,
            oldResolution: prevData?.resolution,
            newResolution: resolution,
        };
        if (status === 'appealed') {
            auditEntry.appealReason = appealReason;
            auditEntry.appealEvidenceUrls = appealEvidenceUrls;
        }
        await adminDb.collection('sessionDisputes').doc(id).collection('disputeAuditTrail').add(auditEntry);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin PATCH dispute error:', error);
        return NextResponse.json({ error: 'Failed to update dispute' }, { status: 500 });
    }
} 