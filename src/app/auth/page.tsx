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
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
            <Link href="/" className="flex items-center space-x-2 mb-8">
                <VouchlyLogo className="h-10 w-10 text-blue-600" />
                <h1 className="text-3xl font-light font-headline text-gray-900 tracking-tight">Vouchly</h1>
            </Link>

            <Tabs defaultValue="login" className="w-full max-w-md">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 border border-gray-200 rounded-lg mb-2">
                    <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-none text-gray-700 font-medium">Log In</TabsTrigger>
                    <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-none text-gray-700 font-medium">Sign Up</TabsTrigger>
                </TabsList>

                {/* Login Tab Content */}
                <TabsContent value="login">
                    <Card className="border border-gray-200 bg-white">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl font-light text-gray-900">Welcome Back!</CardTitle>
                            <CardDescription className="text-gray-600">
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
                    <Card className="border border-gray-200 bg-white">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl font-light text-gray-900">Create an Account</CardTitle>
                            <CardDescription className="text-gray-600">
                                Join thousands of UK students on Vouchly. It is free!
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SignUpForm />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            <p className="text-center text-sm text-gray-500 mt-6">
                By continuing, you agree to Vouchly's <Link href="/terms" className="underline hover:text-blue-600">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-blue-600">Privacy Policy</Link>.
            </p>
        </div>
    );
}