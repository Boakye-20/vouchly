'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, ChevronRight, ChevronLeft } from 'lucide-react';

// Data structure for the two-tiered subject selection
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

// Updated SetupData interface with new faculty/subject fields
interface SetupData {
    availability: {
        morning: string[];
        afternoon: string[];
        evening: string[];
    };
    coStudyingAtmosphere: string;
    cameraPreference: string;
    bio: string;
    weeklyGoal: number;
    faculty: string;
    subject: string;
}

// Change DAYS to full names
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function normalizeAvailability(availability: { morning: string[]; afternoon: string[]; evening: string[] }) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const result: Record<string, { morning: boolean; afternoon: boolean; evening: boolean }> = {};
    days.forEach(day => {
        result[day] = {
            morning: availability.morning.includes(day),
            afternoon: availability.afternoon.includes(day),
            evening: availability.evening.includes(day),
        };
    });
    return result;
}

export default function ProfileSetupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [userId, setUserId] = useState<string | null>(null);

    const [setupData, setSetupData] = useState<SetupData>({
        availability: { morning: [], afternoon: [], evening: [] },
        coStudyingAtmosphere: '',
        cameraPreference: '',
        bio: '',
        weeklyGoal: 5,
        faculty: '',
        subject: '',
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
            if (!user) {
                router.push('/auth');
                return;
            }
            setUserId(user.uid);
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists() && userDoc.data().profileComplete) {
                router.push('/dashboard');
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [router]);

    // Update toggleAvailability to use full day names
    const toggleAvailability = (period: 'morning' | 'afternoon' | 'evening', day: string) => {
        setSetupData(prev => {
            const currentDays = prev.availability[period];
            const newDays = currentDays.includes(day)
                ? currentDays.filter(d => d !== day)
                : [...currentDays, day];
            return { ...prev, availability: { ...prev.availability, [period]: newDays } };
        });
    };

    const handleFacultyChange = (value: string) => {
        setSetupData(prev => ({ ...prev, faculty: value, subject: '' }));
    };

    const handleComplete = async () => {
        if (!userId || !canProceed()) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, 'users', userId), {
                faculty: setupData.faculty,
                subject: setupData.subject,
                bio: setupData.bio,
                weeklySessionGoal: setupData.weeklyGoal,
                availability: normalizeAvailability(setupData.availability),
                coStudyingAtmosphere: setupData.coStudyingAtmosphere,
                cameraPreference: setupData.cameraPreference,
                profileComplete: true,
                updatedAt: new Date()
            });
            toast({ title: "Profile complete!", description: "Let's find your study partners." });
            router.push('/dashboard');
        } catch (error) {
            toast({ title: "Error", description: "Failed to save profile. Please try again.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const countSelectedSlots = () => {
        return setupData.availability.morning.length +
            setupData.availability.afternoon.length +
            setupData.availability.evening.length;
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return setupData.faculty !== '' && setupData.subject !== '';
            case 2:
                return countSelectedSlots() >= 3;
            case 3:
                return true; // Preferences are optional
            default:
                return false;
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex space-x-2">
                            {[1, 2, 3].map((step) => (<div key={step} className={`h-2 rounded-full transition-all ${step === currentStep ? 'w-8 bg-primary' : step < currentStep ? 'bg-primary' : 'w-2 bg-gray-300'}`} />))}
                        </div>
                        <span className="text-sm text-gray-600">Step {currentStep} of 3</span>
                    </div>
                    <CardTitle>
                        {currentStep === 1 && "Add your academic details"}
                        {currentStep === 2 && "When are you free to study?"}
                        {currentStep === 3 && "Your study preferences"}
                    </CardTitle>
                    <CardDescription>
                        {currentStep === 1 && "Tell us about your course and subject to help us match you with relevant partners."}
                        {currentStep === 2 && "Select all times you're usually available for co-studying sessions."}
                        {currentStep === 3 && "Help us match you with compatible study partners. Preferences are optional."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-base font-semibold mb-3">Academic Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="faculty">Faculty</Label>
                                        <Select onValueChange={handleFacultyChange} value={setupData.faculty}>
                                            <SelectTrigger id="faculty"><SelectValue placeholder="Select your faculty..." /></SelectTrigger>
                                            <SelectContent>{Object.keys(SUBJECT_DATA).map(faculty => <SelectItem key={faculty} value={faculty}>{faculty}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Select onValueChange={(value) => setSetupData(prev => ({ ...prev, subject: value }))} value={setupData.subject} disabled={!setupData.faculty}>
                                            <SelectTrigger id="subject"><SelectValue placeholder="First, select a faculty..." /></SelectTrigger>
                                            <SelectContent>{setupData.faculty && SUBJECT_DATA[setupData.faculty as keyof typeof SUBJECT_DATA].map(subject => <SelectItem key={subject} value={subject}>{subject}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="bio" className="text-base font-semibold mb-2 block">Short bio (optional)</Label>
                                <Textarea id="bio" placeholder="Tell partners about your study goals, what motivates you..." value={setupData.bio} onChange={(e) => setSetupData(prev => ({ ...prev, bio: e.target.value }))} className="min-h-[100px]" maxLength={200} />
                                <p className="text-xs text-gray-500 mt-1">{setupData.bio.length}/200 characters</p>
                            </div>
                            <div>
                                <Label className="text-base font-semibold mb-2 block">Weekly session goal</Label>
                                <div className="flex items-center space-x-4"><Button type="button" variant="outline" size="icon" onClick={() => setSetupData(p => ({ ...p, weeklyGoal: Math.max(1, p.weeklyGoal - 1) }))}>-</Button><span className="text-xl font-bold w-10 text-center">{setupData.weeklyGoal}</span><Button type="button" variant="outline" size="icon" onClick={() => setSetupData(p => ({ ...p, weeklyGoal: Math.min(20, p.weeklyGoal + 1) }))}>+</Button><span className="text-sm text-muted-foreground">sessions per week</span></div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
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
                                                            onClick={() => toggleAvailability(time, day)}
                                                            className={`w-16 h-8 rounded-md transition-colors ${setupData.availability[time].includes(day)
                                                                ? 'bg-purple-600 text-white'
                                                                : 'bg-gray-100 hover:bg-gray-200'} text-sm font-bold capitalize`}
                                                        >
                                                            {setupData.availability[time].includes(day) ? '✓' : ''}
                                                        </button>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {countSelectedSlots() < 3 && (
                                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                                    ⚠️ Please select at least <b>3</b> time slots to continue
                                </p>
                            )}
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-8">
                            <div>
                                <Label className="text-base font-semibold mb-3 block">Preferred co-studying atmosphere</Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {["Silent & Independent", "Quietly Co-working", "Motivational & Social"].map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            className={`flex flex-col items-start p-4 border rounded-lg cursor-pointer transition-all
                                                ${setupData.coStudyingAtmosphere === option ? 'bg-primary/10 border-primary ring-2 ring-primary' : 'bg-white hover:border-gray-400'}`}
                                            onClick={() => setSetupData({
                                                ...setupData,
                                                coStudyingAtmosphere: setupData.coStudyingAtmosphere === option ? '' : option,
                                            })}
                                        >
                                            <span className="font-medium">
                                                {option === 'Silent & Independent' && '🤫 Silent & Independent'}
                                                {option === 'Quietly Co-working' && '🤝 Quietly Co-working'}
                                                {option === 'Motivational & Social' && '💬 Motivational & Social'}
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
                                <Label className="text-base font-semibold mb-3 block">Camera preference during sessions</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {["Camera always on", "Camera for check-ins", "Camera always off", "Flexible"].map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all
                                                ${setupData.cameraPreference === option ? 'bg-primary/10 border-primary ring-2 ring-primary' : 'bg-white hover:border-gray-400'}`}
                                            onClick={() => setSetupData({
                                                ...setupData,
                                                cameraPreference: setupData.cameraPreference === option ? '' : option,
                                            })}
                                        >
                                            <span>
                                                {option === 'Camera always on' && '📹 Camera always on'}
                                                {option === 'Camera for check-ins' && '📷 Camera for check-ins'}
                                                {option === 'Camera always off' && '🚫 Camera always off'}
                                                {option === 'Flexible' && '🤷 Flexible'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between mt-8">
                        <Button type="button" variant="outline" onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))} disabled={currentStep === 1}>
                            <ChevronLeft className="h-4 w-4 mr-2" />Back
                        </Button>
                        {currentStep < 3 ? (
                            <Button type="button" onClick={() => setCurrentStep(prev => prev + 1)} disabled={!canProceed()}>
                                Next<ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        ) : (
                            <Button onClick={handleComplete} disabled={!canProceed() || saving} className="bg-green-600 hover:bg-green-700">
                                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Check className="h-4 w-4 mr-2" />Complete Profile</>}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}