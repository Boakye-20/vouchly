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
import { ArrowRight, BookOpen, Users, BarChart3, MessageSquare, Award, Flame, Clock, Lightbulb, Calendar, CheckCircle, TrendingUp, Target, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRef } from 'react';

function AnimatedNumber({ value }: { value: number }) {
    const ref = useRef<HTMLSpanElement>(null);
    useEffect(() => {
        if (!ref.current) return;
        let start = 0;
        const end = value;
        if (start === end) return;
        let current = start;
        const duration = 800;
        const step = Math.ceil(end / (duration / 16));
        const animate = () => {
            current += step;
            if (current > end) current = end;
            if (ref.current) ref.current.textContent = String(current);
            if (current < end) requestAnimationFrame(animate);
        };
        animate();
    }, [value]);
    return <span ref={ref}>{value}</span>;
}

function CircularProgress({ value, max, label }: { value: number; max: number; label?: string }) {
    const radius = 36;
    const stroke = 6;
    const norm = Math.min(value / max, 1);
    const circ = 2 * Math.PI * radius;
    const offset = circ * (1 - norm);
    return (
        <svg width={90} height={90} className="block mx-auto">
            <circle cx={45} cy={45} r={radius} stroke="#E5E7EB" strokeWidth={stroke} fill="none" />
            <circle
                cx={45}
                cy={45}
                r={radius}
                stroke="#2563EB"
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(.4,1.7,.7,1)' }}
            />
            <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="1.5rem" fill="#111827" fontWeight="bold">
                {value}
            </text>
            {label && (
                <text x="50%" y="68%" textAnchor="middle" fontSize=".85rem" fill="#6B7280">{label}</text>
            )}
        </svg>
    );
}

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
    // Add state for vouch score change this week
    const [vouchScoreDeltaThisWeek, setVouchScoreDeltaThisWeek] = useState<number | null>(null);

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

    useEffect(() => {
        // Calculate vouch score delta for this week if vouchScoreHistory is available
        if (user?.vouchScoreHistory) {
            const now = new Date();
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay()); // Sunday as start of week
            let delta = 0;
            for (const entry of user.vouchScoreHistory) {
                const entryDate = new Date(entry.date);
                if (entryDate >= weekStart && entryDate <= now) {
                    delta += entry.change;
                }
            }
            setVouchScoreDeltaThisWeek(delta);
        }
    }, [user]);

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
        <div className="max-w-7xl mx-auto px-6 pt-4">
            <div className="flex justify-center">
                <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900 border-b-4 border-blue-600 inline-block pb-2 mb-4 text-center">{getGreeting()}, {user.name?.split(' ')[0] || 'Student'}!</h1>
            </div>
            <p className="text-lg text-gray-600 text-center mb-8">Here's what's happening with your study sessions today.</p>
            {/* Two-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Main column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Up Next Card */}
                    <div className="relative bg-white p-8 rounded-xl border border-gray-200 shadow-sm overflow-hidden group transition-shadow hover:shadow-lg">
                        {/* Move the blue bar to the bottom */}
                        <div className="flex items-center gap-3 mb-4">
                            <Clock className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-medium text-gray-900">Up Next</h2>
                        </div>
                        <UpNextCard />
                        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 animate-gradient-x" />
                    </div>
                    {/* Weekly Goal Progress */}
                    <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Target className="h-6 w-6 text-blue-600" />
                            <h3 className="text-xl font-medium text-gray-900">Weekly Goal Progress</h3>
                        </div>
                        <p className="text-base text-gray-600 mb-4">You've completed {sessionsThisWeek} of your {weeklyGoal} session goal this week.</p>
                        <Progress value={Math.min((sessionsThisWeek / weeklyGoal) * 100, 100)} className="h-3 bg-gray-100" />
                        <div className="flex gap-2 mt-4 justify-center">
                            {[...Array(weeklyGoal)].map((_, i) => {
                                if (i < sessionsThisWeek) {
                                    // Completed: green
                                    return (
                                        <span key={i} className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold border bg-green-100 text-green-600 border-green-200">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        </span>
                                    );
                                } else if (i === sessionsThisWeek) {
                                    // In progress: amber
                                    return (
                                        <span key={i} className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold border bg-amber-100 text-amber-600 border-amber-200 animate-pulse">
                                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                                        </span>
                                    );
                                } else {
                                    // Not started: grey
                                    return (
                                        <span key={i} className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold border bg-slate-100 text-slate-400 border-slate-200">
                                            {i + 1}
                                        </span>
                                    );
                                }
                            })}
                        </div>
                    </div>
                    {/* At a Glance Stats */}
                    <div className="bg-blue-50 p-8 rounded-xl border border-blue-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <BarChart3 className="h-6 w-6 text-blue-600" />
                            <h3 className="text-xl font-medium text-gray-900">At a Glance</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex flex-col items-center">
                                <Users className="h-7 w-7 text-blue-600 mb-2" />
                                <div className="text-2xl font-bold text-gray-900"><AnimatedNumber value={totalSessions} /></div>
                                <div className="text-sm text-slate-500">Sessions</div>
                            </div>
                            <div className="flex flex-col items-center">
                                <Flame className="h-7 w-7 text-green-500 mb-2" />
                                <div className="text-2xl font-bold text-gray-900"><AnimatedNumber value={studyStreak} /></div>
                                <div className="text-sm text-slate-500">Streak</div>
                            </div>
                            <div className="flex flex-col items-center">
                                <Clock className="h-7 w-7 text-slate-400 mb-2" />
                                <div className="text-2xl font-bold text-gray-900"><AnimatedNumber value={hoursFocused} /></div>
                                <div className="text-sm text-slate-500">Hours Focused</div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Sidebar */}
                <aside className="space-y-8">
                    {/* Vouch Score Widget - new style */}
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm flex flex-col items-center">
                        <div className="mb-2 text-slate-500 text-sm">Your Vouch Score</div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-7 w-7 text-blue-600" />
                            <span className="text-2xl font-bold text-blue-600">{vouchScore}</span>
                        </div>
                        {vouchScoreDeltaThisWeek !== null && vouchScoreDeltaThisWeek !== 0 && (
                            <div className={`mt-2 text-xs font-medium flex items-center gap-1 ${vouchScoreDeltaThisWeek > 0 ? 'text-green-600' : vouchScoreDeltaThisWeek < 0 ? 'text-red-600' : 'text-amber-600'}`}>
                                {vouchScoreDeltaThisWeek > 0 && <CheckCircle className="h-4 w-4 text-green-500" />}
                                {vouchScoreDeltaThisWeek < 0 && <XCircle className="h-4 w-4 text-red-500" />}
                                {vouchScoreDeltaThisWeek === 0 && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                                {vouchScoreDeltaThisWeek > 0 ? `+${vouchScoreDeltaThisWeek}` : vouchScoreDeltaThisWeek}
                                this week
                            </div>
                        )}
                    </div>
                    {/* Productivity Tip */}
                    <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 flex items-center gap-3">
                        <Lightbulb className="h-6 w-6 text-amber-500 flex-shrink-0" />
                        <div className="text-sm text-amber-900">{tip}</div>
                    </div>
                    {/* Quick Actions */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-base font-medium text-gray-900">Quick Actions</div>
                            <span className="text-xs text-green-600">• {onlineUsersCount} online</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Link href="/dashboard/browse" className="group">
                                <button className="w-full flex flex-col items-center justify-center p-3 rounded-lg border border-blue-100 bg-blue-50 hover:bg-blue-100 transition-colors">
                                    <Users className="h-5 w-5 text-blue-600 mb-1 group-hover:text-blue-700" />
                                    <span className="text-xs font-medium text-gray-900">Browse</span>
                                </button>
                            </Link>
                            <Link href="/dashboard/sessions" className="group">
                                <button className="w-full flex flex-col items-center justify-center p-3 rounded-lg border border-blue-100 bg-blue-50 hover:bg-blue-100 transition-colors">
                                    <BookOpen className="h-5 w-5 text-blue-600 mb-1 group-hover:text-blue-700" />
                                    <span className="text-xs font-medium text-gray-900">Sessions</span>
                                </button>
                            </Link>
                            <Link href="/dashboard/messages" className="group">
                                <button className="w-full flex flex-col items-center justify-center p-3 rounded-lg border border-blue-100 bg-blue-50 hover:bg-blue-100 transition-colors">
                                    <MessageSquare className="h-5 w-5 text-blue-600 mb-1 group-hover:text-blue-700" />
                                    <span className="text-xs font-medium text-gray-900">Messages</span>
                                </button>
                            </Link>
                            <Link href="/dashboard/stats" className="group">
                                <button className="w-full flex flex-col items-center justify-center p-3 rounded-lg border border-blue-100 bg-blue-50 hover:bg-blue-100 transition-colors">
                                    <BarChart3 className="h-5 w-5 text-blue-600 mb-1 group-hover:text-blue-700" />
                                    <span className="text-xs font-medium text-gray-900">Stats</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}