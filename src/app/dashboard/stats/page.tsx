"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { currentUser, mockVouchHistory } from "@/lib/mock-data";
import { TrendingUp, CheckCircle, Target, ArrowUp, ArrowDown } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

function VouchHistoryChart() {
    const data = mockVouchHistory
        .map(item => ({...item, timestamp: new Date(item.timestamp)}))
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    let cumulativeScore = currentUser.vouch_score - data.reduce((acc, item) => acc + item.change, 0);

    const chartData = data.map(item => {
        cumulativeScore += item.change;
        return {
            date: item.timestamp.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
            score: cumulativeScore,
        };
    });

  return (
    <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                    contentStyle={{
                        background: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)'
                    }}
                />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
}


export default function StatsPage() {
  const weeklyProgress = Math.min((currentUser.sessions_completed / currentUser.weekly_goal) * 100, 100);

  return (
    <div className="space-y-6">
       <div>
            <h1 className="text-3xl font-headline font-bold">My Stats</h1>
            <p className="text-muted-foreground">Track your progress and Vouch Score history.</p>
        </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vouch Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentUser.vouch_score}%</div>
            <p className="text-xs text-muted-foreground">A measure of your reliability</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentUser.sessions_completed}</div>
            <p className="text-xs text-muted-foreground">Keep up the great work!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyProgress.toFixed(0)}%</div>
            <Progress value={weeklyProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Vouch Score History</CardTitle>
            <CardDescription>Your score over the last few sessions.</CardDescription>
          </CardHeader>
          <CardContent>
             <VouchHistoryChart />
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Recent Activity</CardTitle>
            <CardDescription>The last 5 changes to your Vouch Score.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Change</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockVouchHistory.slice(0, 5).map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge variant={log.change > 0 ? "default" : "destructive"} className="bg-opacity-20 text-current">
                        {log.change > 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                        {log.change}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{log.reason}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleDateString('en-GB')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
