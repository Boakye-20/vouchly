import { InfoPageHeader } from '@/components/layout/vouch-score-header';

export default function CommunityGuidelinesPage() {
    return (
        <div className="max-w-7xl mx-auto px-6 pt-4">
            <div className="flex justify-center">
                <h1 className="text-3xl md:text-4xl font-light tracking-tight text-gray-900 border-b-4 border-blue-600 inline-block pb-2 mb-8 text-center">Community Guidelines</h1>
            </div>
            {/* Remove InfoPageHeader and page title, start with main content */}
            <div className="space-y-8 p-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="bg-white p-8 rounded-lg border border-gray-200">
                        <h2 className="text-2xl font-medium text-gray-900 mb-6">Our Mission</h2>
                        <p className="text-lg text-gray-600">
                            Vouchly exists to create a safe, supportive environment where UK university students can find reliable study partners.
                            These guidelines ensure everyone can focus on their academic goals without distraction or discomfort.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-lg border border-gray-200">
                        <h2 className="text-2xl font-medium text-gray-900 mb-6">Core Principles</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Respect for Academic Focus</h3>
                                <p className="text-gray-600">
                                    Study sessions are for academic work only. Respect your partner's need for focus and avoid off-topic conversations
                                    unless they've chosen a more social study atmosphere.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Reliability and Commitment</h3>
                                <p className="text-gray-600">
                                    Show up on time and complete your scheduled sessions. Your Vouch Score reflects your reliability,
                                    and consistent no-shows will affect your ability to find study partners.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Professional Conduct</h3>
                                <p className="text-gray-600">
                                    Treat every interaction as you would in a professional academic setting. Be courteous,
                                    respectful, and focused on the shared goal of academic success.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-lg border border-gray-200">
                        <h2 className="text-2xl font-medium text-gray-900 mb-6">Prohibited Behaviour</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Harassment or Bullying</h3>
                                <p className="text-gray-600">
                                    Any form of harassment, bullying, or discriminatory behaviour is strictly prohibited.
                                    This includes but is not limited to offensive language, inappropriate comments, or unwanted advances.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Academic Dishonesty</h3>
                                <p className="text-gray-600">
                                    Do not share exam questions, answers, or other confidential academic materials.
                                    Study together to learn, not to cheat.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Inappropriate Content</h3>
                                <p className="text-gray-600">
                                    Do not share inappropriate images, videos, or content during sessions.
                                    Keep all interactions academic and professional.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Spam or Solicitation</h3>
                                <p className="text-gray-600">
                                    Do not use Vouchly to promote products, services, or other platforms.
                                    This is a study platform, not a marketing channel.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-lg border border-gray-200">
                        <h2 className="text-2xl font-medium text-gray-900 mb-6">Study Session Etiquette</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Camera and Audio</h3>
                                <p className="text-gray-600">
                                    Respect your partner's camera preferences. If they prefer no camera, don't pressure them to turn it on.
                                    Keep your audio muted unless speaking, and ensure your study environment is quiet.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Session Duration</h3>
                                <p className="text-gray-600">
                                    Stick to the agreed session duration. If you need to leave early, communicate this respectfully
                                    and understand it may affect your Vouch Score.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Study Atmosphere</h3>
                                <p className="text-gray-600">
                                    Respect the chosen study atmosphere. If your partner selected "Silent & Independent,"
                                    keep interactions minimal. If they chose "Motivational & Social," light conversation is welcome.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-lg border border-gray-200">
                        <h2 className="text-2xl font-medium text-gray-900 mb-6">Reporting and Enforcement</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">How to Report</h3>
                                <p className="text-gray-600">
                                    If you experience inappropriate behaviour, report it immediately to trust@vouchly.com.
                                    Include the user's name, date/time of the session, and detailed description of the incident.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Our Response</h3>
                                <p className="text-gray-600">
                                    We investigate all reports within 4 hours. Violations may result in warnings,
                                    temporary suspension, or permanent account termination depending on severity.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Appeals Process</h3>
                                <p className="text-gray-600">
                                    If you believe your account was suspended in error, you may appeal by emailing trust@vouchly.com
                                    with additional context or evidence.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-lg border border-gray-200">
                        <h2 className="text-2xl font-medium text-gray-900 mb-6">Building a Positive Community</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Be Encouraging</h3>
                                <p className="text-gray-600">
                                    Support your study partners in their academic journey. Share study tips,
                                    celebrate achievements, and offer motivation when appropriate.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Communicate Clearly</h3>
                                <p className="text-gray-600">
                                    If you need to reschedule or have concerns, communicate openly and respectfully.
                                    Clear communication prevents misunderstandings and builds trust.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Lead by Example</h3>
                                <p className="text-gray-600">
                                    Model the behaviour you want to see in others. Be reliable, respectful,
                                    and focused on academic success.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 