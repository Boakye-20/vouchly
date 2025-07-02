'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VouchlyLogo } from '@/components/icons';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setIsSuccess(true);
            toast({
                title: 'Reset email sent!',
                description: 'Check your inbox for password reset instructions.',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.code === 'auth/user-not-found'
                    ? 'No account found with this email.'
                    : 'Failed to send reset email. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Link href="/" className="flex items-center space-x-2 mb-8">
                <VouchlyLogo className="h-10 w-10 text-primary" />
                <h1 className="text-3xl font-bold font-headline text-gray-800">Vouchly</h1>
            </Link>
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Reset Password</CardTitle>
                    <CardDescription>
                        Enter your email and we'll send you reset instructions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!isSuccess ? (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your-email@university.ac.uk"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Mail className="mr-2 h-4 w-4" />
                                )}
                                {isSubmitting ? 'Sending...' : 'Send Reset Email'}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="text-green-600 mb-4">
                                <Mail className="h-12 w-12 mx-auto mb-2" />
                                <p className="font-semibold">Email sent successfully!</p>
                            </div>
                            <p className="text-sm text-gray-600">
                                Check your inbox for password reset instructions.
                            </p>
                        </div>
                    )}
                    <div className="mt-6 text-center">
                        <Link href="/auth" className="text-sm text-primary hover:underline inline-flex items-center">
                            <ArrowLeft className="mr-1 h-3 w-3" />
                            Back to login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}