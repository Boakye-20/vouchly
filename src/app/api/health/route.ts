import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
    const startTime = Date.now();

    try {
        // Check database connectivity
        const dbCheck = await adminDb.collection('health').doc('ping').get();
        const dbConnected = dbCheck.exists || true; // Firestore will throw if not connected

        // Get basic system metrics
        const usersSnapshot = await adminDb.collection('users').get();
        const sessionsSnapshot = await adminDb.collection('sessions').get();

        const responseTime = Date.now() - startTime;

        return NextResponse.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV,
            version: process.env.npm_package_version || '1.0.0',
            checks: {
                database: {
                    status: dbConnected ? 'connected' : 'disconnected',
                    responseTime: `${responseTime}ms`
                },
                metrics: {
                    totalUsers: usersSnapshot.size,
                    totalSessions: sessionsSnapshot.size
                }
            },
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
            }
        });

    } catch (error) {
        console.error('Health check failed:', error);

        return NextResponse.json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
            checks: {
                database: {
                    status: 'disconnected',
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            }
        }, { status: 503 });
    }
} 