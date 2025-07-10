'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, User, Calendar, Settings, Trophy } from 'lucide-react';

const SUBJECT_DATA = {
    "Business & Economics": [
        "Accounting and Finance",
        "Business and Management Studies",
        "Economics",
        "Events Management",
        "Finance",
        "Hospitality, Leisure and Tourism",
        "Marketing",
        "PR and Communications"
    ],
    "Engineering & Technology": [
        "Aeronautical and Aerospace Engineering",
        "Chemical Engineering",
        "Civil Engineering",
        "Computer Games and Animation",
        "Computer Science",
        "Digital Media, Production and Technology",
        "Electrical and Electronic Engineering",
        "Engineering and Technology",
        "Manufacturing Engineering",
        "Materials Science and Engineering",
        "Mechanical Engineering",
        "Software Engineering"
    ],
    "Arts & Humanities": [
        "Art",
        "Classics",
        "Dance",
        "Drama",
        "English Language",
        "English Literature and Creative Writing",
        "Film Studies",
        "Graphic Design",
        "History",
        "History of Art",
        "Journalism",
        "Languages",
        "Media Studies",
        "Music",
        "Philosophy",
        "Photography"
    ],
    "Health & Life Sciences": [
        "Agriculture and Related Sciences",
        "Biology",
        "Biomedical Sciences",
        "Dentistry",
        "Food Science and Nutrition",
        "Forensic Science",
        "Health",
        "Medicine",
        "Midwifery",
        "Nursing",
        "Optometry",
        "Paramedic Science",
        "Pharmacy, Pharmacology and Toxicology",
        "Physiotherapy, Physiology and Pathology",
        "Radiography and Medical Technology",
        "Sport and Exercise Science",
        "Veterinary Science",
        "Zoology"
    ],
    "Social Sciences": [
        "Anthropology",
        "Archaeology",
        "Counselling, Psychotherapy and Occupational Therapy",
        "Criminology",
        "Geography",
        "Law",
        "Policing",
        "Politics",
        "Psychology",
        "Religion and Theology",
        "Social Work, Childhood and Youth Studies",
        "Sociology"
    ],
    "Built Environment & Design": [
        "Architecture and Planning",
        "Building and Construction",
        "Fashion, Textiles and Jewellery",
        "Product Design"
    ],
    "Sciences & Mathematics": [
        "Chemistry",
        "Environmental and Earth Sciences",
        "Mathematics and Statistics",
        "Physics and Astronomy"
    ],
    "Education": [
        "Education",
        "Teaching"
    ]
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIMES = ['morning', 'afternoon', 'evening'] as const;

export default function ProfilePage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [editedData, setEditedData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'personal' | 'availability' | 'preferences'>('personal');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setUserData(data);
                    setEditedData(data);
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const toggleAvailability = (day: string, time: typeof TIMES[number]) => {
        const currentAvailability = editedData.availability || {};
        const currentDayAvailability = currentAvailability[day] || {};

        setEditedData({
            ...editedData,
            availability: {
                ...currentAvailability,
                [day]: {
                    ...currentDayAvailability,
                    [time]: !currentDayAvailability[time]
                }
            }
        });
    };

    const handleSave = async () => {
        if (!auth.currentUser) return;

        setSaving(true);
        try {
            const updateData = {
                name: editedData.name,
                course: editedData.course,
                yearOfStudy: editedData.yearOfStudy,
                faculty: editedData.faculty,
                subject: editedData.subject,
                bio: editedData.bio,
                availability: editedData.availability,
                coStudyingAtmosphere: editedData.coStudyingAtmosphere,
                cameraPreference: editedData.cameraPreference,
                weeklySessionGoal: editedData.weeklySessionGoal,
                updatedAt: new Date()
            };

            // Filter out undefined, null, and empty string values
            const filteredUpdateData = Object.fromEntries(
                Object.entries(updateData).filter(([_, value]) =>
                    value !== undefined && value !== null && value !== ''
                )
            );

            console.log('Attempting to update profile with data:', filteredUpdateData);
            console.log('Current user ID:', auth.currentUser.uid);

            await updateDoc(doc(db, 'users', auth.currentUser.uid), filteredUpdateData);
            setUserData(editedData);

            toast({
                title: "Profile updated!",
                description: "Your changes have been saved successfully.",
            });
        } catch (error: any) {
            console.error('Profile update failed:', error);
            console.error('Error details:', {
                code: error.code,
                message: error.message,
                stack: error.stack
            });

            toast({
                title: "Error",
                description: `Failed to update profile: ${error.message}`,
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const hasChanges = JSON.stringify(userData) !== JSON.stringify(editedData);

    return (
        <div className="space-y-8 p-6">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900">Profile</h1>
                <p className="text-xl text-gray-600 mt-4">Manage your account settings and preferences.</p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
                    <p className="text-gray-600">Loading your profile...</p>
                </div>
            ) : userData ? (
                <div className="space-y-8">
                    <div className="flex space-x-8 border-b border-gray-200">
                        <button onClick={() => setActiveTab('personal')} className={`pb-4 border-b-2 text-base font-medium ${activeTab === 'personal' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-900'}`}>Personal Info</button>
                        <button onClick={() => setActiveTab('availability')} className={`pb-4 border-b-2 text-base font-medium ${activeTab === 'availability' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-900'}`}>Availability</button>
                        <button onClick={() => setActiveTab('preferences')} className={`pb-4 border-b-2 text-base font-medium ${activeTab === 'preferences' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-900'}`}>Preferences</button>

                    </div>

                    <div className="space-y-8">
                        {activeTab === 'personal' && (
                            <div className="bg-white p-8 rounded-lg border border-gray-200">
                                <div className="mb-6">
                                    <h3 className="text-2xl font-medium text-gray-900 mb-2">Personal Information</h3>
                                    <p className="text-gray-600">Update your basic profile details.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-base font-medium text-gray-900">Full Name</label>
                                        <input
                                            type="text"
                                            value={editedData.name || ''}
                                            onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    {/* Registered Email (read-only) */}
                                    <div className="space-y-2">
                                        <label className="text-base font-medium text-gray-900">Registered Email</label>
                                        <input
                                            type="email"
                                            value={userData.email || ''}
                                            readOnly
                                            disabled
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-base font-medium text-gray-900">Course</label>
                                        <input
                                            type="text"
                                            value={editedData.course || ''}
                                            onChange={(e) => setEditedData({ ...editedData, course: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="e.g., Computer Science"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-base font-medium text-gray-900">Year of Study</label>
                                        <select
                                            value={editedData.yearOfStudy || ''}
                                            onChange={(e) => setEditedData({ ...editedData, yearOfStudy: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select year</option>
                                            <option value="Year 1">Year 1</option>
                                            <option value="Year 2">Year 2</option>
                                            <option value="Year 3">Year 3</option>
                                            <option value="Year 4">Year 4</option>
                                            <option value="Masters">Masters</option>
                                            <option value="PhD">PhD</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-base font-medium text-gray-900">Faculty</label>
                                        <select
                                            value={editedData.faculty || ''}
                                            onChange={(e) => {
                                                setEditedData({
                                                    ...editedData,
                                                    faculty: e.target.value,
                                                    subject: '' // Reset subject when faculty changes
                                                });
                                            }}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select faculty</option>
                                            {Object.keys(SUBJECT_DATA).map(faculty => (
                                                <option key={faculty} value={faculty}>{faculty}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {editedData.faculty && (
                                        <div className="space-y-2">
                                            <label className="text-base font-medium text-gray-900">Subject</label>
                                            <select
                                                value={editedData.subject || ''}
                                                onChange={(e) => setEditedData({ ...editedData, subject: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Select subject</option>
                                                {SUBJECT_DATA[editedData.faculty as keyof typeof SUBJECT_DATA]?.map(subject => (
                                                    <option key={subject} value={subject}>{subject}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-base font-medium text-gray-900">Bio</label>
                                        <textarea
                                            value={editedData.bio || ''}
                                            onChange={(e) => setEditedData({ ...editedData, bio: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            rows={4}
                                            placeholder="Tell potential study partners about yourself..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'availability' && (
                            <div className="bg-white p-8 rounded-lg border border-gray-200">
                                <div className="mb-6">
                                    <h3 className="text-2xl font-medium text-gray-900 mb-2">Availability</h3>
                                    <p className="text-gray-600">Set your study hours and days.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr>
                                                    <th className="text-left p-2 text-lg font-bold">Day</th>
                                                    <th className="text-center p-2 text-lg font-bold">Morning<br /><span className="text-base font-normal">9am-12pm</span></th>
                                                    <th className="text-center p-2 text-lg font-bold">Afternoon<br /><span className="text-base font-normal">12pm-5pm</span></th>
                                                    <th className="text-center p-2 text-lg font-bold">Evening<br /><span className="text-base font-normal">5pm-9pm</span></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {DAYS.map(day => (
                                                    <tr key={day} className="border-t">
                                                        <td className="p-2 font-medium">{day}</td>
                                                        {(['morning', 'afternoon', 'evening'] as const).map((time) => (
                                                            <td key={time} className="text-center p-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleAvailability(day, time)}
                                                                    className={`w-16 h-8 rounded-md transition-colors ${editedData.availability?.[day]?.[time]
                                                                        ? 'bg-blue-600 text-white'
                                                                        : 'bg-gray-100 hover:bg-gray-200'} text-sm font-bold capitalize`}
                                                                >
                                                                    {editedData.availability?.[day]?.[time] ? '✓' : ''}
                                                                </button>
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'preferences' && (
                            <div className="bg-white p-8 rounded-lg border border-gray-200">
                                <div className="mb-6">
                                    <h3 className="text-2xl font-medium text-gray-900 mb-2">Preferences</h3>
                                    <p className="text-gray-600">Tell us about your study preferences.</p>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <label className="text-base font-semibold mb-3 block">Preferred co-studying atmosphere</label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {["Silent & Independent", "Quietly Co-working", "Motivational & Social"].map((option) => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    className={`flex flex-col items-start p-4 border rounded-lg cursor-pointer transition-all
                                                        ${editedData.coStudyingAtmosphere === option ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600' : 'bg-white hover:border-gray-400'}`}
                                                    onClick={() => setEditedData({
                                                        ...editedData,
                                                        coStudyingAtmosphere: editedData.coStudyingAtmosphere === option ? '' : option,
                                                    })}
                                                >
                                                    <span className="font-medium">
                                                        {option === 'Silent & Independent' && 'Silent & Independent'}
                                                        {option === 'Quietly Co-working' && 'Quietly Co-working'}
                                                        {option === 'Motivational & Social' && 'Motivational & Social'}
                                                    </span>
                                                    <span className="text-sm text-gray-600 mt-1">
                                                        {option === 'Silent & Independent' && 'Pure focus mode. No interaction except start/end check-ins.'}
                                                        {option === 'Quietly Co-working' && 'Mostly quiet with occasional check-ins or quick questions.'}
                                                        {option === 'Motivational & Social' && 'Light chat welcome. Share progress and encourage each other.'}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-base font-semibold mb-3 block">Camera preference during sessions</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {["Camera always on", "Camera for check-ins", "Camera always off", "Flexible"].map((option) => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all
                                                        ${editedData.cameraPreference === option ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600' : 'bg-white hover:border-gray-400'}`}
                                                    onClick={() => setEditedData({
                                                        ...editedData,
                                                        cameraPreference: editedData.cameraPreference === option ? '' : option,
                                                    })}
                                                >
                                                    <span>
                                                        {option === 'Camera always on' && '📹 Camera always on'}
                                                        {option === 'Camera for check-ins' && '📷 Camera for check-ins'}
                                                        {option === 'Camera always off' && '🚫 Camera always off'}
                                                        {option === 'Flexible' && 'Flexible'}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-base font-semibold mb-2 block">Weekly session goal</label>
                                        <div className="flex items-center space-x-4">
                                            <button
                                                type="button"
                                                onClick={() => setEditedData({ ...editedData, weeklySessionGoal: Math.max(1, (editedData.weeklySessionGoal || 5) - 1) })}
                                                className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50"
                                            >
                                                -
                                            </button>
                                            <span className="text-xl font-bold w-10 text-center">{editedData.weeklySessionGoal || 5}</span>
                                            <button
                                                type="button"
                                                onClick={() => setEditedData({ ...editedData, weeklySessionGoal: Math.min(20, (editedData.weeklySessionGoal || 5) + 1) })}
                                                className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50"
                                            >
                                                +
                                            </button>
                                            <span className="text-sm text-gray-600">sessions per week</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg text-base font-medium transition-colors disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                    <User className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Profile not found</h3>
                    <p className="mt-1 text-sm text-gray-600">Unable to load your profile information.</p>
                </div>
            )}
        </div>
    );
}