import { Brain, Filter, Video, Camera, BarChart3, Award, Lock, RefreshCw, Users, Lightbulb, Shield, Database } from 'lucide-react';

export default function FeaturesPage() {
    return (
        <div className="space-y-8 p-6">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900">Features</h1>
                <p className="text-xl text-gray-600 mt-4">Everything you need to find reliable study partners.</p>
            </div>

            <div className="max-w-6xl mx-auto space-y-12">
                <section>
                    <h2 className="text-2xl font-medium text-gray-900 mb-8 flex items-center gap-2"><Brain className="h-6 w-6 text-blue-600" />Intelligent Matching</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-3"><Brain className="h-5 w-5 text-blue-600" /><h3 className="text-lg font-medium text-gray-900">Smart Algorithm</h3></div>
                            <p className="text-gray-600">
                                Our algorithm matches you based on schedule overlap, Vouch Score similarity,
                                subject compatibility, study atmosphere preferences, and university.
                            </p>
                            <p className="text-sm text-gray-500 mt-2">How this helps you: Get matched with students who actually fit your study habits and timetable, so you waste less time searching.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-3"><Filter className="h-5 w-5 text-blue-600" /><h3 className="text-lg font-medium text-gray-900">Advanced Filtering</h3></div>
                            <p className="text-gray-600">
                                Filter potential partners by university, subject, year, Vouch Score range,
                                study style, and availability to find your perfect match.
                            </p>
                            <p className="text-sm text-gray-500 mt-2">Example: Only want to study with 2nd-year Psychology students at UCL? Filter and match instantly.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-medium text-gray-900 mb-8 flex items-center gap-2"><Video className="h-6 w-6 text-blue-600" />Built-in Video Sessions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-3"><Video className="h-5 w-5 text-blue-600" /><h3 className="text-lg font-medium text-gray-900">Integrated Video</h3></div>
                            <p className="text-gray-600">
                                No external links needed. Join sessions directly in the app with integrated
                                video, session timer, and attendance tracking.
                            </p>
                            <p className="text-sm text-gray-500 mt-2">How this helps you: No more scrambling for Zoom links, just click and join, every time.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-3"><Camera className="h-5 w-5 text-blue-600" /><h3 className="text-lg font-medium text-gray-900">Camera Preferences</h3></div>
                            <p className="text-gray-600">
                                Choose your camera preference: always on, check-ins only, always off, or flexible.
                                Your preferences are respected and shared with partners.
                            </p>
                            <p className="text-sm text-gray-500 mt-2">Example: Prefer to keep your camera off except for check-ins? Set it once and partners will know.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-medium text-gray-900 mb-8 flex items-center gap-2"><BarChart3 className="h-6 w-6 text-blue-600" />Vouch Score System</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-3"><Award className="h-5 w-5 text-blue-600" /><h3 className="text-lg font-medium text-gray-900">Transparent Trust</h3></div>
                            <p className="text-gray-600">
                                Your Vouch Score (0-100) reflects your reliability. Everyone starts with 80 points.
                                Complete sessions to earn points, miss sessions to lose points.
                            </p>
                            <p className="text-sm text-gray-500 mt-2">How this helps you: Build a reputation for reliability and get matched with the best partners.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-3"><BarChart3 className="h-5 w-5 text-blue-600" /><h3 className="text-lg font-medium text-gray-900">Score History</h3></div>
                            <p className="text-gray-600">
                                Every score change is logged with the reason. View your complete history
                                and understand how your actions affect your reputation.
                            </p>
                            <p className="text-sm text-gray-500 mt-2">Example: See exactly why your score changed after each session, no surprises.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-medium text-gray-900 mb-8 flex items-center gap-2"><Lock className="h-6 w-6 text-blue-600" />Scheduling & Commitment</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-3"><Lock className="h-5 w-5 text-blue-600" /><h3 className="text-lg font-medium text-gray-900">4-Hour Lock Rule</h3></div>
                            <p className="text-gray-600">
                                Sessions lock 4 hours before start time. After this point, you cannot cancel
                                or reschedule without penalty, ensuring commitment and reducing no-shows.
                            </p>
                            <p className="text-sm text-gray-500 mt-2">How this helps you: Encourages everyone to plan ahead and show up, so you’re not left waiting.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-3"><RefreshCw className="h-5 w-5 text-blue-600" /><h3 className="text-lg font-medium text-gray-900">Flexible Rescheduling</h3></div>
                            <p className="text-gray-600">
                                First reschedule is free. Only consecutive reschedules (without completing
                                sessions in between) are penalised. Life happens!
                            </p>
                            <p className="text-sm text-gray-500 mt-2">Example: If you need to move a session, you can; just do not make it a habit.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-medium text-gray-900 mb-8 flex items-center gap-2"><Lightbulb className="h-6 w-6 text-blue-600" />Study Atmosphere Options</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-3"><Lightbulb className="h-5 w-5 text-blue-600" /><h3 className="text-lg font-medium text-gray-900">Silent & Independent</h3></div>
                            <p className="text-gray-600">
                                Pure focus mode. No interaction except start/end check-ins.
                                Perfect for deep work and exam preparation.
                            </p>
                            <p className="text-sm text-gray-500 mt-2">How this helps you: Get in the zone with zero distractions, but still have accountability.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-3"><Users className="h-5 w-5 text-blue-600" /><h3 className="text-lg font-medium text-gray-900">Quietly Co-working</h3></div>
                            <p className="text-gray-600">
                                Mostly quiet with occasional check-ins or quick questions.
                                Ideal for collaborative projects and group study.
                            </p>
                            <p className="text-sm text-gray-500 mt-2">Example: Work together on a project, but keep the chatter to a minimum.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-3"><Award className="h-5 w-5 text-blue-600" /><h3 className="text-lg font-medium text-gray-900">Motivational & Social</h3></div>
                            <p className="text-gray-600">
                                Light chat welcome. Share progress and encourage each other.
                                Great for building study communities and staying motivated.
                            </p>
                            <p className="text-sm text-gray-500 mt-2">How this helps you: Stay energised and motivated by sharing wins and encouragement.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-medium text-gray-900 mb-8 flex items-center gap-2"><Shield className="h-6 w-6 text-blue-600" />Safety & Privacy</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-3"><Shield className="h-5 w-5 text-blue-600" /><h3 className="text-lg font-medium text-gray-900">University Verification</h3></div>
                            <p className="text-gray-600">
                                Only verified UK university students (.ac.uk emails) can join.
                                This ensures all users are genuine university students.
                            </p>
                            <p className="text-sm text-gray-500 mt-2">How this helps you: Keeps the community safe and relevant to real students.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-3"><Database className="h-5 w-5 text-blue-600" /><h3 className="text-lg font-medium text-gray-900">Data Protection</h3></div>
                            <p className="text-gray-600">
                                All data is encrypted, never sold, and you control your information.
                                We comply with GDPR and UK data protection regulations.
                            </p>
                            <p className="text-sm text-gray-500 mt-2">Example: You can export or delete your data at any time; your privacy, your choice.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
} 