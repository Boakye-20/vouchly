export default function FeaturesPage() {
    return (
        <div className="space-y-8 p-6">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900">Features</h1>
                <p className="text-xl text-gray-600 mt-4">Everything you need to find reliable study partners.</p>
            </div>

            <div className="max-w-6xl mx-auto space-y-12">
                <section>
                    <h2 className="text-2xl font-medium text-gray-900 mb-8">Intelligent Matching</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Smart Algorithm</h3>
                            <p className="text-gray-600">
                                Our algorithm matches you based on schedule overlap, Vouch Score similarity,
                                subject compatibility, study atmosphere preferences, and university.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Advanced Filtering</h3>
                            <p className="text-gray-600">
                                Filter potential partners by university, subject, year, Vouch Score range,
                                study style, and availability to find your perfect match.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-medium text-gray-900 mb-8">Built-in Video Sessions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Integrated Video</h3>
                            <p className="text-gray-600">
                                No external links needed. Join sessions directly in the app with integrated
                                video, session timer, and attendance tracking.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Camera Preferences</h3>
                            <p className="text-gray-600">
                                Choose your camera preference: always on, check-ins only, always off, or flexible.
                                Your preferences are respected and shared with partners.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-medium text-gray-900 mb-8">Vouch Score System</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Transparent Trust</h3>
                            <p className="text-gray-600">
                                Your Vouch Score (0-100) reflects your reliability. Everyone starts with 80 points.
                                Complete sessions to earn points, miss sessions to lose points.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Score History</h3>
                            <p className="text-gray-600">
                                Every score change is logged with the reason. View your complete history
                                and understand how your actions affect your reputation.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-medium text-gray-900 mb-8">Scheduling & Commitment</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">4-Hour Lock Rule</h3>
                            <p className="text-gray-600">
                                Sessions lock 4 hours before start time. After this point, you cannot cancel
                                or reschedule without penalty, ensuring commitment and reducing no-shows.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Flexible Rescheduling</h3>
                            <p className="text-gray-600">
                                First reschedule is free. Only consecutive reschedules (without completing
                                sessions in between) are penalised. Life happens!
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-medium text-gray-900 mb-8">Study Atmosphere Options</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Silent & Independent</h3>
                            <p className="text-gray-600">
                                Pure focus mode. No interaction except start/end check-ins.
                                Perfect for deep work and exam preparation.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Quietly Co-working</h3>
                            <p className="text-gray-600">
                                Mostly quiet with occasional check-ins or quick questions.
                                Ideal for collaborative projects and group study.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Motivational & Social</h3>
                            <p className="text-gray-600">
                                Light chat welcome. Share progress and encourage each other.
                                Great for building study communities and staying motivated.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-medium text-gray-900 mb-8">Safety & Privacy</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">University Verification</h3>
                            <p className="text-gray-600">
                                Only verified UK university students (.ac.uk emails) can join.
                                This ensures all users are genuine university students.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Data Protection</h3>
                            <p className="text-gray-600">
                                All data is encrypted, never sold, and you control your information.
                                We comply with GDPR and UK data protection regulations.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
} 