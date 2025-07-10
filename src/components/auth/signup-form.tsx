'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MailCheck } from 'lucide-react';
import { UK_UNIVERSITIES } from '@/lib/universities';
import { SearchableSelect } from '@/components/ui/searchable-select';

export function SignUpForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);
    // --- NEW: State to show success message after sending verification ---
    const [isVerificationSent, setIsVerificationSent] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        university: '',
        course: '',
        yearOfStudy: '',
    });

    const validateEmail = (email: string) => {
        return email.endsWith('.ac.uk');
    };

    const handleStep1 = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateEmail(formData.email)) {
            toast({ title: "Invalid email", description: "Please use your UK university email (.ac.uk)", variant: "destructive" });
            return;
        }
        if (!formData.university) {
            toast({ title: "University required", description: "Please select your university", variant: "destructive" });
            return;
        }
        setStep(2);
    };

    // --- UPDATED: This function now sends the verification email ---
    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // --- NEW: Send the verification email immediately after creation ---
            await sendEmailVerification(user);

            // Create user profile in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: formData.email,
                name: formData.name,
                university: formData.university,
                course: formData.course,
                yearOfStudy: formData.yearOfStudy,
                vouchScore: 80,
                sessionsCompleted: 0,
                consecutiveReschedules: 0,
                availability: {}, // Initialize as empty object
                profileComplete: false, // Profile is not complete until setup flow is done
                createdAt: serverTimestamp(),
            });

            toast({
                title: "Account Created!",
                description: "We've sent a verification link to your email.",
            });

            // --- NEW: Update UI to show success message ---
            setIsVerificationSent(true);

        } catch (error: any) {
            let errorMessage = "An error occurred during sign up";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "This email is already registered. Please log in instead.";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "Password should be at least 6 characters long.";
            }
            toast({ title: "Error", description: errorMessage, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    // --- NEW: Render a success message after email is sent ---
    if (isVerificationSent) {
        return (
            <div className="text-center space-y-4 p-4">
                <MailCheck className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="text-xl font-semibold">Please check your email</h3>
                <p className="text-muted-foreground">
                    A verification link has been sent to <span className="font-medium text-primary">{formData.email}</span>.
                    Please click the link to activate your account.
                </p>
                <p className="text-sm text-muted-foreground pt-4">
                    Once verified, you can close this tab and log in.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
            {step === 1 ? (
                <form onSubmit={handleStep1} className="space-y-4">
                    {/* Step 1 form fields... (code unchanged) */}
                    <div><Label htmlFor="email">University Email</Label><Input id="email" type="email" placeholder="your.name@university.ac.uk" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /><p className="text-xs text-gray-500 mt-1">Must be a UK university email (.ac.uk)</p></div>
                    <div><Label htmlFor="university">University</Label><SearchableSelect options={UK_UNIVERSITIES} value={formData.university} onValueChange={(value) => setFormData({ ...formData, university: value })} placeholder="Select your university..." searchPlaceholder="Search universities..." emptyText="No university found." /></div>
                    <div><Label htmlFor="password">Password</Label><Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={6} /><p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p></div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={!formData.email || !formData.password || !formData.university}>Continue →</Button>
                </form>
            ) : (
                <form onSubmit={handleSignUp} className="space-y-4">
                    {/* Step 2 form fields... (code unchanged) */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4"><p className="text-sm text-green-800 font-medium">✓ {formData.university}</p><p className="text-xs text-green-700">{formData.email}</p></div>
                    <div><Label htmlFor="name">Full Name</Label><Input id="name" type="text" placeholder="John Smith" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                    <div><Label htmlFor="course">Course</Label><Input id="course" type="text" placeholder="e.g., BSc Computer Science" value={formData.course} onChange={(e) => setFormData({ ...formData, course: e.target.value })} required /></div>
                    <div><Label>Year of Study</Label><div className="grid grid-cols-2 gap-2 mt-2">{['Year 1', 'Year 2', 'Year 3', 'Year 4+'].map((year) => (<button key={year} type="button" onClick={() => setFormData({ ...formData, yearOfStudy: year })} className={`p-2.5 rounded-lg border transition-all font-medium ${formData.yearOfStudy === year ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-gray-400'}`}>{year}</button>))}</div></div>
                    <div className="flex gap-3 pt-2"><button type="button" onClick={() => setStep(1)} className="flex-1 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">← Back</button><Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading || !formData.yearOfStudy || !formData.name || !formData.course}>{isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>) : ('Create Account')}</Button></div>
                </form>
            )}
        </div>
    );
}