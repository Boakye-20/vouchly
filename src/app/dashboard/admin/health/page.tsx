'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Activity, Database, Users, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HealthData {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    uptime: number;
    environment: string;
    version: string;
    checks: {
        database: {
            status: 'connected' | 'disconnected';
            responseTime: string;
        };
        metrics: {
            totalUsers: number;
            totalSessions: number;
        };
    };
    memory: {
        used: number;
        total: number;
    };
}

export default function HealthPage() {
    const [healthData, setHealthData] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { toast } = useToast();

    const fetchHealthData = async () => {
        try {
            const response = await fetch('/api/health');
            const data = await response.json();
            setHealthData(data);
        } catch (error) {
            console.error('Failed to fetch health data:', error);
            toast({
                title: 'Health Check Failed',
                description: 'Unable to fetch system health status',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHealthData();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchHealthData();
    };

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${days}d ${hours}h ${minutes}m`;
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">System Health</h1>
                    <Button disabled>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 bg-gray-200 rounded animate-pulse" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (!healthData) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Health Check Unavailable</h2>
                    <p className="text-muted-foreground mb-4">
                        Unable to fetch system health information.
                    </p>
                    <Button onClick={handleRefresh}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    const isHealthy = healthData.status === 'healthy';
    const dbConnected = healthData.checks.database.status === 'connected';

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">System Health</h1>
                <Button onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
            </div>

            {/* Overall Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Overall Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        {isHealthy ? (
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        ) : (
                            <XCircle className="h-8 w-8 text-red-500" />
                        )}
                        <div>
                            <Badge variant={isHealthy ? 'default' : 'destructive'} className="text-sm">
                                {isHealthy ? 'Healthy' : 'Unhealthy'}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                                Last checked: {new Date(healthData.timestamp).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Database Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Database
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 mb-2">
                            {dbConnected ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <Badge variant={dbConnected ? 'default' : 'destructive'}>
                                {dbConnected ? 'Connected' : 'Disconnected'}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Response: {healthData.checks.database.responseTime}
                        </p>
                    </CardContent>
                </Card>

                {/* System Metrics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {healthData.checks.metrics.totalUsers.toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground">Total registered users</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Sessions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {healthData.checks.metrics.totalSessions.toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground">Total study sessions</p>
                    </CardContent>
                </Card>

                {/* System Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>System Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Environment:</span>
                            <Badge variant="outline">{healthData.environment}</Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Version:</span>
                            <span className="text-sm font-medium">{healthData.version}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Uptime:</span>
                            <span className="text-sm font-medium">{formatUptime(healthData.uptime)}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Memory Usage */}
                <Card>
                    <CardHeader>
                        <CardTitle>Memory Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Used:</span>
                                <span className="text-sm font-medium">{healthData.memory.used} MB</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Total:</span>
                                <span className="text-sm font-medium">{healthData.memory.total} MB</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{
                                        width: `${Math.round((healthData.memory.used / healthData.memory.total) * 100)}%`
                                    }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 