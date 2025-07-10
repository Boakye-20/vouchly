"use client";

import Link from 'next/link';
import { Shield, Eye, Download, Trash2, Lock, Users, Calendar, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto py-16 px-4">
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
            <p className="text-gray-600 mb-8">Last updated: January 2025</p>

            <div className="space-y-8">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
                    <p className="text-gray-700 mb-4">
                        Vouchly ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our platform to connect with study partners.
                    </p>
                    <p className="text-gray-700">
                        By using Vouchly, you agree to the collection and use of information in accordance with this policy. We are committed to transparency and will never sell your personal data.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Account Information</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-1">
                                <li>University email address (.ac.uk only)</li>
                                <li>Full name</li>
                                <li>University and course information</li>
                                <li>Study preferences and schedule</li>
                                <li>Profile picture (optional)</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Usage Data</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-1">
                                <li>Session history and completion records</li>
                                <li>Vouch Score changes and reasons</li>
                                <li>Study partner interactions and messages</li>
                                <li>Platform usage patterns and preferences</li>
                                <li>Technical data (browser, device, IP address)</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Session Data</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-1">
                                <li>Session scheduling and confirmation records</li>
                                <li>Attendance and completion confirmations</li>
                                <li>Rescheduling and cancellation history</li>
                                <li>Session duration and participation metrics</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Core Platform Functions</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-1">
                                <li>Creating and managing your account</li>
                                <li>Matching you with compatible study partners</li>
                                <li>Facilitating study sessions and communication</li>
                                <li>Calculating and maintaining your Vouch Score</li>
                                <li>Providing customer support and technical assistance</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Platform Improvement</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-1">
                                <li>Analysing usage patterns to improve our matching algorithm</li>
                                <li>Identifying and fixing technical issues</li>
                                <li>Developing new features based on user needs</li>
                                <li>Ensuring platform security and preventing abuse</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Safety and Compliance</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-1">
                                <li>Investigating reports of inappropriate behaviour</li>
                                <li>Ensuring compliance with UK data protection laws</li>
                                <li>Preventing fraud and maintaining platform integrity</li>
                                <li>Responding to legal requests when required</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Data Sharing and Disclosure</h2>
                    <p className="text-gray-700 mb-4">
                        We are committed to protecting your privacy and will never sell your personal data. We may share your information only in the following limited circumstances:
                    </p>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Study Partners</h3>
                            <p className="text-gray-700">
                                When you schedule a session, your study partner will see your name, university, subjects, and Vouch Score. This information is necessary for the matching process and session coordination.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Service Providers</h3>
                            <p className="text-gray-700">
                                We work with trusted third-party services for hosting, analytics, and customer support. These providers are bound by strict confidentiality agreements and may only use your data to provide services to us.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Legal Requirements</h3>
                            <p className="text-gray-700">
                                We may disclose your information if required by law, court order, or government request. We will notify you of any such requests unless prohibited by law.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Safety Emergencies</h3>
                            <p className="text-gray-700">
                                In cases involving safety concerns or emergency situations, we may share relevant information with appropriate authorities or emergency services.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
                    <p className="text-gray-700 mb-4">
                        We implement industry-standard security measures to protect your personal information:
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>All data is encrypted in transit and at rest using AES-256 encryption</li>
                        <li>Regular security audits and vulnerability assessments</li>
                        <li>Access controls and authentication requirements for all staff</li>
                        <li>Secure data centres with physical and digital security measures</li>
                        <li>Regular backups and disaster recovery procedures</li>
                        <li>Compliance with GDPR and UK data protection regulations</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Your Rights and Choices</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Access and Control</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-1">
                                <li>View and update your profile information at any time</li>
                                <li>Download a copy of your data from your account settings</li>
                                <li>Request deletion of your account and associated data</li>
                                <li>Opt out of non-essential communications</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Data Retention</h3>
                            <p className="text-gray-700">
                                We retain your data only as long as necessary to provide our services. When you delete your account, we will remove your personal information within 30 days, except where required by law.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">GDPR Rights</h3>
                            <p className="text-gray-700">
                                As a UK-based service, you have rights under GDPR including the right to access, rectify, erase, and restrict processing of your personal data. Contact us to exercise these rights.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
                    <p className="text-gray-700 mb-4">
                        We use essential cookies to provide core platform functionality. We do not use tracking cookies or third-party advertising. Our cookie policy is simple and transparent:
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>Session cookies for authentication and security</li>
                        <li>Preference cookies to remember your settings</li>
                        <li>Analytics cookies to improve our service (anonymised data only)</li>
                        <li>No advertising or tracking cookies</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
                    <p className="text-gray-700">
                        Vouchly is designed for university students and requires a verified university email address. We do not knowingly collect personal information from individuals under 18. If you believe we have collected such information, please contact us immediately.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
                    <p className="text-gray-700">
                        We may update this Privacy Policy from time to time. We will notify you of any material changes by email and by posting the updated policy on our website. Your continued use of Vouchly after such changes constitutes acceptance of the updated policy.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                    <p className="text-gray-700 mb-4">
                        If you have questions about this Privacy Policy or our data practices, please contact us:
                    </p>
                    <div className="space-y-2 text-gray-700">
                        <p><strong>Email:</strong> privacy@vouchly.com</p>
                        <p><strong>Data Protection Officer:</strong> dpo@vouchly.com</p>
                        <p><strong>General Support:</strong> support@vouchly.com</p>
                    </div>
                </section>
            </div>
        </div>
    );
}

function DeleteAccountButton() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleDelete = async () => {
        setLoading(true);
        setError(null);
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Not authenticated');
            const token = await user.getIdToken();
            const res = await fetch('/api/user/delete-account', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete account');
            }
            await auth.signOut();
            router.push('/auth?accountDeleted=1');
        } catch (err: any) {
            setError(err.message || 'Failed to delete account');
            // Always sign out and redirect to login with deletion param
            try { await auth.signOut(); } catch { }
            router.push('/auth?accountDeleted=1');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button className="mt-2 text-sm text-red-600 hover:underline" variant="ghost" onClick={() => setOpen(true)}>
                Delete Account
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Account</DialogTitle>
                    </DialogHeader>
                    <p className="mb-4 text-sm text-gray-700">Are you sure you want to permanently delete your account and all associated data? This action cannot be undone.</p>
                    {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                            {loading ? 'Deleting...' : 'Delete Account'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
} 