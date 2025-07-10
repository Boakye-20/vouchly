import { UK_UNIVERSITIES } from '@/lib/universities';

export default function UniversitiesPage() {
    return (
        <div className="space-y-8 p-6">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900">Universities</h1>
                <p className="text-xl text-gray-600 mt-4">Vouchly is available to students at all UK universities.</p>
            </div>

            <div className="max-w-4xl mx-auto">
                <div className="bg-white p-8 rounded-lg border border-gray-200">
                    <h2 className="text-2xl font-medium text-gray-900 mb-6">Supported Universities</h2>
                    <p className="text-lg text-gray-600 mb-8">
                        Vouchly accepts students from all recognised UK universities with .ac.uk email addresses.
                        This includes all Russell Group universities, post-1992 universities, and other accredited institutions.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Russell Group Universities</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li>University of Birmingham</li>
                                <li>University of Bristol</li>
                                <li>University of Cambridge</li>
                                <li>Cardiff University</li>
                                <li>Durham University</li>
                                <li>University of Edinburgh</li>
                                <li>University of Exeter</li>
                                <li>University of Glasgow</li>
                                <li>Imperial College London</li>
                                <li>King's College London</li>
                                <li>University of Leeds</li>
                                <li>University of Liverpool</li>
                                <li>London School of Economics</li>
                                <li>University of Manchester</li>
                                <li>Newcastle University</li>
                                <li>University of Nottingham</li>
                                <li>University of Oxford</li>
                                <li>Queen Mary University of London</li>
                                <li>Queen's University Belfast</li>
                                <li>University of Sheffield</li>
                                <li>University of Southampton</li>
                                <li>University College London</li>
                                <li>University of Warwick</li>
                                <li>University of York</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Other Major Universities</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li>Aston University</li>
                                <li>Bath Spa University</li>
                                <li>Bournemouth University</li>
                                <li>Brunel University London</li>
                                <li>Coventry University</li>
                                <li>De Montfort University</li>
                                <li>Edge Hill University</li>
                                <li>Goldsmiths, University of London</li>
                                <li>Kingston University</li>
                                <li>Leeds Beckett University</li>
                                <li>Liverpool John Moores University</li>
                                <li>London Metropolitan University</li>
                                <li>Manchester Metropolitan University</li>
                                <li>Middlesex University</li>
                                <li>Northumbria University</li>
                                <li>Nottingham Trent University</li>
                                <li>Oxford Brookes University</li>
                                <li>Plymouth University</li>
                                <li>Portsmouth University</li>
                                <li>Royal Holloway, University of London</li>
                                <li>Sheffield Hallam University</li>
                                <li>Staffordshire University</li>
                                <li>University of Sunderland</li>
                                <li>University of the West of England</li>
                            </ul>
                        </div>
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
    );
} 