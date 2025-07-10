'use client';

import Link from 'next/link';
import { VouchlyLogo } from '@/components/icons';
import { ReactNode } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function InfoPageHeader({ children, showNotificationBell }: { children?: React.ReactNode, showNotificationBell?: boolean }) {
    const { user } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    let initials = 'U';
    if (user) {
        if ('name' in user && typeof user.name === 'string') {
            initials = user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
        } else if ('email' in user && typeof user.email === 'string') {
            initials = user.email[0].toUpperCase();
        }
    }
    const profilePic = user?.photoURL;
    const pathname = usePathname();
    // Show profile circle and bell if logged in on ANY page
    const showProfile = !!user;
    const showAuthButtons = !user;

    const handleLogout = async () => {
        await signOut(auth);
        setMenuOpen(false);
        window.location.href = '/';
    };

    return (
        <header className="bg-white border-b">
            <div className="flex items-center justify-between px-6 py-4">
                <Link href="/" className="flex items-center gap-2 group" aria-label="Go to landing page">
                    <VouchlyLogo className="h-8 w-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
                    <span className="text-xl font-semibold tracking-tight text-gray-900 group-hover:text-blue-700 transition-colors">Vouchly</span>
                </Link>
                <nav className="flex items-center gap-x-8">
                    <Link href="/how-it-works" className="text-base font-medium text-gray-700 hover:text-blue-700 transition-colors">How it Works</Link>
                    <Link href="/features" className="text-base font-medium text-gray-700 hover:text-blue-700 transition-colors">Features</Link>
                    <Link href="/contact" className="text-base font-medium text-gray-700 hover:text-blue-700 transition-colors">Contact Us</Link>
                </nav>
                {showProfile ? (
                    <div className="flex items-center gap-4">
                        {/* Profile Circle */}
                        <div className="relative">
                            <button
                                className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                onClick={() => setMenuOpen(v => !v)}
                                aria-label="Open profile menu"
                            >
                                {profilePic ? (
                                    <img src={profilePic} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                    initials
                                )}
                            </button>
                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                    <Link href="/dashboard" className="block px-4 py-2 text-gray-900 hover:bg-blue-50">My Dashboard</Link>
                                    <Link href="/dashboard/messages" className="block px-4 py-2 text-gray-900 hover:bg-blue-50">Messages</Link>
                                    <Link href="/dashboard/profile" className="block px-4 py-2 text-gray-900 hover:bg-blue-50">Profile</Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-blue-50"
                                    >Log out</button>
                                </div>
                            )}
                        </div>
                        {/* Notification Bell */}
                        <NotificationBell />
                    </div>
                ) : showAuthButtons ? (
                    <div className="flex items-center gap-2">
                        <Link href="/auth" className="text-base font-medium text-gray-700 hover:text-blue-700 transition-colors">Log In</Link>
                        <Link href="/auth" className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-base font-medium transition-colors">Get Started Free</Link>
                    </div>
                ) : null}
            </div>
            <div className="h-1 w-full bg-blue-600 rounded-full" style={{ height: '3px' }} />
        </header>
    );
}