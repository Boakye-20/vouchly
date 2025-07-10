export default function HelpCenterPage() {
    return (
        <div className="space-y-8 p-6">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900">Help Centre</h1>
                <p className="text-xl text-gray-600 mt-4">Find answers to common questions about Vouchly.</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-12">
                <section>
                    <h2 className="text-2xl font-medium text-gray-900 mb-8">Getting Started</h2>
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">How do I sign up?</h3>
                            <p className="text-gray-600">
                                Click "Get Started Free" and register with your verified UK university email (.ac.uk).
                                You'll receive a verification email to confirm your account.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">What information do I need to provide?</h3>
                            <p className="text-gray-600">
                                Your university email, name, subjects you're studying, preferred study times,
                                and study atmosphere preferences (silent focus, quiet co-working, or motivational).
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">How do you verify my university email?</h3>
                            <p className="text-gray-600">
                                We only accept .ac.uk email addresses from recognised UK universities.
                                This ensures all users are genuine university students.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Can I change my university email later?</h3>
                            <p className="text-gray-600">
                                No, your university email is used for verification and cannot be changed.
                                If you transfer universities, you'll need to create a new account.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-medium text-gray-900 mb-8">Vouch Score System</h2>
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">What is my Vouch Score?</h3>
                            <p className="text-gray-600">
                                Your Vouch Score is a trust rating from 0-100 that reflects your reliability.
                                Everyone starts with 80 points. Complete sessions to earn points, miss sessions to lose points.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">How do I earn Vouch Score points?</h3>
                            <p className="text-gray-600">
                                Complete a study session: +2 points. Both partners must confirm completion to earn points.
                                No partial credit is given.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">When do I lose Vouch Score points?</h3>
                            <p className="text-gray-600">
                                Miss a session without notice: -10 points. Cancel within 4 hours of start: -10 points.
                                Two consecutive reschedules: -5 points.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Can I see my Vouch Score history?</h3>
                            <p className="text-gray-600">
                                Yes. Every score change is logged with the reason. You can view your complete history
                                in your profile dashboard.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-medium text-gray-900 mb-8">Scheduling & Sessions</h2>
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">How do I schedule a study session?</h3>
                            <p className="text-gray-600">
                                Browse available study partners, send a session request with your preferred time,
                                duration, and focus topic. They'll receive a notification to accept or decline.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">What is the 4-hour lock rule?</h3>
                            <p className="text-gray-600">
                                Sessions lock 4 hours before start time. After this point, you cannot cancel
                                or reschedule without penalty. This ensures commitment and reduces no-shows.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Can I reschedule a session?</h3>
                            <p className="text-gray-600">
                                Yes, but only before the 4-hour lock. First reschedule is free. Only consecutive
                                reschedules (without completing sessions in between) are penalised.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">How do I join a video session?</h3>
                            <p className="text-gray-600">
                                Click "Join Session" in your dashboard when it's time. No external links needed.
                                Camera preferences are respected - you can choose to keep your camera off.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-medium text-gray-900 mb-8">Matching & Partners</h2>
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">How does the matching algorithm work?</h3>
                            <p className="text-gray-600">
                                Our algorithm considers schedule overlap, Vouch Score similarity, subject compatibility,
                                study atmosphere preferences, and university to find your ideal study partner.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Can I filter potential study partners?</h3>
                            <p className="text-gray-600">
                                Yes. Filter by university, subject, year, Vouch Score range, study style,
                                and availability to find your perfect match.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">What if I don't get along with my study partner?</h3>
                            <p className="text-gray-600">
                                You can decline future session requests from that person. Our algorithm will
                                learn from your preferences and suggest better matches.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Can I study with the same person regularly?</h3>
                            <p className="text-gray-600">
                                Absolutely! If you find a great study partner, you can schedule regular sessions together.
                                Many students form long-term study partnerships.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-medium text-gray-900 mb-8">Safety & Privacy</h2>
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">How do you protect my privacy?</h3>
                            <p className="text-gray-600">
                                All data is encrypted, never sold, and you control your information. We comply with
                                GDPR and UK data protection regulations.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">What if someone behaves inappropriately?</h3>
                            <p className="text-gray-600">
                                Report inappropriate behaviour immediately to trust@vouchly.com. We take all reports
                                seriously and will investigate promptly.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Are sessions monitored?</h3>
                            <p className="text-gray-600">
                                Sessions are tracked for reliability and safety, but video content is not recorded.
                                Inappropriate behaviour is reported and addressed.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Can I delete my account?</h3>
                            <p className="text-gray-600">
                                Yes. You can delete your account at any time from your profile settings.
                                All your data will be permanently removed within 30 days.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-medium text-gray-900 mb-8">Technical Support</h2>
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">What browsers are supported?</h3>
                            <p className="text-gray-600">
                                Chrome, Firefox, Safari, and Edge. For the best experience, use the latest version
                                of your preferred browser.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">What if I have connection issues?</h3>
                            <p className="text-gray-600">
                                Try refreshing the page or switching browsers. If problems persist, contact support
                                and we'll help troubleshoot.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Is there a mobile app?</h3>
                            <p className="text-gray-600">
                                Currently, Vouchly works best on desktop and tablet browsers. A mobile app is
                                in development and will be available soon.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">How do I contact support?</h3>
                            <p className="text-gray-600">
                                Email us at support@vouchly.com or use the contact form. We typically respond
                                within 24 hours during business days.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
} 