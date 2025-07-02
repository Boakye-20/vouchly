'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
// --- NEW: More icons for new stats and elements ---
import { ArrowRight, BookOpen, Users, BarChart3, MessageSquare, Award, Flame, Clock, Lightbulb } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// --- NEW: Helper function for dynamic greeting ---
const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
};

// --- NEW: Array of tips for the new tip card ---
const productivityTips = [
    "Schedule sessions at the same time each week to build a routine.",
    "Use the chat to agree on a specific agenda before your session starts.",
    "A 5-minute break every hour can significantly boost your focus.",
    "Try a 'Silent & Independent' session for deep, uninterrupted work.",
    "Update your availability weekly to get the most accurate matches."
];

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [nextSession, setNextSession] = useState<any>(null);
    const [incomingRequest, setIncomingRequest] = useState<any>(null);
    // --- NEW: State for a random tip ---
    const [tip, setTip] = useState('');

    useEffect(() => {
        // --- NEW: Select a random tip on component mount ---
        setTip(productivityTips[Math.floor(Math.random() * productivityTips.length)]);

        const unsubscribeAuth = onAuthStateChanged(auth, (authUser: User | null) => {
            if (authUser) {
                const userDocRef = doc(db, 'users', authUser.uid);
                console.debug('[VOUCH DEBUG] User snapshot path:', `users/${authUser.uid}`);
                const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists()) {
                        setUser({ uid: doc.id, ...doc.data() });
                    }
                    setLoading(false);
                });
                const sessionQuery = query(collection(db, 'sessions'), where('participantIds', 'array-contains', authUser.uid), where('status', '==', 'scheduled'), where('scheduledStartTime', '>', new Date()), orderBy('scheduledStartTime', 'asc'), limit(1));
                console.debug('[VOUCH DEBUG] Session query:', sessionQuery);
                const unsubscribeSessions = onSnapshot(sessionQuery, (snapshot) => {
                    setNextSession(snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
                });
                const requestQuery = query(collection(db, 'sessions'), where('recipientId', '==', authUser.uid), where('status', '==', 'requested'), orderBy('createdAt', 'desc'), limit(1));
                console.debug('[VOUCH DEBUG] Request query:', requestQuery);
                const unsubscribeRequests = onSnapshot(requestQuery, (snapshot) => {
                    setIncomingRequest(snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
                });
                return () => { unsubscribeUser(); unsubscribeSessions(); unsubscribeRequests(); };
            } else { setLoading(false); }
        });
        return () => unsubscribeAuth();
    }, []);

    const UpNextCard = () => {
        if (nextSession) {
            const partnerName = nextSession.participants?.[nextSession.initiatorId === user.uid ? nextSession.recipientId : nextSession.initiatorId]?.name || 'your partner';
            return (
                <Card className="bg-primary/5 border-primary/20 shadow-lg">
                    <CardHeader><CardTitle className="text-2xl">Up Next: Your Session is Soon!</CardTitle><CardDescription>Your session with <span className="font-bold text-primary">{partnerName}</span> is {formatDistanceToNow(nextSession.scheduledStartTime.toDate(), { addSuffix: true })}.</CardDescription></CardHeader>
                    <CardContent><Link href="/dashboard/sessions"><Button className="w-full">View Session Details <ArrowRight className="ml-2 h-4 w-4" /></Button></Link></CardContent>
                </Card>
            );
        }
        if (incomingRequest) {
            const partnerName = incomingRequest.participants?.[incomingRequest.senderId]?.name || 'a partner';
            return (
                <Card className="bg-amber-500/5 border-amber-500/20 shadow-lg">
                    <CardHeader><CardTitle className="text-2xl">You Have a New Request!</CardTitle><CardDescription><span className="font-bold text-amber-600">{partnerName}</span> wants to start a study session with you.</CardDescription></CardHeader>
                    <CardContent><Link href="/dashboard/sessions"><Button variant="outline" className="w-full">Review Request <ArrowRight className="ml-2 h-4 w-4" /></Button></Link></CardContent>
                </Card>
            );
        }
        return (
            <Card className="bg-card shadow-lg">
                <CardHeader><CardTitle className="text-2xl">Ready for your next session?</CardTitle><CardDescription>Find a reliable partner and boost your productivity today.</CardDescription></CardHeader>
                <CardContent><Link href="/dashboard/browse"><Button className="w-full">Browse Partners <ArrowRight className="ml-2 h-4 w-4" /></Button></Link></CardContent>
            </Card>
        );
    };

    if (loading) {
        return (
            <div className="p-8 space-y-8">
                <Skeleton className="h-12 w-1/3" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8"><div className="lg:col-span-2 space-y-8"><Skeleton className="h-48 w-full" /><Skeleton className="h-32 w-full" /></div><div className="space-y-8"><Skeleton className="h-48 w-full" /><Skeleton className="h-48 w-full" /></div></div>
            </div>
        );
    }

    if (!user) return <div className="p-8 text-center">Please log in to view your dashboard.</div>;

    const vouchScore = user.vouchScore || 80;
    const weeklyGoal = user.weeklyGoal || 5;
    const sessionsThisWeek = user.sessionsThisWeek || 0;
    const totalSessions = user.totalSessionsCompleted || 0;
    const studyStreak = user.studyStreak || 0;
    const hoursFocused = Math.round(totalSessions * 1.5); // Assuming average session is 90 mins

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div>
                {/* --- UPDATED: Dynamic greeting --- */}
                <h1 className="text-3xl font-bold tracking-tight">{getGreeting()}, {user.name?.split(' ')[0] || 'Student'}!</h1>
                <p className="text-muted-foreground">Here’s what’s happening with your study sessions today.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <UpNextCard />
                    <Card>
                        <CardHeader><CardTitle>Weekly Goal Progress</CardTitle><CardDescription>You've completed {sessionsThisWeek} of your {weeklyGoal} session goal this week.</CardDescription></CardHeader>
                        <CardContent><Progress value={(sessionsThisWeek / weeklyGoal) * 100} className="w-full" /></CardContent>
                    </Card>

                    {/* --- NEW: At a Glance Stats Card --- */}
                    <Card>
                        <CardHeader><CardTitle>At a Glance</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                            <div className="bg-muted p-4 rounded-lg"><Award className="mx-auto h-6 w-6 mb-2 text-primary" /><p className="text-2xl font-bold">{totalSessions}</p><p className="text-sm text-muted-foreground">Total Sessions</p></div>
                            <div className="bg-muted p-4 rounded-lg"><Flame className="mx-auto h-6 w-6 mb-2 text-orange-500" /><p className="text-2xl font-bold">{studyStreak}</p><p className="text-sm text-muted-foreground">Study Streak</p></div>
                            <div className="bg-muted p-4 rounded-lg"><Clock className="mx-auto h-6 w-6 mb-2 text-green-500" /><p className="text-2xl font-bold">{hoursFocused}</p><p className="text-sm text-muted-foreground">Hours Focused</p></div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card>
                        <CardHeader><CardTitle>Your Vouch Score</CardTitle></CardHeader>
                        <CardContent className="flex flex-col items-center justify-center">
                            <div className="relative h-32 w-32">
                                <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" fill="none" strokeWidth="12" className="stroke-muted" /><circle cx="60" cy="60" r="54" fill="none" strokeWidth="12" className="stroke-primary" strokeDasharray={339.292} strokeDashoffset={339.292 * (1 - vouchScore / 100)} style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }} /></svg>
                                <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold">{vouchScore}%</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-4">This reflects your reliability.</p>
                        </CardContent>
                    </Card>

                    {/* --- NEW: Productivity Tip Card --- */}
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4 flex items-start gap-4">
                            <Lightbulb className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-semibold text-blue-900">Productivity Tip</h4>
                                <p className="text-sm text-blue-800/80">{tip}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Quick Actions</CardTitle>
                            {/* --- NEW: Online indicator placeholder --- */}
                            <span className="text-xs flex items-center text-green-600"><div className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>47 Partners Online</span>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/dashboard/browse" className="block"><Button variant="outline" className="w-full justify-start"><Users className="mr-2 h-4 w-4" /> Browse Partners</Button></Link>
                            <Link href="/dashboard/sessions" className="block"><Button variant="outline" className="w-full justify-start"><BookOpen className="mr-2 h-4 w-4" /> Manage My Sessions</Button></Link>
                            <Link href="/dashboard/messages" className="block"><Button variant="outline" className="w-full justify-start"><MessageSquare className="mr-2 h-4 w-4" /> View Messages</Button></Link>
                            <Link href="/dashboard/stats" className="block"><Button variant="outline" className="w-full justify-start"><BarChart3 className="mr-2 h-4 w-4" /> See My Stats</Button></Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}