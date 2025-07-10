import Link from 'next/link';
import { VouchlyLogo } from '@/components/icons';
import { CheckCircle, Mail, Users, Brain, Video, Lock, TrendingUp, Filter, Bell, BarChart3, MessageSquare, Award, Calendar, Lightbulb, BookOpen, Clock, Flame, Target, XCircle, ShieldCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { PartnerCard } from '@/components/partners/partner-card';
import { PartnerProfileModal } from '@/components/partners/partner-profile-modal';
import PartnerProfileModalDemo from '@/components/partners/PartnerProfileModalDemo';

export default function HomePage() {
    // Mock partner data for landing page demo
    const mockPartner = {
        name: 'Amelia Chen',
        subject: 'Psychology',
        course: 'BSc Psychology',
        yearOfStudy: 'Year 2',
        university: 'University of Manchester',
        coStudyingAtmosphere: 'Quietly Co-working',
        vouchScore: 92,
        matchScore: 87,
        bio: 'Second-year Psychology student. I love focused, quiet sessions and always show up on time. Looking for a reliable study partner to keep each other accountable!'
    };

    // Additional mock partner data
    const mockPartners = [
        {
            name: 'Amelia Chen',
            subject: 'Psychology',
            course: 'BSc Psychology',
            yearOfStudy: 'Year 2',
            university: 'University of Manchester',
            coStudyingAtmosphere: 'Quietly Co-working',
            vouchScore: 92,
            matchScore: 87,
            bio: 'Second-year Psychology student. I love focused, quiet sessions and always show up on time. Looking for a reliable study partner to keep each other accountable!'
        },
        {
            name: 'James Patel',
            subject: 'Mechanical Engineering',
            course: 'MEng Mechanical Engineering',
            yearOfStudy: 'Year 3',
            university: 'Imperial College London',
            coStudyingAtmosphere: 'Motivational & Social',
            vouchScore: 85,
            matchScore: 80,
            bio: 'Love group study and sharing ideas. Always up for a challenge and helping others succeed.'
        },
        {
            name: 'Sophie Williams',
            subject: 'Law',
            course: 'LLB Law',
            yearOfStudy: 'Year 1',
            university: 'University of Leeds',
            coStudyingAtmosphere: 'Silent & Independent',
            vouchScore: 78,
            matchScore: 75,
            bio: 'Focused, independent learner. Looking for a partner who values quiet, productive sessions.'
        }
    ];

    // Mock dashboard data
    const dashboardMock = {
        name: 'Amelia',
        vouchScore: 92,
        weeklyGoal: 5,
        sessionsThisWeek: 3,
        totalSessions: 24,
        studyStreak: 7,
        hoursFocused: 36,
        vouchScoreDeltaThisWeek: 2,
        tip: 'Schedule sessions at the same time each week to build a routine.',
        onlineUsersCount: 18
    };

    // Mock stats data
    const statsMock = {
        totalSessions: 24,
        completedSessions: 22,
        vouchScore: 92,
        avgSessionDuration: 75,
        vouchScoreHistory: [
            { date: 'Mon', score: 90 },
            { date: 'Tue', score: 91 },
            { date: 'Wed', score: 92 },
            { date: 'Thu', score: 92 },
            { date: 'Fri', score: 92 },
        ]
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="pt-8 pb-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="max-w-4xl">
                        <div className="text-blue-600 text-base font-medium tracking-wide mb-6 flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            BUILT FOR UK UNIVERSITY STUDENTS
                        </div>
                        <h1 className="text-5xl md:text-7xl font-light tracking-tight text-gray-900 leading-tight mb-8">
                            Find reliable study partners<br />
                            who actually show up.
                        </h1>
                        <p className="text-2xl text-gray-600 mb-8 leading-relaxed">
                            Vouchly connects UK university students through intelligent matching, built-in video sessions, and a transparent accountability system that rewards reliability.
                        </p>
                        <div className="mb-8">
                            <Link href="/auth" className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors inline-block">
                                Get Started Free
                            </Link>
                        </div>
                        <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 text-base transition-colors">
                            See how it works ↓
                        </Link>
                    </div>
                    {/* Problem Statement */}
                    <div className="max-w-4xl flex items-center gap-4 mb-12 mt-16">
                        <Award className="h-8 w-8 text-blue-600 flex-shrink-0" />
                        <p className="text-3xl md:text-4xl text-gray-700 leading-relaxed font-light">
                            Finding someone to study with is easy. Finding someone who actually shows up? That's the real challenge.
                        </p>
                    </div>
                    {/* 3-visual row for customer understanding */}
                    <div className="mt-20 pt-2 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div className="flex flex-col items-center">
                            <PartnerCard partner={mockPartners[0]} currentUser={null} disableViewProfile />
                            <div className="text-sm text-slate-500 mt-2 text-center">Example study partner profile</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-blue-100">
                                {/* Header */}
                                <div className="relative bg-white border-b border-blue-100 p-6">
                                    <div className="flex items-center gap-6">
                                        {/* Avatar */}
                                        <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center text-2xl font-semibold text-white border-4 border-blue-100">
                                            A
                                        </div>
                                        {/* Basic Info */}
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-semibold text-gray-900 mb-1">Amelia Chen</h2>
                                            <p className="text-gray-700">BSc Psychology • Year 2</p>
                                            <p className="text-blue-600 text-sm mt-1">University of Manchester</p>
                                        </div>
                                        {/* Gold Badge */}
                                        <div className="flex flex-col items-end">
                                            <div className="px-4 py-2 rounded-lg text-center border-2 font-bold shadow-lg text-base tracking-wide uppercase flex items-center gap-2 bg-yellow-400 border-yellow-400 text-yellow-900" style={{ letterSpacing: '0.05em' }}>
                                                <svg className="inline h-5 w-5 mr-2 text-yellow-700" fill="currentColor" viewBox="0 0 20 20"><polygon points="10,2 12.59,7.36 18.51,8.09 14,12.26 15.18,18.02 10,15.1 4.82,18.02 6,12.26 1.49,8.09 7.41,7.36" /></svg>
                                                Match Level: Gold
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Tabs (static, Overview only) */}
                                <div className="p-6">
                                    <div className="grid w-full grid-cols-3 bg-blue-50 border border-blue-100 rounded-lg mb-6">
                                        <div className="text-center py-2 font-medium text-blue-900 bg-white rounded-lg border border-blue-100">Overview</div>
                                        <div className="text-center py-2 text-gray-400">Schedule</div>
                                        <div className="text-center py-2 text-gray-400">Stats</div>
                                    </div>
                                    {/* Overview Tab Content */}
                                    <div className="space-y-4 mt-2">
                                        {/* Match Compatibility Breakdown */}
                                        {/* Gold Match Example */}
                                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 mb-4">
                                            <h3 className="font-bold mb-3 text-gray-900">Why You're a Gold Match</h3>
                                            <ul className="space-y-2 mt-2">
                                                <li className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-900">Good Schedule Overlap</span>
                                                    <span className="text-slate-500">62% matching times</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-900">Similar Vouch Score</span>
                                                    <span className="text-slate-500">Both around 87</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-900">Same Subject</span>
                                                    <span className="text-slate-500">Psychology</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-900">Same Study Style</span>
                                                    <span className="text-slate-500">Quietly Co-working</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-900">Same University</span>
                                                    <span className="text-slate-500">University of Manchester</span>
                                                </li>
                                            </ul>
                                        </div>
                                        {/* Bio Section */}
                                        <div>
                                            <h3 className="font-medium mb-2 text-gray-900">About</h3>
                                            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">Second-year Psychology student. I love focused, quiet sessions and always show up on time. Looking for a reliable study partner to keep each other accountable!</p>
                                        </div>
                                        {/* Study Details */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="text-lg font-bold mb-1">Faculty</h4>
                                                <p className="text-base text-gray-900">Humanities</p>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold mb-1">Subject</h4>
                                                <p className="text-base text-gray-900">Psychology</p>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold mb-1">Study Style</h4>
                                                <p className="text-base text-gray-900">Quietly Co-working</p>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold mb-1">Camera Preference</h4>
                                                <p className="text-base text-gray-900">Not specified</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Send Request Button (static) */}
                                <div className="px-6 pb-6 border-t pt-4">
                                    <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium text-base cursor-not-allowed hover:bg-blue-700 transition-colors" disabled>Send Study Request</button>
                                </div>
                            </div>
                            <div className="text-sm text-slate-500 mt-2 text-center">Partner profile modal (example)</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vouch Score Explanation */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="max-w-4xl">
                        <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-8 flex items-center gap-3">
                            <BarChart3 className="h-7 w-7 text-blue-600" />
                            Your Vouch Score: Your Academic Reputation
                        </h2>
                        <p className="text-2xl text-gray-600 mb-12 leading-relaxed">
                            Every action you take affects your Vouch Score, a transparent trust system that rewards reliability and penalises no-shows. Everyone starts with 80 points.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" />Earn Points</h3>
                                <ul className="space-y-2 text-lg text-gray-600">
                                    <li className="flex items-start">
                                        <span className="text-green-500 mr-2"><CheckCircle className="h-5 w-5" /></span>
                                        Complete a session: +2 points
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-green-500 mr-2"><CheckCircle className="h-5 w-5" /></span>
                                        Start session on time: +0 points
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-green-500 mr-2"><CheckCircle className="h-5 w-5" /></span>
                                        Reschedule with notice: +0 points
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2"><Award className="h-5 w-5 text-red-500" />Lose Points</h3>
                                <ul className="space-y-2 text-lg text-gray-600">
                                    <li className="flex items-start">
                                        <span className="text-red-500 mr-2"><Award className="h-5 w-5" /></span>
                                        Missed session without notice: -10 points
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-red-500 mr-2"><Award className="h-5 w-5" /></span>
                                        Cancel within 4 hours of start: -10 points
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-red-500 mr-2"><Award className="h-5 w-5" /></span>
                                        Two consecutive reschedules: -5 points
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-lg border border-gray-200 mb-8">
                            <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="h-6 w-6 text-blue-600" />How It Affects Your Experience</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-blue-600 mb-2 flex items-center justify-center gap-2"><Users className="h-5 w-5 text-blue-600" />Better Matches</div>
                                    <p className="text-lg text-gray-600">Higher scores get matched with more reliable partners</p>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-blue-600 mb-2 flex items-center justify-center gap-2"><BarChart3 className="h-5 w-5 text-blue-600" />Transparent History</div>
                                    <p className="text-lg text-gray-600">Every score change is logged with reasons</p>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-blue-600 mb-2 flex items-center justify-center gap-2"><Award className="h-5 w-5 text-blue-600" />Starting Score: 80</div>
                                    <p className="text-lg text-gray-600">Everyone starts with a fair baseline</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                            <h3 className="text-lg font-medium text-blue-900 mb-3 flex items-center gap-2"><Lightbulb className="h-5 w-5 text-blue-600" />Fair & Transparent Rules</h3>
                            <div className="space-y-2 text-blue-800 text-base">
                                <p><strong>Rescheduling:</strong> First reschedule is free. Only consecutive reschedules (without completing a session in between) are penalised.</p>
                                <p><strong>Cancellations:</strong> Cancel with more than 4 hours notice and there's no penalty. Life happens!</p>
                                <p><strong>Session Completion:</strong> Both partners must confirm completion to earn points. No partial credit.</p>
                                <p><strong>History:</strong> Every score change is logged with the reason, so you always know why your score changed.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="max-w-4xl">
                        <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-16 flex items-center gap-3">
                            <Brain className="h-7 w-7 text-blue-600" />
                            How intelligent matching creates accountability
                        </h2>
                        <div className="space-y-16">
                            <div className="grid grid-cols-[60px_1fr] gap-8 items-center">
                                <div className="text-2xl text-gray-400 font-light">01</div>
                                <div className="flex items-center gap-3">
                                    <Mail className="h-6 w-6 text-blue-600 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-xl font-medium text-gray-900 mb-2">Verify with university email</h3>
                                        <p className="text-lg text-gray-600">Only verified UK university students (.ac.uk) can join. Set your schedule, subjects, and study preferences.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-[60px_1fr] gap-8 items-center">
                                <div className="text-2xl text-gray-400 font-light">02</div>
                                <div className="flex items-center gap-3">
                                    <Brain className="h-6 w-6 text-blue-600 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-xl font-medium text-gray-900 mb-2">Smart algorithm matching</h3>
                                        <p className="text-lg text-gray-600">Our algorithm matches you based on schedule overlap, Vouch Score similarity, subject compatibility, study atmosphere, and university.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-[60px_1fr] gap-8 items-center">
                                <div className="text-2xl text-gray-400 font-light">03</div>
                                <div className="flex items-center gap-3">
                                    <Video className="h-6 w-6 text-blue-600 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-xl font-medium text-gray-900 mb-2">Built-in video sessions</h3>
                                        <p className="text-lg text-gray-600">No external links needed. Join directly in the app with integrated video, session timer, and attendance tracking.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-[60px_1fr] gap-8 items-center">
                                <div className="text-2xl text-gray-400 font-light">04</div>
                                <div className="flex items-center gap-3">
                                    <BarChart3 className="h-6 w-6 text-blue-600 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-xl font-medium text-gray-900 mb-2">Transparent Vouch Score system</h3>
                                        <p className="text-lg text-gray-600">Earn points for completing sessions (+2), lose points for no-shows (-10). Your reputation follows you and affects future matches.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Data Visualization (full stats page mock) */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="max-w-4xl">
                        <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-12 flex items-center gap-3">
                            <BarChart3 className="h-7 w-7 text-blue-600" />
                            Your reliability, quantified.
                        </h2>
                        {/* Main Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-blue-50 rounded-lg border border-blue-100 p-6 flex flex-col items-center shadow-sm">
                                <div className="mb-2"><Calendar className="h-4 w-4 text-blue-500" /></div>
                                <span className="text-3xl font-bold text-gray-900 mb-2">24</span>
                                <div className="text-sm text-slate-500">All time</div>
                            </div>
                            <div className="bg-blue-50 rounded-lg border border-blue-100 p-6 flex flex-col items-center shadow-sm">
                                <div className="mb-2"><CheckCircle className="h-4 w-4 text-green-500" /></div>
                                <span className="text-3xl font-bold text-gray-900 mb-2">22</span>
                                <div className="text-sm text-slate-500">92% completion rate</div>
                            </div>
                            <div className="bg-blue-50 rounded-lg border border-blue-100 p-6 flex flex-col items-center shadow-sm">
                                <div className="mb-2 flex items-center justify-center"><ShieldCheck className="h-5 w-5 text-blue-600" /></div>
                                <span className="text-3xl font-bold text-gray-900 mb-2">92</span>
                                <div className="text-sm text-slate-500">Vouch Score</div>
                            </div>
                            <div className="bg-blue-50 rounded-lg border border-blue-100 p-6 flex flex-col items-center shadow-sm">
                                <div className="mb-2"><Clock className="h-4 w-4 text-amber-500" /></div>
                                <span className="text-3xl font-bold text-gray-900 mb-2">75m</span>
                                <div className="text-sm text-slate-500">Per session</div>
                            </div>
                        </div>
                        {/* Tabs (static, Overview only) */}
                        <div className="flex space-x-8 border-b border-gray-200 mb-8">
                            <button className="pb-4 border-b-2 text-base font-medium border-gray-900 text-gray-900">Overview</button>
                            <button className="pb-4 border-b-2 text-base font-medium border-transparent text-gray-600 cursor-default">Study Partners</button>
                            <button className="pb-4 border-b-2 text-base font-medium border-transparent text-gray-600 cursor-default">Progress</button>
                            <button className="pb-4 border-b-2 text-base font-medium border-transparent text-gray-600 cursor-default">Achievements</button>
                        </div>
                        {/* Overview Tab Content */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Vouch Score Trend */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <div className="mb-4">
                                    <h3 className="text-2xl font-medium text-gray-900 mb-2">Vouch Score Trend</h3>
                                    <p className="text-gray-600">Your score over time</p>
                                </div>
                                <div className="h-[200px] flex items-center justify-center">
                                    {/* Static mock chart */}
                                    <svg width="90%" height="120" viewBox="0 0 200 120">
                                        <polyline fill="none" stroke="#2563EB" strokeWidth="3" points="0,100 40,90 80,70 120,80 160,60 200,50" />
                                        <circle cx="0" cy="100" r="3" fill="#2563EB" />
                                        <circle cx="40" cy="90" r="3" fill="#2563EB" />
                                        <circle cx="80" cy="70" r="3" fill="#2563EB" />
                                        <circle cx="120" cy="80" r="3" fill="#2563EB" />
                                        <circle cx="160" cy="60" r="3" fill="#2563EB" />
                                        <circle cx="200" cy="50" r="3" fill="#2563EB" />
                                    </svg>
                                </div>
                            </div>
                            {/* Session Duration Preferences */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <div className="mb-4">
                                    <h3 className="text-2xl font-medium text-gray-900 mb-2">Session Duration Preferences</h3>
                                    <p className="text-gray-600">Your preferred session lengths</p>
                                </div>
                                <div className="h-[200px] flex items-center justify-center">
                                    {/* Static mock pie chart */}
                                    <svg width="120" height="120" viewBox="0 0 120 120">
                                        <circle r="50" cx="60" cy="60" fill="#E5E7EB" />
                                        <path d="M60,60 L60,10 A50,50 0 0,1 110,60 Z" fill="#2563EB" />
                                        <path d="M60,60 L110,60 A50,50 0 0,1 60,110 Z" fill="#00C49F" />
                                        <path d="M60,60 L60,110 A50,50 0 0,1 10,60 Z" fill="#FFBB28" />
                                        <path d="M60,60 L10,60 A50,50 0 0,1 60,10 Z" fill="#FF8042" />
                                    </svg>
                                </div>
                            </div>
                            {/* Weekly Activity */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <div className="mb-4">
                                    <h3 className="text-2xl font-medium text-gray-900 mb-2">Weekly Activity</h3>
                                    <p className="text-gray-600">Your sessions this week</p>
                                </div>
                                <div className="h-[200px] flex items-center justify-center">
                                    {/* Static mock bar chart */}
                                    <svg width="90%" height="120" viewBox="0 0 200 120">
                                        <rect x="20" y="80" width="20" height="40" fill="#3b82f6" />
                                        <rect x="60" y="60" width="20" height="60" fill="#3b82f6" />
                                        <rect x="100" y="90" width="20" height="30" fill="#3b82f6" />
                                        <rect x="140" y="50" width="20" height="70" fill="#3b82f6" />
                                        <rect x="180" y="70" width="20" height="50" fill="#3b82f6" />
                                    </svg>
                                </div>
                            </div>
                            {/* Average Session Length */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <div className="mb-4">
                                    <h3 className="text-2xl font-medium text-gray-900 mb-2">Average Session Length</h3>
                                    <p className="text-gray-600">Your average study session duration</p>
                                </div>
                                <div className="flex flex-col items-center justify-center h-[200px]">
                                    <span className="text-5xl font-light text-gray-900">75 min</span>
                                    <span className="text-sm text-gray-600 mt-2">Based on completed sessions</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-16 flex items-center gap-3">
                        <BarChart3 className="h-7 w-7 text-blue-600" />
                        Built for real accountability
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
                        <div className="lg:col-span-2 border-r border-gray-200 pr-12">
                            <div className="space-y-8">
                                <div className="pb-8 border-b border-gray-200 flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-blue-600" />
                                    <h3 className="text-xl font-medium text-gray-900">AI-powered Vouch Score</h3>
                                </div>
                                <div className="pb-8 border-b border-gray-200 flex items-center gap-2">
                                    <Lock className="h-5 w-5 text-blue-600" />
                                    <h3 className="text-xl font-medium text-gray-900">4-hour lock rule</h3>
                                </div>
                                <div className="pb-8 border-b border-gray-200 flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-blue-600" />
                                    <h3 className="text-xl font-medium text-gray-900">Session confirmation flow</h3>
                                </div>
                                <div className="pb-8 border-b border-gray-200 flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-blue-600" />
                                    <h3 className="text-xl font-medium text-gray-900">Real-time messaging</h3>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-3 pl-12">
                            <h3 className="text-2xl font-medium text-gray-900 mb-6 flex items-center gap-2">
                                <Lock className="h-6 w-6 text-blue-600" />
                                The 4-hour lock eliminates flaking
                            </h3>
                            <p className="text-lg text-gray-700 leading-relaxed mb-4">
                                Four hours before any scheduled session, changes are locked. No rescheduling. No cancellations without penalty. This simple rule ensures students commit thoughtfully and show up consistently.
                            </p>
                            <p className="text-lg text-gray-700 leading-relaxed">
                                Combined with our AI-powered Vouch Score system that tracks every session outcome, students learn that reliability pays off, literally, in better matches and higher scores.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Universities */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="max-w-4xl">
                        <p className="text-base text-gray-600 mb-8">Active at UK universities including:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-base text-gray-600 leading-8">
                            <div>University of Oxford</div>
                            <div>University of Cambridge</div>
                            <div>Imperial College London</div>
                            <div>London School of Economics</div>
                            <div>University College London</div>
                            <div>King's College London</div>
                            <div>University of Edinburgh</div>
                            <div>University of Manchester</div>
                            <div>University of Bristol</div>
                            <div>University of Warwick</div>
                            <div>Durham University</div>
                            <div>University of Glasgow</div>
                            <div>University of Birmingham</div>
                            <div>University of Leeds</div>
                            <div>University of Sheffield</div>
                            <div>And many more</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-4 flex items-center gap-2 justify-center">
                            <BarChart3 className="h-7 w-7 text-blue-600" />
                            Everything You Need for Productive Study Sessions
                        </h2>
                        <p className="text-2xl text-gray-600">
                            Designed by students, for students
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-lg">
                            <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center gap-2"><Video className="h-5 w-5 text-blue-600" />Built-in Video Sessions</h3>
                            <p className="text-lg text-gray-600 mb-4">
                                No more "send me the link" messages. Click join and you're in. Camera preferences respected.
                            </p>
                            <Link href="/features" className="text-blue-600 hover:text-blue-700 text-base font-medium" aria-label="Learn more about built-in video sessions">
                                Learn more about this feature →
                            </Link>
                        </div>
                        <div className="bg-white p-8 rounded-lg">
                            <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center gap-2"><Lock className="h-5 w-5 text-blue-600" />4-Hour Lock Rule</h3>
                            <p className="text-lg text-gray-600 mb-4">
                                Sessions lock 4 hours before start. Reschedule early or commit. No last-minute flaking.
                            </p>
                            <Link href="/features" className="text-blue-600 hover:text-blue-700 text-base font-medium" aria-label="Learn more about the 4-hour lock rule">
                                Learn more about this feature →
                            </Link>
                        </div>
                        <div className="bg-white p-8 rounded-lg">
                            <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-blue-600" />Progress Tracking</h3>
                            <p className="text-lg text-gray-600 mb-4">
                                See your study streaks, weekly goals, and Vouch Score history. Stay motivated!
                            </p>
                            <Link href="/features" className="text-blue-600 hover:text-blue-700 text-base font-medium" aria-label="Learn more about progress tracking">
                                Learn more about this feature →
                            </Link>
                        </div>
                        <div className="bg-white p-8 rounded-lg">
                            <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center gap-2"><Filter className="h-5 w-5 text-blue-600" />Smart Filtering</h3>
                            <p className="text-lg text-gray-600 mb-4">
                                Filter by uni, subject, year, Vouch Score, study style. Find your perfect match.
                            </p>
                            <Link href="/features" className="text-blue-600 hover:text-blue-700 text-base font-medium" aria-label="Learn more about smart filtering">
                                Learn more about this feature →
                            </Link>
                        </div>
                        <div className="bg-white p-8 rounded-lg">
                            <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center gap-2"><Bell className="h-5 w-5 text-blue-600" />Smart Reminders</h3>
                            <p className="text-lg text-gray-600 mb-4">
                                Calendar sync, 10-min warnings, completion prompts. Never miss a session.
                            </p>
                            <Link href="/features" className="text-blue-600 hover:text-blue-700 text-base font-medium" aria-label="Learn more about smart reminders">
                                Learn more about this feature →
                            </Link>
                        </div>
                        <div className="bg-white p-8 rounded-lg">
                            <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center gap-2"><Lightbulb className="h-5 w-5 text-blue-600" />Study Styles</h3>
                            <p className="text-lg text-gray-600 mb-4">
                                Silent focus, quiet co-working, or motivational. Match your vibe.
                            </p>
                            <Link href="/features" className="text-blue-600 hover:text-blue-700 text-base font-medium" aria-label="Learn more about study styles">
                                Learn more about this feature →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
