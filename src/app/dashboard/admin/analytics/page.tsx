'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar, Clock, Users, CheckCircle, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';

// --- Sentry Integration ---
import * as Sentry from '@sentry/nextjs';

// Types for our analytics data
type AnalyticsData = {
  metrics: {
    totalSessions: number;
    completedSessions: number;
    activeUsers: number;
    avgSessionDuration: string;
    noShowRate: string;
    rescheduleRate: string;
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

const calculateWeeklyTrend = (sessions: any[]): Array<{name: string; sessions: number; completed: number}> => {
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
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Fetch all sessions
        const sessionsSnapshot = await getDocs(collection(db, 'sessions'));
        const sessions = sessionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch active users (users active in the last 7 days)
        const weekAgo = Timestamp.fromDate(subDays(new Date(), 7));
        const usersQuery = query(
          collection(db, 'users'),
          where('lastActive', '>=', weekAgo)
        );
        const usersSnapshot = await getDocs(usersQuery);
        const activeUsers = usersSnapshot.size;

        // Calculate metrics
        const totalSessions = sessions.length;
        const completedSessions = sessions.filter((s: any) => s.status === 'completed').length;
        const noShowSessions = sessions.filter((s: any) => s.status === 'no_show').length;
        const rescheduledSessions = sessions.filter((s: any) => s.status === 'rescheduled').length;
        
        // Calculate average session duration
        const totalDuration = sessions
          .filter((s: any) => s.durationMinutes)
          .reduce((acc: number, curr: any) => acc + (curr.durationMinutes || 0), 0);
        
        const avgDuration = totalSessions > 0 
          ? `${Math.round(totalDuration / totalSessions)}m` 
          : '0m';

        const noShowRate = totalSessions > 0 
          ? `${((noShowSessions / totalSessions) * 100).toFixed(1)}%` 
          : '0%';
          
        const rescheduleRate = totalSessions > 0
          ? `${((rescheduledSessions / totalSessions) * 100).toFixed(1)}%`
          : '0%';

        // Get recent activity (last 10 sessions)
        const recentSessions = sessions
          .sort((a: any, b: any) => 
            (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
          )
          .slice(0, 10);
          
        const recentActivity = await Promise.all(recentSessions.map(async (session: any) => {
          // In a real app, you'd fetch user names here
          const userName = 'User';
          return {
            id: session.id,
            user: userName,
            action: session.status,
            time: session.createdAt ? format(session.createdAt.toDate(), 'MMM d, yyyy') : 'Unknown'
          };
        }));

        const data: AnalyticsData = {
          metrics: {
            totalSessions,
            completedSessions,
            activeUsers,
            avgSessionDuration: avgDuration,
            noShowRate,
            rescheduleRate,
          },
          weeklyTrend: calculateWeeklyTrend(sessions),
          recentActivity
        };

        setAnalyticsData(data);

        // Track page view in Sentry
        if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
          Sentry.captureMessage('Admin Dashboard Viewed', 'info');
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
        if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
          Sentry.captureException(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

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
      icon: <Calendar className="h-6 w-6 text-blue-500" />, 
      label: 'Total Sessions', 
      value: analyticsData.metrics.totalSessions, 
      trend: '+0%', 
      trendPositive: true 
    },
    { 
      icon: <CheckCircle className="h-6 w-6 text-green-500" />, 
      label: 'Completed', 
      value: analyticsData.metrics.completedSessions, 
      trend: '+0%', 
      trendPositive: true 
    },
    { 
      icon: <Users className="h-6 w-6 text-purple-500" />, 
      label: 'Active Users', 
      value: analyticsData.metrics.activeUsers, 
      trend: '+0%', 
      trendPositive: true 
    },
    { 
      icon: <Clock className="h-6 w-6 text-amber-500" />, 
      label: 'Avg. Duration', 
      value: analyticsData.metrics.avgSessionDuration, 
      trend: '+0m', 
      trendPositive: true 
    },
    { 
      icon: <AlertCircle className="h-6 w-6 text-red-500" />, 
      label: 'No-Show Rate', 
      value: analyticsData.metrics.noShowRate, 
      trend: '+0%', 
      trendPositive: false 
    },
    { 
      icon: <RefreshCw className="h-6 w-6 text-cyan-500" />, 
      label: 'Reschedule Rate', 
      value: analyticsData.metrics.rescheduleRate, 
      trend: '+0%', 
      trendPositive: false 
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
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
              <div className="h-6 w-6">{metric.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className={`text-xs ${metric.trendPositive ? 'text-green-500' : 'text-red-500'}`}>
                {metric.trend} from last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
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
                {analyticsData.recentActivity.map((activity: {id: string; user: string; action: string; time: string}) => (
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
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
