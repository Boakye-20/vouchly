'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, limit, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Bell, MessageSquare, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
    id: string;
    text: string;
    link: string;
    read: boolean;
    createdAt: Date | null;
}

export function NotificationBell() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        const notificationsRef = collection(db, `users/${currentUser.uid}/notifications`);
        const q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(10));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedNotifications = snapshot.docs.map(doc => ({
                id: doc.id,
                text: doc.data().text,
                link: doc.data().link,
                read: doc.data().read,
                createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
            }));

            setNotifications(fetchedNotifications);
            const unread = fetchedNotifications.filter(n => !n.read).length;
            setUnreadCount(unread);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleNotificationClick = async (notification: Notification) => {
        // Navigate to the link
        router.push(notification.link);

        // Mark as read in Firestore if it's unread
        if (!notification.read && currentUser) {
            const notifRef = doc(db, `users/${currentUser.uid}/notifications`, notification.id);
            await updateDoc(notifRef, {
                read: true
            });
        }
    };

    const getIconForNotification = (text: string) => {
        if (text.toLowerCase().includes('request')) {
            return <BookOpen className="h-4 w-4 mr-3 text-primary" />;
        }
        if (text.toLowerCase().includes('message')) {
            return <MessageSquare className="h-4 w-4 mr-3 text-green-500" />;
        }
        return <Bell className="h-4 w-4 mr-3 text-gray-500" />;
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <div className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {unreadCount}
                        </div>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                    notifications.map(notif => (
                        <DropdownMenuItem
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`cursor-pointer ${!notif.read ? 'bg-primary/5' : ''}`}
                        >
                            <div className="flex items-start w-full">
                                {getIconForNotification(notif.text)}
                                <div className="flex-1">
                                    <p className="text-sm">{notif.text}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(notif.createdAt!, { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        </DropdownMenuItem>
                    ))
                ) : (
                    <DropdownMenuItem disabled>
                        <p className="text-sm text-center text-muted-foreground p-4">You have no notifications.</p>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}