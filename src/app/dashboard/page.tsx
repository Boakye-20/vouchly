'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where, orderBy, limit, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
// --- NEW: More icons for new stats and elements ---
import { ArrowRight, BookOpen, Users, BarChart3, MessageSquare, Award, Flame, Clock, Lightbulb, Calendar, CheckCircle, TrendingUp, Target } from 'lucide-react';
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
    // --- NEW: State for online users count ---
    const [onlineUsersCount, setOnlineUsersCount] = useState(0);

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

                // --- NEW: Track online users count ---
                const onlineUsersQuery = query(
                    collection(db, 'users'),
                    where('lastSeen', '>=', new Date(Date.now() - 5 * 60 * 1000)) // Users active in last 5 minutes
                );
                const unsubscribeOnlineUsers = onSnapshot(onlineUsersQuery, (snapshot) => {
                    setOnlineUsersCount(snapshot.size);
                });

                // --- NEW: Update user's lastSeen timestamp periodically ---
                const updateLastSeen = async () => {
                    try {
                        await updateDoc(userDocRef, {
                            lastSeen: new Date()
                        });
                    } catch (error) {
                        console.error('Failed to update lastSeen:', error);
                    }
                };

                // Update lastSeen every 2 minutes while user is active
                const lastSeenInterval = setInterval(updateLastSeen, 2 * 60 * 1000);

                // Initial update
                updateLastSeen();

                return () => {
                    unsubscribeUser();
                    unsubscribeSessions();
                    unsubscribeRequests();
                    unsubscribeOnlineUsers();
                    clearInterval(lastSeenInterval);
                };
            } else { setLoading(false); }
        });
        return () => unsubscribeAuth();
    }, []);

    const UpNextCard = () => {
        if (nextSession) {
            const partnerName = nextSession.participants?.[nextSession.initiatorId === user.uid ? nextSession.recipientId : nextSession.initiatorId]?.name || 'your partner';
            return (
                <div className="bg-white p-8 rounded-lg border border-gray-200">
                    <div className="mb-6">
                        <h2 className="text-2xl font-medium text-gray-900 mb-2">Up Next: Your Session is Soon!</h2>
                        <p className="text-lg text-gray-600">Your session with <span className="font-medium text-gray-900">{partnerName}</span> is {formatDistanceToNow(nextSession.scheduledStartTime.toDate(), { addSuffix: true })}.</p>
                    </div>
                    <div className="flex justify-center">
                        <Link href="/dashboard/sessions">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors flex items-center">
                                View Session Details <ArrowRight className="ml-2 h-4 w-4" />
                            </button>
                        </Link>
                    </div>
                </div>
            );
        }
        if (incomingRequest) {
            const partnerName = incomingRequest.participants?.[incomingRequest.senderId]?.name || 'a partner';
            return (
                <div className="bg-white p-8 rounded-lg border border-gray-200">
                    <div className="mb-6">
                        <h2 className="text-2xl font-medium text-gray-900 mb-2">You Have a New Request!</h2>
                        <p className="text-lg text-gray-600"><span className="font-medium text-gray-900">{partnerName}</span> wants to start a study session with you.</p>
                    </div>
                    <div className="flex justify-center">
                        <Link href="/dashboard/sessions">
                            <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg text-lg font-medium transition-colors flex items-center">
                                Review Request <ArrowRight className="ml-2 h-4 w-4" />
                            </button>
                        </Link>
                    </div>
                </div>
            );
        }
        return (
            <div className="bg-white p-8 rounded-lg border border-gray-200">
                <div className="mb-6">
                    <h2 className="text-2xl font-medium text-gray-900 mb-2">Ready for your next session?</h2>
                    <p className="text-lg text-gray-600">Find a reliable partner and boost your productivity today.</p>
                </div>
                <div className="flex justify-center">
                    <Link href="/dashboard/browse">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors flex items-center">
                            Browse Partners <ArrowRight className="ml-2 h-4 w-4" />
                        </button>
                    </Link>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">
                <div className="h-12 w-1/3 bg-gray-200 rounded animate-pulse" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="h-48 w-full bg-gray-200 rounded-lg animate-pulse" />
                        <div className="h-32 w-full bg-gray-200 rounded-lg animate-pulse" />
                    </div>
                    <div className="space-y-8">
                        <div className="h-48 w-full bg-gray-200 rounded-lg animate-pulse" />
                        <div className="h-48 w-full bg-gray-200 rounded-lg animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!user) return <div className="max-w-7xl mx-auto px-6 py-16 text-center text-gray-600">Please log in to view your dashboard.</div>;

    const vouchScore = user.vouchScore || 80;
    const weeklyGoal = user.weeklyGoal || 5;
    const sessionsThisWeek = user.sessionsThisWeek || 0;
    const totalSessions = user.totalSessionsCompleted || 0;
    const studyStreak = user.studyStreak || 0;
    const hoursFocused = Math.round(totalSessions * 1.5); // Assuming average session is 90 mins

    return (
        <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900 flex items-center justify-center gap-3">
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                    {getGreeting()}, {user.name?.split(' ')[0] || 'Student'}!
                </h1>
                <p className="text-xl text-gray-600 mt-4">Here's what's happening with your study sessions today.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3 mb-6">
                            <Clock className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-medium text-gray-900">Up Next</h2>
                        </div>
                        <UpNextCard />
                    </div>

                    <div className="bg-white p-8 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3 mb-2">
                            <Target className="h-6 w-6 text-blue-600" />
                            <h3 className="text-xl font-medium text-gray-900">Weekly Goal Progress</h3>
                        </div>
                        <p className="text-base text-gray-600 mb-6">You've completed {sessionsThisWeek} of your {weeklyGoal} session goal this week.</p>
                        <Progress value={Math.min((sessionsThisWeek / weeklyGoal) * 100, 100)} className="h-4" />
                    </div>

                    <div className="bg-white p-8 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3 mb-2">
                            <Award className="h-6 w-6 text-blue-600" />
                            <h3 className="text-xl font-medium text-gray-900">Vouch Score</h3>
                        </div>
                        <div className="flex items-center gap-4 mb-2">
                            <span className="text-4xl font-bold text-gray-900">{vouchScore}</span>
                            <span className="text-base text-gray-600">Your reliability rating</span>
                        </div>
                        <p className="text-base text-gray-600">Complete sessions to increase your score. No-shows or late cancellations will reduce it.</p>
                    </div>

                    <div className="bg-white p-8 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3 mb-2">
                            <Lightbulb className="h-6 w-6 text-blue-600" />
                            <h3 className="text-xl font-medium text-gray-900">Productivity Tip</h3>
                        </div>
                        <p className="text-base text-gray-600">{tip}</p>
                    </div>
                </div>
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Users className="h-6 w-6 text-blue-600" />
                                <h3 className="text-xl font-medium text-gray-900">Quick Actions</h3>
                            </div>
                            <span className="text-xs flex items-center text-gray-600">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>
                                {onlineUsersCount} Partners Online
                            </span>
                        </div>
                        <div className="space-y-3">
                            <Link href="/dashboard/browse" className="block">
                                <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center text-gray-700">
                                    <Users className="mr-3 h-5 w-5 text-gray-400" /> Browse Partners
                                </button>
                            </Link>
                            <Link href="/dashboard/sessions" className="block">
                                <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center text-gray-700">
                                    <BookOpen className="mr-3 h-5 w-5 text-gray-400" /> Manage My Sessions
                                </button>
                            </Link>
                            <Link href="/dashboard/messages" className="block">
                                <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center text-gray-700">
                                    <MessageSquare className="mr-3 h-5 w-5 text-gray-400" /> View Messages
                                </button>
                            </Link>
                            <Link href="/dashboard/stats" className="block">
                                <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center text-gray-700">
                                    <BarChart3 className="mr-3 h-5 w-5 text-gray-400" /> See My Stats
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}