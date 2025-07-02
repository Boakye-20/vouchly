'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { VouchlyLogo } from '@/components/icons';
import { NotificationBell } from '@/components/notifications/notification-bell';
import TimezonePrompt from '@/components/onboarding/TimezonePrompt';
import { saveUserTimezone, getUserTimezone } from '@/lib/timezone';
import { cn } from '@/lib/utils';
// --- NEW: Import auth functions and types ---
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, sendEmailVerification, User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { LayoutDashboard, Users, CalendarClock, BarChart3, UserCircle, MessageSquare, LogOut, Menu, MailWarning, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/browse', label: 'Browse Partners', icon: Users },
    { href: '/dashboard/sessions', label: 'My Sessions', icon: CalendarClock },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/stats', label: 'My Stats', icon: BarChart3 },
    { href: '/dashboard/profile', label: 'Profile', icon: UserCircle },
];

// --- NEW: A dedicated component to show the verification notice ---
function VerifyEmailNotice() {
    const { toast } = useToast();
    const [isSending, setIsSending] = useState(false);

    const resendVerificationEmail = async () => {
        setIsSending(true);
        const user = auth.currentUser;
        if (user) {
            try {
                await sendEmailVerification(user);
                toast({
                    title: "Verification Email Sent",
                    description: "Please check your inbox (and spam folder).",
                });
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to send verification email. Please try again shortly.",
                    variant: "destructive",
                });
            } finally {
                setIsSending(false);
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-50 text-center p-4">
            <MailWarning className="h-16 w-16 text-yellow-500 mb-4" />
            <h1 className="text-2xl font-bold text-yellow-900">Please Verify Your Email</h1>
            <p className="max-w-md mt-2 text-yellow-800">
                A verification link has been sent to your university email address.
                You need to verify your email before you can access the dashboard.
            </p>
            <Button onClick={resendVerificationEmail} disabled={isSending} className="mt-6">
                {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSending ? 'Sending...' : 'Resend Verification Email'}
            </Button>
            <p className="text-sm text-yellow-700 mt-4">
                If you've already verified, please try logging out and logging back in.
            </p>
        </div>
    );
}


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    // --- NEW: State for timezone onboarding ---
    const [timezone, setTimezone] = useState<string | null>(null);
    const [showTimezonePrompt, setShowTimezonePrompt] = useState(false);
    // --- NEW: State to manage auth status ---
    const [authStatus, setAuthStatus] = useState<{
        isLoading: boolean;
        isVerified: boolean;
        user: User | null;
    }>({ isLoading: true, isVerified: false, user: null });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in, check if their email is verified.
                setAuthStatus({ isLoading: false, isVerified: user.emailVerified, user });
                if (user.emailVerified) {
                    const tz = await getUserTimezone(user.uid);
                    setTimezone(tz);
                    setShowTimezonePrompt(!tz);
                }
            } else {
                // User is not signed in, redirect to auth page.
                router.push('/auth');
            }
        });
        return () => unsubscribe();
    }, [router]);


    const handleLogout = async () => {
        await auth.signOut();
        router.push('/');
    };

    // --- NEW: Render loading state while checking auth ---
    if (authStatus.isLoading) {
        return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    // --- NEW: Render verification notice if email is not verified ---
    if (!authStatus.isVerified) {
        return <VerifyEmailNotice />;
    }

    // --- Timezone onboarding prompt ---
    if (showTimezonePrompt && authStatus.user) {
        return <div className="flex h-screen w-full items-center justify-center bg-purple-50/30">
            <TimezonePrompt onSave={async (tz) => {
                await saveUserTimezone(authStatus.user!.uid, tz);
                setTimezone(tz);
                setShowTimezonePrompt(false);
            }} />
        </div>;
    }

    // --- Original layout is rendered only if user is verified and timezone is set ---
    return (
        <div className="flex min-h-screen w-full bg-purple-50/30">
            <aside className="hidden w-64 flex-col border-r bg-white sm:flex">
                <div className="flex h-16 items-center border-b px-6"><Link href="/dashboard" className="flex items-center gap-2 font-semibold text-purple-700"><VouchlyLogo className="h-6 w-6" /><span className="text-xl font-bold">Vouchly</span></Link></div>
                <nav className="flex-1 space-y-1 p-4">{navItems.map((item) => { const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)); return (<Link key={item.href} href={item.href} className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900')}><item.icon className="h-5 w-5" />{item.label}</Link>); })}</nav>
                <div className="border-t p-4"><Button variant="ghost" className="w-full justify-start gap-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900" onClick={handleLogout}><LogOut className="h-5 w-5" />Sign Out</Button></div>
            </aside>
            <div className="flex flex-1 flex-col">
                <header className="flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6"><Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu className="h-5 w-5" /></Button><Link href="/dashboard" className="flex items-center gap-2 sm:hidden"><VouchlyLogo className="h-6 w-6 text-purple-700" /><span className="text-xl font-bold text-purple-700">Vouchly</span></Link><div className="hidden sm:block"><h1 className="text-lg font-semibold text-gray-900">{navItems.find(item => pathname.startsWith(item.href))?.label || 'Dashboard'}</h1></div><div className="flex items-center gap-4"><NotificationBell /></div></header>
                {isMobileMenuOpen && (<div className="fixed inset-0 z-50 sm:hidden"><div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} /><nav className="fixed left-0 top-0 bottom-0 w-64 bg-white p-4"><div className="mb-4"><Link href="/dashboard" className="flex items-center gap-2 text-purple-700"><VouchlyLogo className="h-6 w-6" /><span className="text-xl font-bold">Vouchly</span></Link></div>{navItems.map((item) => { const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)); return (<Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors mb-1', isActive ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900')}><item.icon className="h-5 w-5" />{item.label}</Link>); })}<div className="mt-auto pt-4 border-t"><Button variant="ghost" className="w-full justify-start gap-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900" onClick={handleLogout}><LogOut className="h-5 w-5" />Sign Out</Button></div></nav></div>)}
                <main className="flex-1 overflow-y-auto bg-purple-50/30">{children}</main>
            </div>
        </div>
    );
}