'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Play, Clock, Users, BarChart3, Bell, AlertTriangle, Database } from 'lucide-react';

interface JobResult {
    job: string;
    status: 'fulfilled' | 'rejected';
    value?: any;
    reason?: any;
}

interface JobExecution {
    jobType: string;
    result: any;
    timestamp: string;
}

export default function AdminScheduledJobsPage() {
    const { toast } = useToast();
    const [isExecuting, setIsExecuting] = useState<string | null>(null);
    const [lastExecution, setLastExecution] = useState<JobExecution | null>(null);

    const jobs = [
        {
            id: 'session_reminders',
            name: 'Session Reminders',
            description: 'Send reminders for upcoming sessions (30 min before)',
            icon: Bell,
            color: 'text-blue-600',
            schedule: 'Every 5 minutes'
        },
        {
            id: 'no_show_detection',
            name: 'No-Show Detection',
            description: 'Detect and flag sessions that weren\'t started',
            icon: AlertTriangle,
            color: 'text-orange-600',
            schedule: 'Every 10 minutes'
        },
        {
            id: 'session_cleanup',
            name: 'Session Cleanup',
            description: 'Finalize expired cancellations and clean up undo actions',
            icon: Database,
            color: 'text-green-600',
            schedule: 'Every hour'
        },
        {
            id: 'analytics_aggregation',
            name: 'Analytics Aggregation',
            description: 'Aggregate daily session statistics and metrics',
            icon: BarChart3,
            color: 'text-purple-600',
            schedule: 'Daily at 2 AM'
        },
        {
            id: 'inactive_reminders',
            name: 'Inactive User Reminders',
            description: 'Send reminders to users inactive for 7+ days',
            icon: Users,
            color: 'text-pink-600',
            schedule: 'Weekly on Monday at 9 AM'
        },
        {
            id: 'no_show_penalties',
            name: 'No-Show Penalties',
            description: 'Apply vouch score penalties for no-shows',
            icon: AlertTriangle,
            color: 'text-red-600',
            schedule: 'Daily at 1 AM'
        }
    ];

    const executeJob = async (jobType: string) => {
        setIsExecuting(jobType);
        try {
            const response = await fetch('/api/admin/scheduled-jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobType })
            });

            const result = await response.json();

            if (response.ok) {
                toast({
                    title: 'Job Executed Successfully',
                    description: `${jobType} completed successfully`,
                });
                setLastExecution(result);
            } else {
                throw new Error(result.error || 'Failed to execute job');
            }
        } catch (error) {
            toast({
                title: 'Job Execution Failed',
                description: error instanceof Error ? error.message : 'Unknown error',
                variant: 'destructive'
            });
        } finally {
            setIsExecuting(null);
        }
    };

    const executeAllJobs = async () => {
        setIsExecuting('all');
        try {
            const response = await fetch('/api/admin/scheduled-jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobType: 'all' })
            });

            const result = await response.json();

            if (response.ok) {
                toast({
                    title: 'All Jobs Executed',
                    description: 'All scheduled jobs completed successfully',
                });
                setLastExecution(result);
            } else {
                throw new Error(result.error || 'Failed to execute jobs');
            }
        } catch (error) {
            toast({
                title: 'Job Execution Failed',
                description: error instanceof Error ? error.message : 'Unknown error',
                variant: 'destructive'
            });
        } finally {
            setIsExecuting(null);
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Scheduled Jobs Management</h1>
                <p className="text-muted-foreground">Manage and trigger automated background jobs</p>
            </div>

            {/* Execute All Jobs */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Play className="h-5 w-5" />
                        Execute All Jobs
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Run all scheduled jobs at once. This is useful for testing or manual execution.
                    </p>
                    <Button
                        onClick={executeAllJobs}
                        disabled={isExecuting !== null}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {isExecuting === 'all' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Play className="mr-2 h-4 w-4" />
                        )}
                        {isExecuting === 'all' ? 'Executing All Jobs...' : 'Execute All Jobs'}
                    </Button>
                </CardContent>
            </Card>

            {/* Individual Jobs */}
            <div className="grid gap-4 md:grid-cols-2">
                {jobs.map((job) => {
                    const IconComponent = job.icon;
                    return (
                        <Card key={job.id}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <IconComponent className={`h-5 w-5 ${job.color}`} />
                                    {job.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-3">
                                    {job.description}
                                </p>
                                <div className="flex items-center justify-between mb-4">
                                    <Badge variant="outline" className="text-xs">
                                        <Clock className="mr-1 h-3 w-3" />
                                        {job.schedule}
                                    </Badge>
                                </div>
                                <Button
                                    onClick={() => executeJob(job.id)}
                                    disabled={isExecuting !== null}
                                    variant="outline"
                                    size="sm"
                                >
                                    {isExecuting === job.id ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Play className="mr-2 h-4 w-4" />
                                    )}
                                    {isExecuting === job.id ? 'Executing...' : 'Execute'}
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Last Execution Results */}
            {lastExecution && (
                <Card>
                    <CardHeader>
                        <CardTitle>Last Execution Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Job Type:</span>
                                <Badge variant="outline">{lastExecution.jobType}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Timestamp:</span>
                                <span className="text-sm text-muted-foreground">
                                    {new Date(lastExecution.timestamp).toLocaleString()}
                                </span>
                            </div>

                            {lastExecution.jobType === 'all' && lastExecution.result?.results && (
                                <div className="mt-4">
                                    <h4 className="font-medium mb-2">Individual Job Results:</h4>
                                    <div className="space-y-2">
                                        {lastExecution.result.results.map((jobResult: JobResult, index: number) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                <span className="text-sm font-medium">{jobResult.job}</span>
                                                <Badge variant={jobResult.status === 'fulfilled' ? 'default' : 'destructive'}>
                                                    {jobResult.status === 'fulfilled' ? 'Success' : 'Failed'}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 