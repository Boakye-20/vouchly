import { NextResponse } from 'next/server';
import { runSessionCleanupJob } from '@/lib/scheduled-jobs';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    try {
        // Verify admin authentication
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);

        // Check if user is admin (you can add more admin checks here)
        const userEmail = decodedToken.email;
        if (!userEmail) {
            return NextResponse.json({ error: 'Invalid user' }, { status: 401 });
        }

        // Run the cleanup job
        const result = await runSessionCleanupJob();

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: `Cleanup completed successfully. Finalized ${result.finalizedCount} sessions.`,
                data: result
            });
        } else {
            return NextResponse.json({
                success: false,
                error: result.error,
                message: 'Cleanup job failed'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Error running session cleanup job:', error);
        return NextResponse.json(
            { error: 'Failed to run cleanup job' },
            { status: 500 }
        );
    }
} 