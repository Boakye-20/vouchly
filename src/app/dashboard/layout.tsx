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
import { LayoutDashboard, Users, CalendarClock, BarChart3, UserCircle, MessageSquare, LogOut, Menu, X, MailWarning, Loader2, Shield, BarChart, Clock } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
// REMOVE: import Footer from '@/components/layout/footer';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/browse', label: 'Browse Partners', icon: Users },
    { href: '/dashboard/sessions', label: 'My Sessions', icon: CalendarClock },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/stats', label: 'My Stats', icon: BarChart3 },
    { href: '/dashboard/profile', label: 'Profile', icon: UserCircle },
];

const adminNavItems = [
    { href: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart },
    { href: '/dashboard/admin/users', label: 'User Management', icon: Shield },
    { href: '/dashboard/admin/scheduled-jobs', label: 'Scheduled Jobs', icon: Clock },
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

// Touch-friendly button component
function TouchButton({
    children,
    className = '',
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className={`active:scale-95 transition-transform ${className}`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            {...props}
        >
            {children}
        </button>
    );
}

function NavItem({ item, onClick }: { item: { href: string; label: string; icon: any }, onClick?: () => void }) {
    return (
        <Link
            href={item.href}
            onClick={onClick}
            className={cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                'active:scale-95 active:opacity-80',
                'touch-manipulation',
                usePathname() === item.href
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
            style={{ WebkitTapHighlightColor: 'transparent' }}
        >
            <item.icon className="h-5 w-5" />
            {item.label}
        </Link>
    );
}

function SignOutButton() {
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await auth.signOut();
            router.push('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <TouchButton
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors"
        >
            <LogOut className="mr-3 h-5 w-5" />
            Sign out
        </TouchButton>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const [timezone, setTimezone] = useState<string | null>(null);
    const [showTimezonePrompt, setShowTimezonePrompt] = useState(false);
    const [authStatus, setAuthStatus] = useState<{
        isLoading: boolean;
        isVerified: boolean;
        user: User | null;
    }>({ isLoading: true, isVerified: false, user: null });
    const [checkingProfile, setCheckingProfile] = useState(true);
    const [profileComplete, setProfileComplete] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push('/auth');
                return;
            }
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists() && userDoc.data()?.profileComplete) {
                setProfileComplete(true);

                // Check if user is admin (simple email-based check for now)
                const userData = userDoc.data();
                const adminEmails = ['admin@vouchly.com', 'pkwarts@gmail.com']; // Add your admin emails here
                const isUserAdmin = adminEmails.includes(user.email || '') || userData?.isAdmin === true;
                setIsAdmin(isUserAdmin);
            } else {
                setProfileComplete(false);
                // Only redirect if not already on setup page
                if (pathname !== '/dashboard/profile/setup') {
                    router.push('/dashboard/profile/setup');
                }
            }
            setCheckingProfile(false);
        });
        return () => unsubscribe();
    }, [router, pathname]);

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

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setShowMobileMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await auth.signOut();
        router.push('/');
    };

    // --- NEW: Render loading state while checking auth ---
    if (checkingProfile) {
        return <div className="flex items-center justify-center min-h-screen">Checking profile...</div>;
    }
    // Only block dashboard content if not on setup page and profile is incomplete
    if (!profileComplete && pathname !== '/dashboard/profile/setup') {
        return null;
    }

    if (authStatus.isLoading) {
        return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    // --- NEW: Render verification notice if email is not verified ---
    if (!authStatus.isVerified) {
        return <VerifyEmailNotice />;
    }

    // --- Timezone onboarding prompt ---
    if (showTimezonePrompt && authStatus.user) {
        return <div className="flex h-screen w-full items-center justify-center bg-white">
            <TimezonePrompt onSave={async (tz) => {
                await saveUserTimezone(authStatus.user!.uid, tz);
                setTimezone(tz);
                setShowTimezonePrompt(false);
            }} />
        </div>;
    }

    // --- Original layout is rendered only if user is verified and timezone is set ---
    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-white overflow-hidden">
            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between p-4 border-b bg-white">
                <Link href="/dashboard" className="flex items-center space-x-2">
                    <VouchlyLogo className="h-8 w-8 text-blue-600" />
                </Link>
                <TouchButton
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="p-2 rounded-lg hover:bg-accent"
                    aria-label="Toggle menu"
                >
                    {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </TouchButton>
            </header>

            {/* Mobile Menu */}
            {showMobileMenu && (
                <div
                    ref={mobileMenuRef}
                    className="md:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
                    style={{ marginTop: '64px' }} // Height of the mobile header
                >
                    <div className="p-4 space-y-2">
                        {navItems.map((item) => (
                            <NavItem key={item.href} item={item} onClick={() => setShowMobileMenu(false)} />
                        ))}
                        {isAdmin && adminNavItems.map((item) => (
                            <NavItem key={item.href} item={item} onClick={() => setShowMobileMenu(false)} />
                        ))}
                        <div className="pt-4 mt-4 border-t">
                            <SignOutButton />
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 border-r bg-white flex-shrink-0">
                <div className="flex h-16 items-center border-b px-6 bg-white">
                    <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                        <VouchlyLogo className="h-6 w-6 text-blue-600" />
                        <span className="text-xl font-semibold tracking-tight text-gray-900">Vouchly</span>
                    </Link>
                </div>
                <nav className="flex-1 space-y-1 p-4">
                    {navItems.map((item) => (
                        <NavItem key={item.href} item={item} />
                    ))}
                    {isAdmin && (
                        <div className="mt-8 pt-4 border-t">
                            <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Admin
                            </h3>
                            {adminNavItems.map((item) => (
                                <NavItem key={item.href} item={item} />
                            ))}
                        </div>
                    )}
                </nav>
                <div className="mt-auto pt-4 border-t">
                    <SignOutButton />
                </div>
            </aside>

            <div className="flex flex-1 flex-col">
                <header className="flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6">
                    <div className="flex items-center gap-2 sm:hidden">
                        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu className="h-5 w-5" /></Button>
                        <Link href="/dashboard" className="flex items-center gap-2"><VouchlyLogo className="h-6 w-6 text-blue-600" /><span className="text-xl font-semibold tracking-tight text-gray-900">Vouchly</span></Link>
                    </div>
                    <div className="flex items-center gap-4 ml-auto">
                        <NotificationBell />
                    </div>
                </header>
                <main className="flex-1 overflow-auto w-full">
                    <div className="max-w-7xl mx-auto p-4 md:p-6 w-full">
                        {children}
                    </div>
                </main>
                {/* REMOVE the <Footer /> from the dashboard layout, so only the global footer is used. */}

                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-50 sm:hidden">
                        <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
                        <nav className="fixed left-0 top-0 bottom-0 w-64 bg-white p-4">
                            <div className="mb-4">
                                <Link href="/dashboard" className="flex items-center gap-2 text-blue-600">
                                    <VouchlyLogo className="h-6 w-6 text-blue-600" />
                                    <span className="text-xl font-semibold tracking-tight text-gray-900">Vouchly</span>
                                </Link>
                            </div>
                            {navItems.map((item) => {
                                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors active:scale-95 active:opacity-80',
                                            isActive
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                                        )}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        style={{ WebkitTapHighlightColor: 'transparent' }}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.label}
                                    </Link>
                                );
                            })}

                            {/* Admin Navigation in Mobile Menu */}
                            {isAdmin && (
                                <>
                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Admin
                                        </div>
                                    </div>
                                    {adminNavItems.map((item) => {
                                        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={cn(
                                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors active:scale-95 active:opacity-80',
                                                    isActive
                                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                                                )}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                style={{ WebkitTapHighlightColor: 'transparent' }}
                                            >
                                                <item.icon className="h-5 w-5" />
                                                {item.label}
                                            </Link>
                                        );
                                    })}
                                </>
                            )}

                            <div className="mt-auto pt-4 border-t">
                                <TouchButton
                                    className="w-full justify-start gap-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 px-3 py-2 text-sm font-medium rounded-lg"
                                    onClick={() => {
                                        handleLogout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                >
                                    <LogOut className="h-5 w-5" />
                                    Sign Out
                                </TouchButton>
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
}