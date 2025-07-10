'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar, Clock, Users, CheckCircle, RefreshCw, AlertCircle, Loader2, BarChart3 } from 'lucide-react';
// import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
// import { db } from '@/lib/firebase';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';

// --- Sentry Integration ---
import * as Sentry from '@sentry/nextjs';

// --- Google Analytics ---
import { adminEvents } from '@/lib/google-analytics';
import { GoogleAnalyticsWidget } from '@/components/analytics/GoogleAnalyticsWidget';

// Types for our analytics data
interface AnalyticsData {
    metrics: {
        totalSessions: number;
        completedSessions: number;
        cancelledSessions: number;
        activeUsers: number;
        avgSessionDuration: string;
        completionRate: string;
        noShowRate: string;
        rescheduleRate: string;
        totalUsers: number;
        verifiedUsers: number;
        usersWithSessions: number;
        avgVouchScore: number;
        earlyEndingUsers: number;
        avgEarlyEndingPercentage: number;
    };
    weeklyTrend: Array<{
        name: string;
        sessions: number;
        completed: number;
    }>;
    recentActivity: Array<{
        id: string;
        user: string;
        action: string;
        time: string;
    }>;
    topUniversities: Array<{
        name: string;
        users: number;
        sessions: number;
        avgScore: number;
    }>;
    popularTimes: Array<{
        time: string;
        count: number;
    }>;
    scoreRanges: {
        '90-100': number;
        '80-89': number;
        '70-79': number;
        '60-69': number;
        '0-59': number;
    };
    durationRanges: {
        '30min': number;
        '60min': number;
        '90min': number;
        '120min': number;
    };
};

// --- Initialize Sentry ---
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        tracesSampleRate: 1.0,
        environment: process.env.NODE_ENV,
    });
}

interface DayData {
    name: string;
    date: Date;
    sessions: number;
    completed: number;
}

const calculateWeeklyTrend = (sessions: any[]): Array<{ name: string; sessions: number; completed: number }> => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);

    const days: DayData[] = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekAgo);
        date.setDate(weekAgo.getDate() + i);
        days.push({
            name: date.toLocaleDateString('en-US', { weekday: 'short' }),
            date: startOfDay(date),
            sessions: 0,
            completed: 0
        });
    }

    sessions.forEach(session => {
        const sessionDate = session.scheduledStartTime?.toDate() || session.createdAt?.toDate();
        if (!sessionDate) return;

        const day = days.find(d =>
            sessionDate >= d.date &&
            sessionDate < new Date(d.date.getTime() + 24 * 60 * 60 * 1000)
        );

        if (day) {
            day.sessions++;
            if (session.status === 'completed') {
                day.completed++;
            }
        }
    });

    return days.map(({ name, sessions, completed }) => ({
        name,
        sessions,
        completed
    }));
};

function AnalyticsPage() {
    // Use SWR to fetch analytics data from the admin API route
    const { data: analyticsData, error } = useSWR<AnalyticsData>('/api/admin-analytics', fetcher);
    const loading = !analyticsData && !error;

    // Track page view in Sentry and Google Analytics
    useEffect(() => {
        if (analyticsData) {
            // Sentry tracking
            if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
                Sentry.captureMessage('Admin Dashboard Viewed', 'info');
            }

            // Google Analytics tracking
            adminEvents.analyticsViewed();
        }
    }, [analyticsData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    if (!analyticsData) return null;

    const metrics = [
        {
            title: 'Total Sessions',
            value: analyticsData.metrics.totalSessions,
            icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
            description: `+0% from last week`,
        },
        {
            title: 'Completed',
            value: analyticsData.metrics.completedSessions,
            icon: <CheckCircle className="h-4 w-4 text-green-500" />,
            description: `${analyticsData.metrics.completionRate} completion rate`,
        },
        {
            title: 'Total Users',
            value: analyticsData.metrics.totalUsers,
            icon: <Users className="h-4 w-4 text-blue-500" />,
            description: `${analyticsData.metrics.verifiedUsers} verified`,
        },
        {
            title: 'Active Users',
            value: analyticsData.metrics.activeUsers,
            icon: <Users className="h-4 w-4 text-green-500" />,
            description: 'Last 30 days',
        },
        {
            title: 'Avg. Vouch Score',
            value: analyticsData.metrics.avgVouchScore,
            icon: <BarChart3 className="h-4 w-4 text-purple-500" />,
            description: 'Across all users',
        },
        {
            title: 'Early Enders',
            value: analyticsData.metrics.earlyEndingUsers,
            icon: <AlertCircle className="h-4 w-4 text-orange-500" />,
            description: `${analyticsData.metrics.avgEarlyEndingPercentage}% avg early ending`,
        },
    ];

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                <p className="text-muted-foreground">Track and analyze platform performance</p>
            </div>
            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {metrics.map((metric, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                            <div className="h-6 w-6">{metric.icon}</div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metric.value}</div>
                            <p className="text-xs text-muted-foreground">{metric.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="sessions" disabled={!analyticsData.metrics.totalSessions}>
                        Sessions
                    </TabsTrigger>
                    <TabsTrigger value="users" disabled={!analyticsData.metrics.activeUsers}>
                        Users
                    </TabsTrigger>
                    <TabsTrigger value="universities" disabled={!analyticsData.topUniversities?.length}>
                        Universities
                    </TabsTrigger>
                    <TabsTrigger value="insights" disabled={!analyticsData.metrics.totalSessions}>
                        Insights
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Weekly Sessions</CardTitle>
                                <CardDescription>Total sessions created this week</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analyticsData.weeklyTrend}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="sessions" fill="#3b82f6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Completion Rate</CardTitle>
                                <CardDescription>Percentage of completed sessions</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={analyticsData.weeklyTrend}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Latest actions in the platform</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {analyticsData.recentActivity.map((activity: { id: string; user: string; action: string; time: string }) => (
                                    <div key={activity.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                <span className="text-sm font-medium">{activity.user[0]}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{activity.user}</p>
                                                <p className="text-sm text-muted-foreground capitalize">
                                                    {activity.action.replace('_', ' ')}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-sm text-muted-foreground">{activity.time}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="sessions" className="space-y-4">
                    <div className="rounded-lg border p-6">
                        <h3 className="text-lg font-medium mb-4">Session Status</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="rounded-lg border p-4 bg-green-50">
                                <div className="text-2xl font-bold text-green-600">
                                    {analyticsData.metrics.completedSessions}
                                </div>
                                <div className="text-sm text-green-800">Completed</div>
                                <div className="text-xs text-muted-foreground">{analyticsData.metrics.completionRate} of total</div>
                            </div>
                            <div className="rounded-lg border p-4 bg-red-50">
                                <div className="text-2xl font-bold text-red-600">
                                    {analyticsData.metrics.cancelledSessions}
                                </div>
                                <div className="text-sm text-red-800">Cancelled</div>
                                <div className="text-xs text-muted-foreground">
                                    {Math.round((analyticsData.metrics.cancelledSessions / analyticsData.metrics.totalSessions) * 100)}% of total
                                </div>
                            </div>
                            <div className="rounded-lg border p-4 bg-amber-50">
                                <div className="text-2xl font-bold text-amber-600">
                                    {parseInt(analyticsData.metrics.noShowRate)}
                                </div>
                                <div className="text-sm text-amber-800">No-Show Rate</div>
                                <div className="text-xs text-muted-foreground">Of scheduled sessions</div>
                            </div>
                            <div className="rounded-lg border p-4 bg-blue-50">
                                <div className="text-2xl font-bold text-blue-600">
                                    {analyticsData.metrics.rescheduleRate}
                                </div>
                                <div className="text-sm text-blue-800">Reschedule Rate</div>
                                <div className="text-xs text-muted-foreground">Of scheduled sessions</div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="users" className="space-y-4">
                    <div className="rounded-lg border p-6">
                        <h3 className="text-lg font-medium mb-4">User Activity</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="rounded-lg border p-4 bg-blue-50">
                                <div className="text-2xl font-bold text-blue-600">
                                    {analyticsData.metrics.activeUsers}
                                </div>
                                <div className="text-sm text-blue-800">Active Users</div>
                                <div className="text-xs text-muted-foreground">Last 30 days</div>
                            </div>
                            <div className="rounded-lg border p-4 bg-purple-50">
                                <div className="text-2xl font-bold text-purple-600">
                                    {analyticsData.metrics.totalSessions}
                                </div>
                                <div className="text-sm text-purple-800">Total Sessions</div>
                                <div className="text-xs text-muted-foreground">All time</div>
                            </div>
                            <div className="rounded-lg border p-4 bg-green-50">
                                <div className="text-2xl font-bold text-green-600">
                                    {analyticsData.metrics.avgSessionDuration}
                                </div>
                                <div className="text-sm text-green-800">Avg. Session Duration</div>
                                <div className="text-xs text-muted-foreground">Across all sessions</div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="universities" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Universities</CardTitle>
                                <CardDescription>Universities with most users</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {analyticsData.topUniversities?.slice(0, 5).map((uni, index) => (
                                        <div key={uni.name} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-purple-700">{index + 1}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{uni.name}</p>
                                                    <p className="text-xs text-muted-foreground">{uni.users} users</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">{uni.sessions} sessions</p>
                                                <p className="text-xs text-muted-foreground">Avg: {uni.avgScore}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>University Activity</CardTitle>
                                <CardDescription>Session distribution by university</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analyticsData.topUniversities?.slice(0, 8)}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="sessions" fill="#8b5cf6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="insights" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Popular Study Times</CardTitle>
                                <CardDescription>Most scheduled session times</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {analyticsData.popularTimes?.map((timeSlot, index) => (
                                        <div key={timeSlot.time} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <span className="text-xs font-medium text-blue-700">{index + 1}</span>
                                                </div>
                                                <span className="text-sm font-medium">{timeSlot.time}</span>
                                            </div>
                                            <span className="text-sm text-muted-foreground">{timeSlot.count} sessions</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Vouch Score Distribution</CardTitle>
                                <CardDescription>User score ranges</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={Object.entries(analyticsData.scoreRanges || {}).map(([range, count]) => ({ range, count }))}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="range" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#10b981" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Session Duration Preferences</CardTitle>
                                <CardDescription>Most popular session lengths</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={Object.entries(analyticsData.durationRanges || {}).map(([duration, count]) => ({ duration, count }))}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="duration" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#f59e0b" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Session Status Breakdown</CardTitle>
                                <CardDescription>Detailed session outcomes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            <span className="text-sm font-medium">Completed</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{analyticsData.metrics.completedSessions}</p>
                                            <p className="text-xs text-muted-foreground">{analyticsData.metrics.completionRate}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <AlertCircle className="h-5 w-5 text-red-600" />
                                            <span className="text-sm font-medium">Cancelled</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{analyticsData.metrics.cancelledSessions}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {Math.round((analyticsData.metrics.cancelledSessions / analyticsData.metrics.totalSessions) * 100)}% of total
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <AlertCircle className="h-5 w-5 text-orange-600" />
                                            <span className="text-sm font-medium">No-Show Rate</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{analyticsData.metrics.noShowRate}</p>
                                            <p className="text-xs text-muted-foreground">Of scheduled sessions</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <RefreshCw className="h-5 w-5 text-blue-600" />
                                            <span className="text-sm font-medium">Reschedule Rate</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{analyticsData.metrics.rescheduleRate}</p>
                                            <p className="text-xs text-muted-foreground">Of scheduled sessions</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AnalyticsPage;
