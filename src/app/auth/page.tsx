'use client';

import { LoginForm } from '@/components/auth/login-form';
import { SignUpForm } from '@/components/auth/signup-form';
import { VouchlyLogo } from '@/components/icons';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

export default function AuthenticationPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Link href="/" className="flex items-center space-x-2 mb-8">
                <VouchlyLogo className="h-10 w-10 text-primary" />
                <h1 className="text-3xl font-bold font-headline text-gray-800">Vouchly</h1>
            </Link>

            <Tabs defaultValue="login" className="w-full max-w-md">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Log In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {/* Login Tab Content */}
                <TabsContent value="login">
                    <Card className="shadow-lg">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">Welcome Back!</CardTitle>
                            <CardDescription>
                                Log in to find your study partner and get to work.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LoginForm />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Signup Tab Content */}
                <TabsContent value="signup">
                    <Card className="shadow-lg">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">Create an Account</CardTitle>
                            <CardDescription>
                                Join thousands of UK students on Vouchly. It's free!
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SignUpForm />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            <p className="text-center text-sm text-gray-600 mt-6">
                By continuing, you agree to Vouchly's <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
            </p>
        </div>
    );
}