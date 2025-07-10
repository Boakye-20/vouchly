"use client";

import { InfoPageHeader } from '@/components/layout/vouch-score-header';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { NotificationBell } from '@/components/notifications/notification-bell';
import React from 'react';

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user } = useAuth();
    const showNotificationBell = !!user && pathname.startsWith('/dashboard');
    return (
        <>
            <InfoPageHeader showNotificationBell={showNotificationBell}>
                {showNotificationBell && <NotificationBell />}
            </InfoPageHeader>
            {children}
        </>
    );
} 