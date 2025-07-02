'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VouchlyLogo } from '@/components/icons';
import { Mail, RefreshCw, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VerifyEmailPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [checking, setChecking] = useState(false);
    const [resending, setResending] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push('/auth');
            } else if (user.emailVerified) {
                // Update user status in Firestore
                updateDoc(doc(db, 'users', user.uid), {
                    emailVerified: true,
                    status: 'available'
                }).then(() => {
                    router.push('/dashboard/profile/setup');
                });
            } else {
                setUser(user);
            }
        });

        return () => unsubscribe();
    }, [router]);

    const checkVerification = async () => {
        if (!user) return;

        setChecking(true);
        try {
            await user.reload();
            if (user.emailVerified) {
                await updateDoc(doc(db, 'users', user.uid), {
                    emailVerified: true,
                    status: 'available'
                });

                toast({
                    title: "Email verified!",
                    description: "Redirecting to profile setup...",
                });

                setTimeout(() => {
                    router.push('/dashboard/profile/setup');
                }, 1500);
            } else {
                toast({
                    title: "Not verified yet",
                    description: "Please check your email and click the verification link.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to check verification status.",
                variant: "destructive"
            });
        } finally {
            setChecking(false);
        }
    };

    const resendEmail = async () => {
        if (!user) return;

        setResending(true);
        try {
            const { sendEmailVerification } = await import('firebase/auth');
            await sendEmailVerification(user);

            toast({
                title: "Email sent!",
                description: "A new verification email has been sent to your inbox.",
            });
        } catch (error: any) {
            if (error.code === 'auth/too-many-requests') {
                toast({
                    title: "Too many requests",
                    description: "Please wait a few minutes before requesting another email.",
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to send verification email.",
                    variant: "destructive"
                });
            }
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <VouchlyLogo className="h-12 w-12 text-primary" />
                </div>

                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <Mail className="h-6 w-6 text-blue-600" />
                        </div>
                        <CardTitle className="text-2xl">Verify your email</CardTitle>
                        <CardDescription className="text-base">
                            We've sent a verification link to:
                            <br />
                            <span className="font-medium text-gray-900">{user?.email}</span>
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 text-center">
                            Click the link in your email to verify your university account and continue to Vouchly.
                        </p>

                        <div className="space-y-3">
                            <Button
                                onClick={checkVerification}
                                className="w-full"
                                disabled={checking}
                            >
                                {checking ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    <>
                                        I've verified my email
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>

                            <Button
                                onClick={resendEmail}
                                variant="outline"
                                className="w-full"
                                disabled={resending}
                            >
                                {resending ? "Sending..." : "Resend verification email"}
                            </Button>
                        </div>

                        <div className="pt-4 border-t">
                            <p className="text-xs text-gray-500 text-center">
                                Can't find the email? Check your spam folder or university email filters.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}