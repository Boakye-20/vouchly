import { InfoPageHeader } from '@/components/layout/vouch-score-header';

export default function HowItWorksPage() {
    return (
        <div className="max-w-7xl mx-auto px-6 pt-4">
            <div className="flex justify-center">
                <h1 className="text-3xl md:text-4xl font-light tracking-tight text-gray-900 border-b-4 border-blue-600 inline-block pb-2 mb-8 text-center">How it Works</h1>
            </div>
            <div className="space-y-8 p-6">
                <p className="text-xl text-gray-600 text-center mt-4">Find reliable study partners in four simple steps.</p>
                <div className="max-w-4xl mx-auto space-y-12">
                    <section>
                        <h2 className="text-2xl font-medium text-gray-900 mb-8">The Vouchly Process</h2>
                        <div className="space-y-8">
                            <div className="grid grid-cols-[60px_1fr] gap-8">
                                <div className="text-2xl text-gray-400 font-light">01</div>
                                <div>
                                    <h3 className="text-xl font-medium text-gray-900 mb-3">Verify with university email</h3>
                                    <p className="text-lg text-gray-600">Only verified UK university students (.ac.uk) can join. Set your schedule, subjects, and study preferences.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-[60px_1fr] gap-8">
                                <div className="text-2xl text-gray-400 font-light">02</div>
                                <div>
                                    <h3 className="text-xl font-medium text-gray-900 mb-3">Smart algorithm matching</h3>
                                    <p className="text-lg text-gray-600">Our algorithm matches you based on schedule overlap, Vouch Score similarity, subject compatibility, study atmosphere, and university.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-[60px_1fr] gap-8">
                                <div className="text-2xl text-gray-400 font-light">03</div>
                                <div>
                                    <h3 className="text-xl font-medium text-gray-900 mb-3">Built-in video sessions</h3>
                                    <p className="text-lg text-gray-600">No external links needed. Join directly in the app with integrated video, session timer, and attendance tracking.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-[60px_1fr] gap-8">
                                <div className="text-2xl text-gray-400 font-light">04</div>
                                <div>
                                    <h3 className="text-xl font-medium text-gray-900 mb-3">Transparent Vouch Score system</h3>
                                    <p className="text-lg text-gray-600">Earn points for completing sessions (+2), lose points for no-shows (-10). Your reputation follows you and affects future matches.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-medium text-gray-900 mb-8">Your Vouch Score: Your Academic Reputation</h2>
                        <div className="bg-blue-50 p-8 rounded-lg border border-blue-100">
                            <p className="text-lg text-gray-600 mb-8">
                                Every action you take affects your Vouch Score, a transparent trust system that rewards reliability and penalises no-shows. Everyone starts with 80 points.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Earn Points</h3>
                                    <ul className="space-y-2 text-lg text-gray-600">
                                        <li className="flex items-start">
                                            <span className="text-green-500 mr-2">✓</span>
                                            Complete a session: +2 points
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-green-500 mr-2">✓</span>
                                            Start session on time: +0 points
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-green-500 mr-2">✓</span>
                                            Reschedule with notice: +0 points
                                        </li>
                                    </ul>
                                </div>
                                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Lose Points</h3>
                                    <ul className="space-y-2 text-lg text-gray-600">
                                        <li className="flex items-start">
                                            <span className="text-red-500 mr-2">✗</span>
                                            Missed session without notice: -10 points
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-red-500 mr-2">✗</span>
                                            Cancel within 4 hours of start: -10 points
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-red-500 mr-2">✗</span>
                                            Two consecutive reschedules: -5 points
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                                <h3 className="text-lg font-medium text-blue-900 mb-3">Fair & Transparent Rules</h3>
                                <div className="space-y-2 text-blue-800 text-base">
                                    <p><strong>Rescheduling:</strong> First reschedule is free. Only consecutive reschedules (without completing a session in between) are penalised.</p>
                                    <p><strong>Cancellations:</strong> Cancel with more than 4 hours notice and there's no penalty. Life happens!</p>
                                    <p><strong>Session Completion:</strong> Both partners must confirm completion to earn points. No partial credit.</p>
                                    <p><strong>History:</strong> Every score change is logged with the reason, so you always know why your score changed.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-medium text-gray-900 mb-8">Study Atmosphere Options</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Silent & Independent</h3>
                                <p className="text-gray-600">
                                    Pure focus mode. No interaction except start/end check-ins.
                                    Perfect for deep work and exam preparation.
                                </p>
                            </div>
                            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Quietly Co-working</h3>
                                <p className="text-gray-600">
                                    Mostly quiet with occasional check-ins or quick questions.
                                    Ideal for collaborative projects and group study.
                                </p>
                            </div>
                            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Motivational & Social</h3>
                                <p className="text-gray-600">
                                    Light chat welcome. Share progress and encourage each other.
                                    Great for building study communities and staying motivated.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
} 