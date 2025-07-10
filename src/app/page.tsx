import Link from 'next/link';
import { VouchlyLogo } from '@/components/icons';
import { CheckCircle, Mail, Users, Brain, Video, Lock, TrendingUp, Filter, Bell, BarChart3, MessageSquare, Award, Calendar, Lightbulb } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="h-16 flex items-center justify-between">
                        <Link href="/" className="flex items-center space-x-2">
                            <VouchlyLogo className="h-8 w-8 text-blue-600" />
                            <span className="text-xl font-semibold tracking-tight">Vouchly</span>
                        </Link>
                        <div className="flex items-center space-x-8">
                            <Link href="/auth" className="text-gray-600 hover:text-gray-900 text-base transition-colors">
                                Log In
                            </Link>
                            <Link href="/auth" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-base font-medium transition-colors">
                                Get Started Free
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-24">
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
                </div>
            </section>

            {/* Problem Statement */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="max-w-4xl flex items-center gap-4">
                        <Award className="h-8 w-8 text-blue-600 flex-shrink-0" />
                        <p className="text-3xl md:text-4xl text-gray-700 leading-relaxed font-light">
                            Finding someone to study with is easy. Finding someone who actually shows up? That's the real challenge.
                        </p>
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

            {/* Data Visualization */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="max-w-4xl">
                        <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-12 flex items-center gap-3">
                            <BarChart3 className="h-7 w-7 text-blue-600" />
                            Your reliability, quantified.
                        </h2>
                        <div className="bg-white border border-gray-200 rounded-lg p-8 h-80 relative">
                            <svg width="100%" height="100%" viewBox="0 0 600 250" className="absolute inset-0 p-8">
                                {/* Grid lines */}
                                <line x1="40" y1="200" x2="560" y2="200" stroke="#E5E7EB" strokeWidth="1" />
                                <line x1="40" y1="150" x2="560" y2="150" stroke="#E5E7EB" strokeWidth="1" />
                                <line x1="40" y1="100" x2="560" y2="100" stroke="#E5E7EB" strokeWidth="1" />
                                <line x1="40" y1="50" x2="560" y2="50" stroke="#E5E7EB" strokeWidth="1" />

                                {/* Chart line */}
                                <path d="M 40 120 Q 150 110 200 90 T 350 85 Q 450 80 560 65" stroke="#2563EB" strokeWidth="2" fill="none" />

                                {/* Y-axis labels */}
                                <text x="20" y="205" fontSize="12" fill="#6B7280">70</text>
                                <text x="20" y="155" fontSize="12" fill="#6B7280">80</text>
                                <text x="20" y="105" fontSize="12" fill="#6B7280">90</text>
                                <text x="20" y="55" fontSize="12" fill="#6B7280">100</text>

                                {/* Data points */}
                                <circle cx="40" cy="120" r="4" fill="#2563EB" />
                                <circle cx="200" cy="90" r="4" fill="#2563EB" />
                                <circle cx="350" cy="85" r="4" fill="#2563EB" />
                                <circle cx="560" cy="65" r="4" fill="#2563EB" />
                            </svg>
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
                            <Link href="#" className="text-blue-600 hover:text-blue-700 text-base font-medium">
                                Learn more →
                            </Link>
                        </div>
                        <div className="bg-white p-8 rounded-lg">
                            <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center gap-2"><Lock className="h-5 w-5 text-blue-600" />4-Hour Lock Rule</h3>
                            <p className="text-lg text-gray-600 mb-4">
                                Sessions lock 4 hours before start. Reschedule early or commit. No last-minute flaking.
                            </p>
                            <Link href="#" className="text-blue-600 hover:text-blue-700 text-base font-medium">
                                Learn more →
                            </Link>
                        </div>
                        <div className="bg-white p-8 rounded-lg">
                            <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-blue-600" />Progress Tracking</h3>
                            <p className="text-lg text-gray-600 mb-4">
                                See your study streaks, weekly goals, and Vouch Score history. Stay motivated!
                            </p>
                            <Link href="#" className="text-blue-600 hover:text-blue-700 text-base font-medium">
                                Learn more →
                            </Link>
                        </div>
                        <div className="bg-white p-8 rounded-lg">
                            <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center gap-2"><Filter className="h-5 w-5 text-blue-600" />Smart Filtering</h3>
                            <p className="text-lg text-gray-600 mb-4">
                                Filter by uni, subject, year, Vouch Score, study style. Find your perfect match.
                            </p>
                            <Link href="#" className="text-blue-600 hover:text-blue-700 text-base font-medium">
                                Learn more →
                            </Link>
                        </div>
                        <div className="bg-white p-8 rounded-lg">
                            <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center gap-2"><Bell className="h-5 w-5 text-blue-600" />Smart Reminders</h3>
                            <p className="text-lg text-gray-600 mb-4">
                                Calendar sync, 10-min warnings, completion prompts. Never miss a session.
                            </p>
                            <Link href="#" className="text-blue-600 hover:text-blue-700 text-base font-medium">
                                Learn more →
                            </Link>
                        </div>
                        <div className="bg-white p-8 rounded-lg">
                            <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center gap-2"><Lightbulb className="h-5 w-5 text-blue-600" />Study Styles</h3>
                            <p className="text-lg text-gray-600 mb-4">
                                Silent focus, quiet co-working, or motivational. Match your vibe.
                            </p>
                            <Link href="#" className="text-blue-600 hover:text-blue-700 text-base font-medium">
                                Learn more →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
