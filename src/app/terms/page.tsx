import Link from 'next/link';
import { FileText, Shield, Users, Calendar, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto py-16 px-4">
            <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
            <p className="text-gray-600 mb-8">Last updated: January 2025</p>

            <div className="space-y-8">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
                    <p className="text-gray-700 mb-4">
                        By accessing and using Vouchly ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                    </p>
                    <p className="text-gray-700">
                        These Terms of Service ("Terms") govern your use of Vouchly, a platform designed to connect UK university students for study partnerships and academic collaboration.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Eligibility and Registration</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium mb-2">University Student Requirement</h3>
                            <p className="text-gray-700">
                                Vouchly is exclusively for UK university students. You must have a valid .ac.uk email address from a recognised UK university to register and use our service.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Account Creation</h3>
                            <p className="text-gray-700">
                                You must provide accurate, current, and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Age Requirement</h3>
                            <p className="text-gray-700">
                                You must be at least 18 years old to use Vouchly. By using our service, you represent and warrant that you meet this age requirement.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Acceptable Use</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Permitted Activities</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-1">
                                <li>Scheduling and participating in study sessions with other university students</li>
                                <li>Communicating with study partners through our messaging system</li>
                                <li>Using the platform for academic collaboration and learning</li>
                                <li>Maintaining an accurate profile and study preferences</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Prohibited Activities</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-1">
                                <li>Using the platform for non-academic purposes or commercial activities</li>
                                <li>Harassing, bullying, or behaving inappropriately towards other users</li>
                                <li>Sharing false or misleading information about yourself or others</li>
                                <li>Attempting to circumvent our Vouch Score system or accountability measures</li>
                                <li>Using automated systems or bots to access the service</li>
                                <li>Violating any applicable laws or regulations</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Vouch Score System</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Score Calculation</h3>
                            <p className="text-gray-700">
                                Your Vouch Score is calculated based on your reliability and participation in study sessions. The system is designed to promote accountability and trust within our community.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Score Changes</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-1">
                                <li>Complete a session: +2 points</li>
                                <li>Miss a session without notice: -10 points</li>
                                <li>Cancel within 4 hours of start: -10 points</li>
                                <li>Two consecutive reschedules: -5 points</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Transparency</h3>
                            <p className="text-gray-700">
                                All Vouch Score changes are logged with reasons. You can view your complete history and understand why your score changed. We are committed to transparency in our accountability system.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Session Management</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium mb-2">4-Hour Lock Rule</h3>
                            <p className="text-gray-700">
                                Sessions lock 4 hours before the scheduled start time. After this point, you cannot cancel or reschedule without penalty. This rule ensures commitment and reduces no-shows.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Rescheduling Policy</h3>
                            <p className="text-gray-700">
                                You may reschedule sessions before the 4-hour lock period. The first reschedule is free. Only consecutive reschedules (without completing sessions in between) are penalised.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Session Completion</h3>
                            <p className="text-gray-700">
                                Both partners must confirm session completion to earn Vouch Score points. No partial credit is given. This ensures accurate tracking of study session outcomes.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Privacy and Data Protection</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Data Collection</h3>
                            <p className="text-gray-700">
                                We collect and process your personal data in accordance with our Privacy Policy and UK data protection laws. Your privacy is important to us, and we will never sell your personal information.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Data Sharing</h3>
                            <p className="text-gray-700">
                                We may share limited information with your study partners (name, university, subjects, Vouch Score) to facilitate matching and session coordination. We do not share your personal data with third parties except as described in our Privacy Policy.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Your Rights</h3>
                            <p className="text-gray-700">
                                You have the right to access, rectify, and delete your personal data. You can download your data and request account deletion at any time through your account settings.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Platform Ownership</h3>
                            <p className="text-gray-700">
                                Vouchly and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">User Content</h3>
                            <p className="text-gray-700">
                                You retain ownership of any content you submit to the platform. By submitting content, you grant us a limited license to use, display, and distribute your content solely for the purpose of providing our service.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Prohibited Content</h3>
                            <p className="text-gray-700">
                                You may not upload, post, or transmit any content that is illegal, harmful, threatening, abusive, or otherwise objectionable. We reserve the right to remove such content and suspend accounts.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Service Availability</h3>
                            <p className="text-gray-700">
                                We strive to provide a reliable service but cannot guarantee uninterrupted access. We are not liable for any damages arising from service interruptions, technical issues, or data loss.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Study Partner Interactions</h3>
                            <p className="text-gray-700">
                                We facilitate connections between students but are not responsible for the conduct of individual users. You are responsible for your interactions with study partners and should report inappropriate behaviour.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Maximum Liability</h3>
                            <p className="text-gray-700">
                                Our total liability to you for any claims arising from your use of Vouchly shall not exceed the amount you have paid us in the 12 months preceding the claim, or £100, whichever is greater.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Account Termination</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Voluntary Termination</h3>
                            <p className="text-gray-700">
                                You may delete your account at any time through your account settings. Upon deletion, we will remove your personal data within 30 days, except where required by law.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Suspension and Termination</h3>
                            <p className="text-gray-700">
                                We may suspend or terminate your account if you violate these Terms, engage in inappropriate behaviour, or for any other reason at our sole discretion. We will notify you of such actions.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Effect of Termination</h3>
                            <p className="text-gray-700">
                                Upon termination, your right to use Vouchly ceases immediately. We may retain certain information as required by law or for legitimate business purposes.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
                    <p className="text-gray-700">
                        We may update these Terms from time to time. We will notify you of any material changes by email and by posting the updated Terms on our website. Your continued use of Vouchly after such changes constitutes acceptance of the updated Terms.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
                    <p className="text-gray-700">
                        These Terms are governed by and construed in accordance with the laws of England and Wales. Any disputes arising from these Terms or your use of Vouchly shall be subject to the exclusive jurisdiction of the courts of England and Wales.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
                    <p className="text-gray-700 mb-4">
                        If you have questions about these Terms of Service, please contact us:
                    </p>
                    <div className="space-y-2 text-gray-700">
                        <p><strong>Email:</strong> legal@vouchly.com</p>
                        <p><strong>General Support:</strong> support@vouchly.com</p>
                        <p><strong>Privacy Questions:</strong> privacy@vouchly.com</p>
                    </div>
                </section>
            </div>
        </div>
    );
} 