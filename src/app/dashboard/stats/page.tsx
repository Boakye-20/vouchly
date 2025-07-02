"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, onSnapshot, doc, orderBy, limit, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, CheckCircle, Target, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from "date-fns";
import styles from './stats.module.css';

interface VouchHistoryItem {
    id: string;
    change: number;
    reason: string;
    scoreAfter: number;
    timestamp: Date;
}

function VouchHistoryChart({ history }: { history: VouchHistoryItem[] }) {
    if (history.length === 0) {
        return <div className="text-center text-muted-foreground p-8">No score history yet.</div>;
    }

    const chartData = history
        .map(item => ({
            // Format the valid Date object for display
            date: format(item.timestamp, 'd MMM'),
            score: item.scoreAfter,
        }))
        .reverse(); // Reverse to show chronological order

    return (
        <div className={styles.chartContainer}>
            <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default function StatsPage() {
    const [user, setUser] = useState<any>(null);
    const [vouchHistory, setVouchHistory] = useState<VouchHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
            if (authUser) {
                const userDocRef = doc(db, 'users', authUser.uid);
                const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists()) setUser({ uid: doc.id, ...doc.data() });
                    setLoading(false);
                });

                const historyRef = collection(db, `users/${authUser.uid}/vouchHistory`);
                const q = query(historyRef, orderBy('timestamp', 'desc'), limit(15));

                const unsubscribeHistory = onSnapshot(q, (snapshot) => {
                    // --- THE FIX: Simplified and robust timestamp conversion ---
                    const historyData = snapshot.docs.map(doc => {
                        const data = doc.data();
                        // Firestore timestamps have a .toDate() method. This is the only path we need.
                        const timestamp = (data.timestamp as Timestamp)?.toDate() || new Date(); // Fallback to now if timestamp is missing

                        return {
                            id: doc.id,
                            ...data,
                            timestamp: timestamp,
                        } as VouchHistoryItem;
                    });
                    setVouchHistory(historyData);
                });

                return () => {
                    unsubscribeUser();
                    unsubscribeHistory();
                };
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    if (loading) {
        return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    if (!user) {
        return <div className="p-8 text-center">Could not load user data. Please log in again.</div>;
    }

    const weeklyProgress = Math.min(((user.sessionsThisWeek || 0) / (user.weeklyGoal || 5)) * 100, 100);

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-headline font-bold">My Stats</h1>
                <p className="text-muted-foreground">Track your progress and Vouch Score history.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Vouch Score</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{user.vouchScore || 80}%</div><p className="text-xs text-muted-foreground">A measure of your reliability</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Sessions Completed</CardTitle><CheckCircle className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{user.sessionsCompleted || 0}</div><p className="text-xs text-muted-foreground">Keep up the great work!</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Weekly Goal</CardTitle><Target className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{weeklyProgress.toFixed(0)}%</div><Progress value={weeklyProgress} className="mt-2 h-2" /></CardContent></Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4"><CardHeader><CardTitle className="font-headline">Vouch Score History</CardTitle><CardDescription>Your score over the last 15 recorded changes.</CardDescription></CardHeader><CardContent><VouchHistoryChart history={vouchHistory} /></CardContent></Card>
                <Card className="col-span-4 lg:col-span-3"><CardHeader><CardTitle className="font-headline">Recent Activity</CardTitle><CardDescription>The last 5 changes to your Vouch Score.</CardDescription></CardHeader><CardContent>
                    {vouchHistory.length > 0 ? (
                        <Table><TableHeader><TableRow><TableHead>Change</TableHead><TableHead>Reason</TableHead><TableHead className="text-right">Date</TableHead></TableRow></TableHeader><TableBody>
                            {vouchHistory.slice(0, 5).map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell><Badge variant={log.change > 0 ? "default" : "destructive"} className="bg-opacity-20 text-current">{log.change > 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}{log.change}</Badge></TableCell>
                                    <TableCell className="text-sm">{log.reason}</TableCell>
                                    {/* This now safely formats the valid Date object */}
                                    <TableCell className="text-right text-xs text-muted-foreground">{format(log.timestamp, 'd MMM yyyy')}</TableCell>
                                </TableRow>
                            ))}</TableBody></Table>
                    ) : (<div className="text-center text-muted-foreground p-8">No recent activity to display.</div>)}
                </CardContent></Card>
            </div>
        </div>
    );
}