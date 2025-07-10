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
import { useSettings } from '@/contexts/settings-context';
import { Loader2, Save, User, Calendar, Settings, Trophy, Download, Shield, Bell, Eye, EyeOff, Globe, Moon, Sun, Type, Languages, Mail, Phone } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

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
    const { darkMode, fontSize, language, setDarkMode, setFontSize, setLanguage } = useSettings();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [editedData, setEditedData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'personal' | 'availability' | 'preferences' | 'settings'>('personal');
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Local settings state for immediate updates
    const [localSettings, setLocalSettings] = useState({
        profileVisibility: 'public',
        showOnlineStatus: true,
        sessionHistoryVisibility: 'private',
        emailNotifications: true,
        sessionReminderTime: '30min',
        backupEmail: '',
        backupPhone: ''
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setUserData(data);
                    setEditedData(data);
                    // Initialize local settings from user data
                    setLocalSettings({
                        profileVisibility: data.profileVisibility || 'public',
                        showOnlineStatus: data.showOnlineStatus !== false, // default to true
                        sessionHistoryVisibility: data.sessionHistoryVisibility || 'private',
                        emailNotifications: data.emailNotifications !== false, // default to true
                        sessionReminderTime: data.sessionReminderTime || '30min',
                        backupEmail: data.backupEmail || '',
                        backupPhone: data.backupPhone || ''
                    });
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Update settings in Firebase when they change
    const updateSetting = async (key: string, value: any) => {
        if (!auth.currentUser) return;

        try {
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                [key]: value,
                updatedAt: new Date()
            });

            // Update local state
            setLocalSettings(prev => ({ ...prev, [key]: value }));

            toast({
                title: "Setting updated!",
                description: "Your setting has been saved successfully.",
            });
        } catch (error: any) {
            console.error('Setting update failed:', error);
            toast({
                title: "Error",
                description: `Failed to update setting: ${error.message}`,
                variant: "destructive",
            });
        }
    };

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
                // Settings fields (handled by context)
                profileVisibility: editedData.profileVisibility,
                showOnlineStatus: editedData.showOnlineStatus,
                sessionHistoryVisibility: editedData.sessionHistoryVisibility,
                emailNotifications: editedData.emailNotifications,
                sessionReminderTime: editedData.sessionReminderTime,
                backupEmail: editedData.backupEmail,
                backupPhone: editedData.backupPhone,
                updatedAt: new Date()
            };

            // Filter out undefined, null, and empty string values
            const filteredUpdateData = Object.fromEntries(
                Object.entries(updateData).filter(([_, value]) =>
                    value !== undefined && value !== null && value !== ''
                )
            );

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

    const handleDataExport = async () => {
        if (!auth.currentUser) return;

        setExporting(true);
        try {
            // Get current user data
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
            if (!userDoc.exists()) {
                throw new Error('User data not found');
            }

            const userData = userDoc.data();

            // Create export data
            const exportData = {
                exportDate: new Date().toISOString(),
                userId: auth.currentUser.uid,
                userEmail: auth.currentUser.email,
                profile: {
                    ...userData,
                    // Remove sensitive fields
                    password: undefined,
                    firebaseUid: undefined
                },
                settings: localSettings,
                dataSummary: {
                    accountCreated: userData?.createdAt,
                    lastActive: userData?.updatedAt,
                    profileComplete: userData?.profileComplete
                }
            };

            // Create and download JSON file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `vouchly-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({
                title: "Data exported!",
                description: "Your data has been downloaded successfully.",
            });
        } catch (error: any) {
            console.error('Data export failed:', error);
            toast({
                title: "Export failed",
                description: error.message || "Failed to export your data. Please try again.",
                variant: "destructive",
            });
        } finally {
            setExporting(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!auth.currentUser) return;
        if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
        setDeleting(true);
        try {
            const token = await auth.currentUser.getIdToken();
            const res = await fetch('/api/user/delete-account', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (res.ok) {
                toast({ title: 'Account deleted', description: 'Your account and all data have been permanently deleted.' });
                await signOut(auth);
                router.push('/');
            } else {
                const data = await res.json();
                toast({ title: 'Error', description: data.error || 'Failed to delete account.', variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete account.', variant: 'destructive' });
        } finally {
            setDeleting(false);
        }
    };

    const hasChanges = JSON.stringify(userData) !== JSON.stringify(editedData);

    return (
        <div className="space-y-8 p-6">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900 inline-block border-b-4 border-blue-600 pb-2">Profile</h1>
                <p className="text-xl text-slate-500 mt-4">Manage your account settings and preferences.</p>
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
                        <button onClick={() => setActiveTab('settings')} className={`pb-4 border-b-2 text-base font-medium ${activeTab === 'settings' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-900'}`}>Settings</button>
                    </div>

                    <div className="space-y-8">
                        {activeTab === 'personal' && (
                            <div className="bg-white p-8 rounded-lg border border-gray-200">
                                <div className="mb-6">
                                    <h3 className="text-2xl font-medium text-gray-900 mb-2">Personal Information</h3>
                                    <p className="text-slate-500">Update your basic profile details.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-base font-medium text-gray-900">Full Name</label>
                                        <input
                                            type="text"
                                            value={editedData.name || ''}
                                            onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                                            className="w-full px-4 py-3 border border-blue-100 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                            className="w-full px-4 py-3 border border-blue-100 bg-blue-50 rounded-lg text-gray-500 cursor-not-allowed"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-base font-medium text-gray-900">Course</label>
                                        <input
                                            type="text"
                                            value={editedData.course || ''}
                                            onChange={(e) => setEditedData({ ...editedData, course: e.target.value })}
                                            className="w-full px-4 py-3 border border-blue-100 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="e.g., Computer Science"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-base font-medium text-gray-900">Year of Study</label>
                                        <select
                                            value={editedData.yearOfStudy || ''}
                                            onChange={(e) => setEditedData({ ...editedData, yearOfStudy: e.target.value })}
                                            className="w-full px-4 py-3 border border-blue-100 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                            className="w-full px-4 py-3 border border-blue-100 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                                className="w-full px-4 py-3 border border-blue-100 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                            className="w-full px-4 py-3 border border-blue-100 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    <p className="text-slate-500">Set your study hours and days.</p>
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
                                                                        : 'bg-blue-100 hover:bg-blue-200'} text-sm font-bold capitalize`}
                                                                >
                                                                    {editedData.availability?.[day]?.[time] ? '\u2713' : ''}
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
                                    <p className="text-slate-500">Tell us about your study preferences.</p>
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
                                                        ${editedData.coStudyingAtmosphere === option ? 'bg-blue-100 border-blue-600 ring-2 ring-blue-600' : 'bg-white hover:border-gray-400'}`}
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
                                                        ${editedData.cameraPreference === option ? 'bg-blue-100 border-blue-600 ring-2 ring-blue-600' : 'bg-white hover:border-gray-400'}`}
                                                    onClick={() => setEditedData({
                                                        ...editedData,
                                                        cameraPreference: editedData.cameraPreference === option ? '' : option,
                                                    })}
                                                >
                                                    <span>
                                                        {option === 'Camera always on' && '\ud83d\udcf9 Camera always on'}
                                                        {option === 'Camera for check-ins' && '\ud83d\udcf7 Camera for check-ins'}
                                                        {option === 'Camera always off' && '\ud83d\udeab Camera always off'}
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
                        {activeTab === 'settings' && (
                            <div className="space-y-8">
                                {/* Privacy & Communication Settings */}
                                <div className="bg-white p-8 rounded-lg border border-gray-200">
                                    <div className="mb-6">
                                        <h3 className="text-2xl font-medium text-gray-900 mb-2 flex items-center gap-2">
                                            <Shield className="h-6 w-6" />
                                            Privacy & Communication
                                        </h3>
                                        <p className="text-slate-500">Control your profile visibility and communication preferences.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="text-base font-medium text-gray-900">Profile Visibility</label>
                                                <p className="text-sm text-gray-600">Make your profile public or private to other users</p>
                                            </div>
                                            <button
                                                onClick={() => updateSetting('profileVisibility', localSettings.profileVisibility === 'public' ? 'private' : 'public')}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localSettings.profileVisibility === 'public' ? 'bg-blue-600' : 'bg-gray-200'
                                                    }`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localSettings.profileVisibility === 'public' ? 'translate-x-6' : 'translate-x-1'
                                                    }`} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="text-base font-medium text-gray-900">Online Status</label>
                                                <p className="text-sm text-gray-600">Show when you're available for sessions</p>
                                            </div>
                                            <button
                                                onClick={() => updateSetting('showOnlineStatus', !localSettings.showOnlineStatus)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localSettings.showOnlineStatus ? 'bg-blue-600' : 'bg-gray-200'
                                                    }`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localSettings.showOnlineStatus ? 'translate-x-6' : 'translate-x-1'
                                                    }`} />
                                            </button>
                                        </div>

                                        <div>
                                            <label className="text-base font-medium text-gray-900 mb-2 block">Session History Visibility</label>
                                            <select
                                                value={localSettings.sessionHistoryVisibility}
                                                onChange={(e) => updateSetting('sessionHistoryVisibility', e.target.value)}
                                                className="w-full px-4 py-3 border border-blue-100 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="private">Private - Only you can see</option>
                                                <option value="study-partners">Study Partners - Only your session partners</option>
                                                <option value="public">Public - Anyone can see</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Notification Settings */}
                                <div className="bg-white p-8 rounded-lg border border-gray-200">
                                    <div className="mb-6">
                                        <h3 className="text-2xl font-medium text-gray-900 mb-2 flex items-center gap-2">
                                            <Bell className="h-6 w-6" />
                                            Notification Settings
                                        </h3>
                                        <p className="text-slate-500">Manage how and when you receive notifications.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="text-base font-medium text-gray-900">Email Notifications</label>
                                                <p className="text-sm text-gray-600">Receive session reminders, messages, and new matches via email</p>
                                            </div>
                                            <button
                                                onClick={() => updateSetting('emailNotifications', !localSettings.emailNotifications)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localSettings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                                                    }`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                                                    }`} />
                                            </button>
                                        </div>

                                        <div>
                                            <label className="text-base font-medium text-gray-900 mb-2 block">Session Reminders</label>
                                            <select
                                                value={localSettings.sessionReminderTime}
                                                onChange={(e) => updateSetting('sessionReminderTime', e.target.value)}
                                                className="w-full px-4 py-3 border border-blue-100 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="15min">15 minutes before</option>
                                                <option value="30min">30 minutes before</option>
                                                <option value="1hr">1 hour before</option>
                                                <option value="disabled">No reminders</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Account & Security */}
                                <div className="bg-white p-8 rounded-lg border border-gray-200">
                                    <div className="mb-6">
                                        <h3 className="text-2xl font-medium text-gray-900 mb-2 flex items-center gap-2">
                                            <Shield className="h-6 w-6" />
                                            Account & Security
                                        </h3>
                                        <p className="text-slate-500">Manage your account security and data.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-base font-medium text-gray-900 mb-2 block">Backup Email</label>
                                            <input
                                                type="email"
                                                value={localSettings.backupEmail}
                                                onChange={(e) => setLocalSettings(prev => ({ ...prev, backupEmail: e.target.value }))}
                                                onBlur={() => updateSetting('backupEmail', localSettings.backupEmail)}
                                                className="w-full px-4 py-3 border border-blue-100 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter backup email address"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-base font-medium text-gray-900 mb-2 block">Backup Phone</label>
                                            <input
                                                type="tel"
                                                value={localSettings.backupPhone}
                                                onChange={(e) => setLocalSettings(prev => ({ ...prev, backupPhone: e.target.value }))}
                                                onBlur={() => updateSetting('backupPhone', localSettings.backupPhone)}
                                                className="w-full px-4 py-3 border border-blue-100 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter backup phone number"
                                            />
                                        </div>

                                        <div>
                                            <button
                                                onClick={handleDataExport}
                                                disabled={exporting}
                                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-base font-medium transition-colors disabled:opacity-50"
                                            >
                                                {exporting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Exporting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download className="h-4 w-4" />
                                                        Export My Data
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Accessibility & Display */}
                                <div className="bg-white p-8 rounded-lg border border-gray-200">
                                    <div className="mb-6">
                                        <h3 className="text-2xl font-medium text-gray-900 mb-2 flex items-center gap-2">
                                            <Type className="h-6 w-6" />
                                            Accessibility & Display
                                        </h3>
                                        <p className="text-slate-500">Customise your viewing experience.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="text-base font-medium text-gray-900">Dark Mode</label>
                                                <p className="text-sm text-gray-600">Switch between light and dark themes</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setDarkMode(!darkMode);
                                                }}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-200'
                                                    }`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'
                                                    }`} />
                                            </button>
                                        </div>

                                        <div>
                                            <label className="text-base font-medium text-gray-900 mb-2 block">Font Size</label>
                                            <select
                                                value={fontSize}
                                                onChange={(e) => setFontSize(e.target.value)}
                                                className="w-full px-4 py-3 border border-blue-100 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="small">Small</option>
                                                <option value="medium">Medium</option>
                                                <option value="large">Large</option>
                                                <option value="extra-large">Extra Large</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-base font-medium text-gray-900 mb-2 block">Language</label>
                                            <select
                                                value={language}
                                                onChange={(e) => setLanguage(e.target.value)}
                                                className="w-full px-4 py-3 border border-blue-100 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="en-GB">English (UK)</option>
                                                <option value="en-US">English (US)</option>
                                                <option value="es">Español</option>
                                                <option value="fr">Français</option>
                                                <option value="de">Deutsch</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Delete Account Section */}
                                <div className="bg-white p-8 rounded-lg border border-red-200">
                                    <div className="mb-6">
                                        <h3 className="text-2xl font-medium text-red-900 mb-2">Delete Account</h3>
                                        <p className="text-red-600">Permanently delete your account and all associated data. This action cannot be undone.</p>
                                    </div>
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={deleting}
                                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-base font-medium transition-colors disabled:opacity-50"
                                    >
                                        {deleting ? 'Deleting...' : 'Delete Account'}
                                    </button>
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