import { UK_UNIVERSITIES } from '@/lib/universities';
import { InfoPageHeader } from '@/components/layout/vouch-score-header';

export default function UniversitiesPage() {
    return (
        <div className="max-w-7xl mx-auto px-6 pt-4">
            <div className="flex justify-center">
                <h1 className="text-3xl md:text-4xl font-light tracking-tight text-gray-900 border-b-4 border-blue-600 inline-block pb-2 mb-8 text-center">Universities</h1>
            </div>
            <div className="space-y-8 p-6">
                <p className="text-xl text-gray-600 text-center mt-4">Vouchly is available to students at all UK universities.</p>
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white p-8 rounded-lg border border-gray-200">
                        <h2 className="text-2xl font-medium text-gray-900 mb-6">All Supported Universities</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {UK_UNIVERSITIES.map((uni) => (
                                <div key={uni} className="text-sm text-gray-700 truncate py-1 px-2">
                                    {uni}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-lg border border-gray-200 mt-8">
                        <h2 className="text-2xl font-medium text-gray-900 mb-6">University Partnerships</h2>
                        <p className="text-lg text-gray-600 mb-6">
                            We're actively working with universities to integrate Vouchly into their student support services.
                            If you're interested in a partnership, please contact us.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <h3 className="text-lg font-medium text-gray-900 mb-3">For Students</h3>
                                <p className="text-gray-600">
                                    Encourage your university to partner with Vouchly. We can provide
                                    custom integrations and dedicated support for your institution.
                                </p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <h3 className="text-lg font-medium text-gray-900 mb-3">For Universities</h3>
                                <p className="text-gray-600">
                                    Partner with Vouchly to support your students' academic success.
                                    We offer custom branding, analytics, and dedicated support.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6">
                            <a href="mailto:partnerships@vouchly.com" className="text-blue-600 hover:text-blue-700 font-medium">
                                Contact partnerships@vouchly.com
                            </a>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-lg border border-gray-200 mt-8">
                        <h2 className="text-2xl font-medium text-gray-900 mb-6">Verification Process</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Email Verification</h3>
                                <p className="text-gray-600">
                                    We only accept .ac.uk email addresses from recognised UK universities.
                                    This ensures all users are genuine university students.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">University Recognition</h3>
                                <p className="text-gray-600">
                                    We maintain an up-to-date list of all recognised UK universities.
                                    If your university isn't listed but should be, please contact us.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Account Security</h3>
                                <p className="text-gray-600">
                                    Your university email is used for verification and cannot be changed.
                                    If you transfer universities, you'll need to create a new account.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 