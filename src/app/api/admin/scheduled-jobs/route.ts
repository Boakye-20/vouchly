import { NextRequest, NextResponse } from 'next/server';
import {
    sendUpcomingSessionReminders,
    detectNoShows,
    runSessionCleanupJob,
    aggregateAnalyticsData,
    sendInactiveUserReminders,
    applyNoShowPenalties
} from '@/lib/scheduled-jobs';

export async function POST(req: NextRequest) {
    try {
        const { jobType } = await req.json();

        if (!jobType) {
            return NextResponse.json(
                { error: 'Job type is required' },
                { status: 400 }
            );
        }

        let result;

        switch (jobType) {
            case 'session_reminders':
                result = await sendUpcomingSessionReminders();
                break;
            case 'no_show_detection':
                result = await detectNoShows();
                break;
            case 'session_cleanup':
                result = await runSessionCleanupJob();
                break;
            case 'analytics_aggregation':
                result = await aggregateAnalyticsData();
                break;
            case 'inactive_reminders':
                result = await sendInactiveUserReminders();
                break;
            case 'no_show_penalties':
                result = await applyNoShowPenalties();
                break;
            case 'all':
                // Run all jobs
                const results = await Promise.allSettled([
                    sendUpcomingSessionReminders(),
                    detectNoShows(),
                    runSessionCleanupJob(),
                    aggregateAnalyticsData(),
                    sendInactiveUserReminders(),
                    applyNoShowPenalties()
                ]);

                result = {
                    success: true,
                    results: results.map((r, i) => ({
                        job: ['session_reminders', 'no_show_detection', 'session_cleanup', 'analytics_aggregation', 'inactive_reminders', 'no_show_penalties'][i],
                        status: r.status,
                        value: r.status === 'fulfilled' ? r.value : r.reason
                    })),
                    timestamp: new Date().toISOString()
                };
                break;
            default:
                return NextResponse.json(
                    { error: 'Invalid job type' },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            success: true,
            jobType,
            result,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Scheduled job execution error:', error);
        return NextResponse.json(
            {
                error: 'Failed to execute scheduled job',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        availableJobs: [
            'session_reminders',
            'no_show_detection',
            'session_cleanup',
            'analytics_aggregation',
            'inactive_reminders',
            'no_show_penalties',
            'all'
        ],
        description: 'POST with jobType to trigger a scheduled job'
    });
} 