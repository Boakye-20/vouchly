'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, MousePointer, Eye, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { withRetry } from '@/lib/utils';
import { handleError } from '@/lib/error-handling';

// Define the structure of the analytics data
interface AnalyticsData {
  pageViews: number;
  uniqueUsers: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: string;
  topPages: { path: string; views: number; percentage: number }[];
  userBehavior: {
    newUsers: number;
    returningUsers: number;
    userRetentionRate: number;
  };
}

interface GoogleAnalyticsWidgetProps {
  className?: string;
}

export function GoogleAnalyticsWidget({ className }: GoogleAnalyticsWidgetProps) {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        const token = await user.getIdToken();

        const response = await withRetry(() =>
          fetch('/api/analytics/google', {
            headers: { Authorization: `Bearer ${token}` },
          })
        );

        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const result: AnalyticsData = await response.json();
        setData(result);
      } catch (err) {
        setError('Could not load analytics data. Please try again later.');
        handleError(err, 'Failed to fetch Google Analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return null; // Or a 'no data' state
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Google Analytics</h3>
          <p className="text-sm text-muted-foreground">
            External traffic and behavior metrics
          </p>
        </div>
        <Badge variant="outline">Last 30 days</Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pageViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +8.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.sessions}</div>
            <p className="text-xs text-muted-foreground">
              Avg. duration: {data.avgSessionDuration}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.bounceRate}%</div>
            <p className="text-xs text-green-600">
              -2.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Pages</CardTitle>
          <CardDescription>Most visited pages by users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium">{page.path}</div>
                  <div className="text-xs text-muted-foreground">
                    {page.views} views ({page.percentage}%)
                  </div>
                </div>
                <div className="w-16 bg-gray-200 rounded-full h-2 relative">
                  <div 
                    className={`bg-blue-600 h-2 rounded-full`}
                    style={{ width: `${Math.min(page.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Behavior */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">User Behavior</CardTitle>
          <CardDescription>New vs returning users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.userBehavior.newUsers}
              </div>
              <div className="text-sm text-muted-foreground">New Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.userBehavior.returningUsers}
              </div>
              <div className="text-sm text-muted-foreground">Returning Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {data.userBehavior.userRetentionRate}%
              </div>
              <div className="text-sm text-muted-foreground">Retention Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Note about real implementation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This component is now connected to an API. To enable real data, 
          the backend at <code>/api/analytics/google</code> must be connected to the Google Analytics Reporting API.
        </p>
      </div>
    </div>
  );
}
