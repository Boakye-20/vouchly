import { InfoPageHeader } from '@/components/layout/vouch-score-header';

export default function ContactPage() {
    return (
        <div className="max-w-7xl mx-auto px-6 pt-4">
            <div className="flex justify-center">
                <h1 className="text-3xl md:text-4xl font-light tracking-tight text-gray-900 border-b-4 border-blue-600 inline-block pb-2 mb-8 text-center">Contact Us</h1>
            </div>
            {/* Remove the large section header here, start with main content */}
            <div className="space-y-8 p-6">
                <p className="text-xl text-gray-600 text-center mt-4">Get in touch with our support team.</p>
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white p-8 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h2 className="text-2xl font-medium text-gray-900 mb-6">Get in Touch</h2>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">General Support</h3>
                                        <p className="text-gray-600 mb-2">For general questions and technical support:</p>
                                        <a href="mailto:support@vouchly.com" className="text-blue-600 hover:text-blue-700">support@vouchly.com</a>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Trust & Safety</h3>
                                        <p className="text-gray-600 mb-2">For reporting inappropriate behaviour:</p>
                                        <a href="mailto:trust@vouchly.com" className="text-blue-600 hover:text-blue-700">trust@vouchly.com</a>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Partnerships</h3>
                                        <p className="text-gray-600 mb-2">For university partnerships and collaborations:</p>
                                        <a href="mailto:partnerships@vouchly.com" className="text-blue-600 hover:text-blue-700">partnerships@vouchly.com</a>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-medium text-gray-900 mb-6">Response Times</h2>
                                <div className="space-y-4">
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <h3 className="font-medium text-gray-900 mb-1">General Inquiries</h3>
                                        <p className="text-gray-600">Within 24 hours</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <h3 className="font-medium text-gray-900 mb-1">Technical Support</h3>
                                        <p className="text-gray-600">Within 12 hours</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <h3 className="font-medium text-gray-900 mb-1">Trust & Safety</h3>
                                        <p className="text-gray-600">Within 4 hours</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-lg border border-gray-200 mt-8">
                        <h2 className="text-2xl font-medium text-gray-900 mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">How do I report a user?</h3>
                                <p className="text-gray-600">
                                    Email trust@vouchly.com with details of the incident, including the user's name,
                                    date/time of the session, and description of the behaviour. We take all reports seriously.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Can I request a feature?</h3>
                                <p className="text-gray-600">
                                    Yes! We welcome feature requests. Email support@vouchly.com with your suggestion
                                    and we'll consider it for future updates.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">How do I delete my account?</h3>
                                <p className="text-gray-600">
                                    Go to your profile settings and select "Delete Account". All your data will be
                                    permanently removed within 30 days.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 