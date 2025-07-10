import { InfoPageHeader } from '@/components/layout/vouch-score-header';

export default function SafetyPage() {
    return (
        <div className="max-w-7xl mx-auto px-6 pt-4">
            <div className="flex justify-center">
                <h1 className="text-3xl md:text-4xl font-light tracking-tight text-gray-900 border-b-4 border-blue-600 inline-block pb-2 mb-8 text-center">Safety</h1>
            </div>
            <div className="space-y-8 p-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="bg-white p-8 rounded-lg border border-gray-200">
                        <h2 className="text-2xl font-medium text-gray-900 mb-6">Our Safety Commitment</h2>
                        <p className="text-lg text-gray-600">
                            Vouchly is designed with your safety in mind. We use university email verification,
                            transparent reputation systems, and comprehensive monitoring to create a secure environment
                            where you can focus on your studies without worry.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-lg border border-gray-200">
                        <h2 className="text-2xl font-medium text-gray-900 mb-6">Verification & Identity</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-3">University Email Verification</h3>
                                <p className="text-gray-600">
                                    Every user must register with a verified .ac.uk email address from a recognised UK university.
                                    This ensures all users are genuine university students, creating a trusted academic community.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Profile Transparency</h3>
                                <p className="text-gray-600">
                                    All users display their real name, university, and subjects. No anonymous profiles are allowed,
                                    promoting accountability and trust within the community.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Vouch Score System</h3>
                                <p className="text-gray-600">
                                    Our transparent reputation system tracks reliability and behaviour. Users with poor scores
                                    have limited access, while reliable users get better matches and features.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-lg border border-gray-200">
                        <h2 className="text-2xl font-medium text-gray-900 mb-6">Session Safety</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Built-in Video Platform</h3>
                                <p className="text-gray-600">
                                    All video sessions happen within our secure platform. No external links or third-party
                                    services are required, keeping your interactions safe and monitored.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Camera Preferences</h3>
                                <p className="text-gray-600">
                                    You control your camera settings. Choose from "always on," "check-ins only," "always off,"
                                    or "flexible." Your preferences are respected and shared with partners beforehand.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Session Monitoring</h3>
                                <p className="text-gray-600">
                                    Sessions are tracked for reliability and safety. While video content isn't recorded,
                                    session metadata helps us identify and address inappropriate behaviour.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-lg border border-gray-200">
                        <h2 className="text-2xl font-medium text-gray-900 mb-6">Privacy Protection</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Data Encryption</h3>
                                <p className="text-gray-600">
                                    All data is encrypted in transit and at rest. Your personal information, messages,
                                    and session data are protected using industry-standard security measures.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-3">No Data Selling</h3>
                                <p className="text-gray-600">
                                    We never sell your personal data to third parties. Your information is used solely
                                    to provide and improve our study platform services.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-3">GDPR Compliance</h3>
                                <p className="text-gray-600">
                                    We comply with UK data protection regulations and GDPR. You have full control over
                                    your data and can request deletion at any time.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-lg border border-gray-200">
                        <h2 className="text-2xl font-medium text-gray-900 mb-6">Reporting & Support</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-3">24/7 Trust Team</h3>
                                <p className="text-gray-600">
                                    Our dedicated trust and safety team responds to reports within 4 hours.
                                    All incidents are investigated thoroughly and appropriate action is taken.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Easy Reporting</h3>
                                <p className="text-gray-600">
                                    Report inappropriate behaviour by emailing trust@vouchly.com. Include the user's name,
                                    date/time of the incident, and detailed description. All reports are confidential.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Account Protection</h3>
                                <p className="text-gray-600">
                                    Users who violate our safety policies face warnings, temporary suspension,
                                    or permanent account termination depending on the severity of the violation.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-lg border border-gray-200">
                        <h2 className="text-2xl font-medium text-gray-900 mb-6">Safety Tips</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Before Sessions</h3>
                                <p className="text-gray-600">
                                    Review your partner's profile and Vouch Score. Choose a quiet, well-lit environment
                                    and test your camera and microphone beforehand.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">During Sessions</h3>
                                <p className="text-gray-600">
                                    Keep interactions academic and professional. If you feel uncomfortable,
                                    you can end the session early and report the incident.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">After Sessions</h3>
                                <p className="text-gray-600">
                                    Confirm session completion together. If you experienced any issues,
                                    report them immediately to help keep our community safe.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-lg border border-gray-200">
                        <h2 className="text-2xl font-medium text-gray-900 mb-6">Emergency Contacts</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Trust & Safety</h3>
                                <p className="text-gray-600">
                                    For immediate safety concerns: <a href="mailto:trust@vouchly.com" className="text-blue-600 hover:text-blue-700">trust@vouchly.com</a>
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">General Support</h3>
                                <p className="text-gray-600">
                                    For technical issues or questions: <a href="mailto:support@vouchly.com" className="text-blue-600 hover:text-blue-700">support@vouchly.com</a>
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Response Times</h3>
                                <p className="text-gray-600">
                                    Safety reports: Within 4 hours | General support: Within 24 hours
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 