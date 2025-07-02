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

            await updateDoc(doc(db, 'users', auth.currentUser.uid), updateData);
            setUserData(editedData);

            toast({
                title: "Profile updated!",
                description: "Your changes have been saved successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const hasChanges = JSON.stringify(userData) !== JSON.stringify(editedData);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!userData) {
        return <div className="p-6">No user data found</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">My Profile</h1>
                    <p className="text-muted-foreground">Manage your profile and preferences</p>
                </div>
                {hasChanges && (
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Save Changes
                    </Button>
                )}
            </div>

            <Tabs defaultValue="personal" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="personal">
                        <User className="h-4 w-4 mr-2" />
                        Personal Info
                    </TabsTrigger>
                    <TabsTrigger value="academic">
                        <Trophy className="h-4 w-4 mr-2" />
                        Academic
                    </TabsTrigger>
                    <TabsTrigger value="availability">
                        <Calendar className="h-4 w-4 mr-2" />
                        Availability
                    </TabsTrigger>
                    <TabsTrigger value="preferences">
                        <Settings className="h-4 w-4 mr-2" />
                        Preferences
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your basic profile information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={editedData.name || ''}
                                        onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        value={userData.email}
                                        disabled
                                        className="bg-gray-50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="university">University</Label>
                                    <Input
                                        id="university"
                                        value={userData.university}
                                        disabled
                                        className="bg-gray-50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="vouchScore">Vouch Score</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="vouchScore"
                                            value={userData.vouchScore}
                                            disabled
                                            className="bg-gray-50"
                                        />
                                        <Badge variant="outline">Read-only</Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    placeholder="Tell others about yourself..."
                                    value={editedData.bio || ''}
                                    onChange={(e) => setEditedData({ ...editedData, bio: e.target.value })}
                                    className="min-h-[100px]"
                                    maxLength={200}
                                />
                                <p className="text-xs text-gray-500">{editedData.bio?.length || 0}/200 characters</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="academic" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Academic Information</CardTitle>
                            <CardDescription>Update your course and study details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="course">Course</Label>
                                    <Input
                                        id="course"
                                        value={editedData.course || ''}
                                        onChange={(e) => setEditedData({ ...editedData, course: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Year of Study</Label>
                                    <Select
                                        value={editedData.yearOfStudy}
                                        onValueChange={(value) => setEditedData({ ...editedData, yearOfStudy: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['Year 1', 'Year 2', 'Year 3', 'Year 4+'].map(year => (
                                                <SelectItem key={year} value={year}>{year}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Faculty</Label>
                                    <Select
                                        value={editedData.faculty}
                                        onValueChange={(value) => setEditedData({ ...editedData, faculty: value, subject: '' })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select faculty" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(SUBJECT_DATA).map(faculty => (
                                                <SelectItem key={faculty} value={faculty}>{faculty}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Subject</Label>
                                    <Select
                                        value={editedData.subject}
                                        onValueChange={(value) => setEditedData({ ...editedData, subject: value })}
                                        disabled={!editedData.faculty}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {editedData.faculty && SUBJECT_DATA[editedData.faculty as keyof typeof SUBJECT_DATA].map(subject => (
                                                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Weekly Session Goal</Label>
                                <div className="flex items-center gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setEditedData({ ...editedData, weeklySessionGoal: Math.max(1, (editedData.weeklySessionGoal || 5) - 1) })}
                                    >
                                        -
                                    </Button>
                                    <span className="text-xl font-bold w-10 text-center">
                                        {editedData.weeklySessionGoal || 5}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setEditedData({ ...editedData, weeklySessionGoal: Math.min(20, (editedData.weeklySessionGoal || 5) + 1) })}
                                    >
                                        +
                                    </Button>
                                    <span className="text-sm text-muted-foreground">sessions per week</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="availability" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Study Availability</CardTitle>
                            <CardDescription>Select when you're available for study sessions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            <th className="text-left p-2">Day</th>
                                            <th className="text-center p-2">Morning<br /><span className="text-xs font-normal">9am-12pm</span></th>
                                            <th className="text-center p-2">Afternoon<br /><span className="text-xs font-normal">12pm-5pm</span></th>
                                            <th className="text-center p-2">Evening<br /><span className="text-xs font-normal">5pm-9pm</span></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {DAYS.map(day => (
                                            <tr key={day} className="border-t">
                                                <td className="p-2 font-medium">{day}</td>
                                                {TIMES.map(time => (
                                                    <td key={time} className="text-center p-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleAvailability(day, time)}
                                                            className={`w-16 h-8 rounded-md transition-colors ${editedData.availability?.[day]?.[time]
                                                                    ? 'bg-purple-600 text-white'
                                                                    : 'bg-gray-100 hover:bg-gray-200'
                                                                }`}
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
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="preferences" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Study Preferences</CardTitle>
                            <CardDescription>Set your preferred study environment</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label className="text-base font-semibold mb-3 block">Study Atmosphere</Label>
                                <RadioGroup
                                    value={editedData.coStudyingAtmosphere}
                                    onValueChange={(value) => setEditedData({ ...editedData, coStudyingAtmosphere: value })}
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Silent & Independent" id="r1" />
                                            <Label htmlFor="r1" className="font-normal">
                                                Silent & Independent - Pure focus mode
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Quietly Co-working" id="r2" />
                                            <Label htmlFor="r2" className="font-normal">
                                                Quietly Co-working - Occasional check-ins
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Motivational & Social" id="r3" />
                                            <Label htmlFor="r3" className="font-normal">
                                                Motivational & Social - Light chat welcome
                                            </Label>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div>
                                <Label className="text-base font-semibold mb-3 block">Camera Preference</Label>
                                <RadioGroup
                                    value={editedData.cameraPreference}
                                    onValueChange={(value) => setEditedData({ ...editedData, cameraPreference: value })}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Camera always on" id="c1" />
                                            <Label htmlFor="c1" className="font-normal">Camera always on</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Camera on for check-ins" id="c2" />
                                            <Label htmlFor="c2" className="font-normal">Camera for check-ins</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Camera always off" id="c3" />
                                            <Label htmlFor="c3" className="font-normal">Camera always off</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Flexible" id="c4" />
                                            <Label htmlFor="c4" className="font-normal">Flexible</Label>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}