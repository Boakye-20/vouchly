"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Calendar, Clock, Users, CheckCircle, AlertCircle, TrendingUp, Award, Target, Activity, Loader2, AlertCircle as AlertCircleIcon, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';
import { ErrorBoundary } from '@/components/error-boundary';
import { handleError, withRetry, showLoading, updateLoadingToast } from '@/lib/utils/error-handler';
import { Button } from '@/components/ui/button';

interface UserStats {
    totalSessions: number;
    completedSessions: number;
    cancelledSessions: number;
    avgSessionDuration: number;
    vouchScore: number;
    vouchScoreHistory: Array<{
        date: string;
        score: number;
        change: number;
        reason: string;
    }>;
    studyPartners: Array<{
        name: string;
        sessions: number;
        lastSession: string;
        avgRating: number;
    }>;
    weeklyActivity: Array<{
        name: string;
        sessions: number;
        completed: number;
    }>;
    sessionDurationDistribution: {
        '30min': number;
        '60min': number;
        '90min': number;
        '120min': number;
    };
    earlyEndingStats: {
        count: number;
        percentage: number;
        lastOccurrence: string;
    };
    achievements: Array<{
        name: string;
        description: string;
        earned: boolean;
        progress: number;
        target: number;
    }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function UserStatsPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'partners' | 'progress' | 'achievements'>('overview');

    useEffect(() => {
        if (user) {
            fetchUserStats();
        }
    }, [user]);

    const fetchUserStats = async () => {
        if (!user) {
            console.error('No user found');
            setLoading(false);
            return;
        }

        if (!user.emailVerified) {
            console.error('User email not verified');
            setLoading(false);
            return;
        }

        const loadingToast = showLoading('Loading your statistics...');

        try {
            const token = await user.getIdToken();

            const response = await withRetry(async () => {
                const res = await fetch('/api/user/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Failed to fetch statistics');
                }
                return res;
            });

            const data = await response.json();
            setStats(data);
            updateLoadingToast(String(loadingToast), 'success', 'Statistics loaded');
        } catch (error) {
            updateLoadingToast(String(loadingToast), 'error', 'Failed to load statistics');
            handleError(error, 'Failed to fetch user stats');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
                <p className="text-gray-600">Loading your statistics...</p>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4 p-6 text-center">
                <AlertCircleIcon className="h-12 w-12 text-gray-400" />
                <div>
                    <h3 className="text-lg font-medium text-gray-900">No statistics available</h3>
                    <p className="text-gray-600">Start studying to see your insights!</p>
                </div>
                <Button
                    variant="outline"
                    onClick={fetchUserStats}
                    className="mt-2 bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try again
                </Button>
            </div>
        );
    }

    const metrics = [
        {
            title: 'Total Sessions',
            value: stats.totalSessions,
            icon: <Calendar className="h-4 w-4 text-blue-500" />,
            description: 'All time',
        },
        {
            title: 'Completed',
            value: stats.completedSessions,
            icon: <CheckCircle className="h-4 w-4 text-green-500" />,
            description: `${Math.round((stats.completedSessions / (stats.totalSessions ?? 0)) * 100)}% completion rate`,
        },
        {
            title: 'Vouch Score',
            value: stats.vouchScore,
            icon: (
                <span className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                    <span className="text-xl font-bold text-blue-600">{stats.vouchScore}</span>
                </span>
            ),
            description: 'Vouch Score',
        },
        {
            title: 'Avg. Duration',
            value: `${stats.avgSessionDuration}m`,
            icon: <Clock className="h-4 w-4 text-amber-500" />,
            description: 'Per session',
        },
    ];

    const achievements = [
        {
            name: 'First Session',
            description: 'Complete your first study session',
            earned: (stats?.totalSessions ?? 0) > 0,
            progress: Math.min((stats?.totalSessions ?? 0), 1),
            target: 1
        },
        {
            name: 'Study Streak',
            description: 'Complete 5 sessions in a week',
            earned: (stats?.weeklyActivity ?? []).some(day => day.completed >= 5),
            progress: Math.max(...(stats?.weeklyActivity ?? []).map(day => day.completed)),
            target: 5
        },
        {
            name: 'Reliable Partner',
            description: 'Maintain a vouch score above 85',
            earned: stats.vouchScore >= 85,
            progress: stats.vouchScore,
            target: 85
        },
        {
            name: 'Social Butterfly',
            description: 'Study with 10 different partners',
            earned: (stats?.studyPartners ?? []).length >= 10,
            progress: (stats?.studyPartners ?? []).length,
            target: 10
        },
        {
            name: 'Marathon Runner',
            description: 'Complete a 2-hour session',
            earned: (stats?.sessionDurationDistribution ?? {})['120min'] > 0,
            progress: (stats?.sessionDurationDistribution ?? {})['120min'],
            target: 1
        },
        {
            name: 'Consistency King',
            description: 'Complete 20 sessions total',
            earned: stats.completedSessions >= 20,
            progress: stats.completedSessions,
            target: 20
        }
    ];

    return (
        <ErrorBoundary
            onReset={() => {
                setStats(null);
                setLoading(true);
                fetchUserStats();
            }}
        >
            <div className="space-y-8 p-6">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900 inline-block border-b-4 border-blue-600 pb-2">My Statistics</h1>
                    <p className="text-xl text-slate-500 mt-4">Track your study progress and achievements</p>
                </div>

                {/* Main Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {metrics.map((metric, i) => (
                        <div key={metric.title} className="bg-blue-50 rounded-lg border border-blue-100 p-6 flex flex-col items-center shadow-sm">
                            {metric.title === 'Vouch Score' ? (
                                <div className="mb-2 flex items-center justify-center">
                                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                                </div>
                            ) : (
                                <div className="mb-2">{metric.icon}</div>
                            )}
                            <span className="text-3xl font-bold text-gray-900 mb-2">{metric.title === 'Vouch Score' ? stats.vouchScore : metric.value}</span>
                            <div className="text-sm text-slate-500">{metric.title === 'Vouch Score' ? 'Vouch Score' : metric.description}</div>
                        </div>
                    ))}
                </div>

                <div className="space-y-8">
                    <div className="flex space-x-8 border-b border-gray-200">
                        <button onClick={() => setActiveTab('overview')} className={`pb-4 border-b-2 text-base font-medium ${activeTab === 'overview' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-900'}`}>Overview</button>
                        <button onClick={() => setActiveTab('partners')} className={`pb-4 border-b-2 text-base font-medium ${activeTab === 'partners' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-900'}`}>Study Partners</button>
                        <button onClick={() => setActiveTab('progress')} className={`pb-4 border-b-2 text-base font-medium ${activeTab === 'progress' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-900'}`}>Progress</button>
                        <button onClick={() => setActiveTab('achievements')} className={`pb-4 border-b-2 text-base font-medium ${activeTab === 'achievements' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-900'}`}>Achievements</button>
                    </div>

                    <div className="space-y-8">
                        {activeTab === 'overview' && (
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Vouch Score Trend, Session Duration Preferences, Weekly Activity, Average Session Length */}
                                <div className="bg-white p-6 rounded-lg border border-gray-200">
                                    <div className="mb-4">
                                        <h3 className="text-2xl font-medium text-gray-900 mb-2">Vouch Score Trend</h3>
                                        <p className="text-gray-600">Your score over time</p>
                                    </div>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={(stats?.vouchScoreHistory ?? [])}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                                <XAxis dataKey="date" stroke="#6b7280" />
                                                <YAxis domain={[0, 100]} stroke="#6b7280" />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="score" stroke="#1f2937" strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg border border-gray-200">
                                    <div className="mb-4">
                                        <h3 className="text-2xl font-medium text-gray-900 mb-2">Session Duration Preferences</h3>
                                        <p className="text-gray-600">Your preferred session lengths</p>
                                    </div>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={Object.entries((stats?.sessionDurationDistribution ?? {})).map(([duration, count]) => ({ name: String(duration), value: Number(count) }))}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {Object.entries((stats?.sessionDurationDistribution ?? {})).map(([duration, count], index) => (
                                                        <Cell key={`cell-${String(index)}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg border border-gray-200">
                                    <div className="mb-4">
                                        <h3 className="text-2xl font-medium text-gray-900 mb-2">Weekly Activity</h3>
                                        <p className="text-gray-600">Your sessions this week</p>
                                    </div>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={(stats?.weeklyActivity ?? []).map(() => ({ name: '', sessions: 0, completed: 0 }))}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                                <XAxis dataKey="name" stroke="#6b7280" />
                                                <YAxis stroke="#6b7280" />
                                                <Tooltip />
                                                <Bar dataKey="sessions" fill="#3b82f6" />
                                                <Bar dataKey="completed" fill="#10b981" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg border border-gray-200">
                                    <div className="mb-4">
                                        <h3 className="text-2xl font-medium text-gray-900 mb-2">Average Session Length</h3>
                                        <p className="text-gray-600">Your average study session duration</p>
                                    </div>
                                    <div className="flex flex-col items-center justify-center h-[300px]">
                                        <span className="text-5xl font-light text-gray-900">{stats.avgSessionDuration} min</span>
                                        <span className="text-sm text-gray-600 mt-2">Based on completed sessions</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'partners' && (
                            <div className="bg-white p-8 rounded-lg border border-gray-200">
                                <h3 className="text-2xl font-medium text-gray-900 mb-4">Study Partners</h3>
                                {stats?.studyPartners && stats.studyPartners.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead>
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Session</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Rating</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {stats.studyPartners.map((partner, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{partner.name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{partner.sessions}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{partner.lastSession}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{partner.avgRating?.toFixed(2) ?? '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-600">You have not studied with any partners yet.</p>
                                )}
                            </div>
                        )}
                        {activeTab === 'progress' && (
                            <div className="bg-white p-8 rounded-lg border border-gray-200">
                                <h3 className="text-2xl font-medium text-gray-900 mb-4">Progress</h3>
                                {/* Show weekly activity and vouch score history charts */}
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <h4 className="text-lg font-semibold mb-2">Weekly Activity</h4>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <BarChart data={stats?.weeklyActivity ?? []}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                                <XAxis dataKey="name" stroke="#6b7280" />
                                                <YAxis stroke="#6b7280" />
                                                <Tooltip />
                                                <Bar dataKey="sessions" fill="#3b82f6" />
                                                <Bar dataKey="completed" fill="#10b981" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold mb-2">Vouch Score Trend</h4>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <LineChart data={stats?.vouchScoreHistory ?? []}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                                <XAxis dataKey="date" stroke="#6b7280" />
                                                <YAxis domain={[0, 100]} stroke="#6b7280" />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="score" stroke="#1f2937" strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'achievements' && (
                            <div className="bg-white p-8 rounded-lg border border-gray-200">
                                <h3 className="text-2xl font-medium text-gray-900 mb-4">Achievements</h3>
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {achievements.map((ach, idx) => (
                                        <div key={idx} className={`p-6 rounded-lg border ${ach.earned ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'}`}>
                                            <h4 className="text-lg font-semibold text-gray-900 mb-2">{ach.name}</h4>
                                            <p className="text-gray-600 mb-2">{ach.description}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">{ach.progress}/{ach.target}</span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${ach.earned ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>{ach.earned ? 'Earned' : 'In Progress'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}