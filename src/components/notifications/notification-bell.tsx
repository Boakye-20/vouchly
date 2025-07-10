'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, limit, doc, updateDoc, Timestamp, where, writeBatch, startAfter, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import {
    Bell,
    MessageSquare,
    Calendar,
    X,
    Check,
    Clock,
    AlertTriangle,
    Info,
    Award,
    User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { NotificationData, NotificationType, NOTIFICATION_ICONS, NOTIFICATION_TITLES } from "@/types/notifications";

interface Notification extends Omit<NotificationData, 'createdAt' | 'type'> {
    id: string;
    type: NotificationType;
    createdAt: Date;
    read: boolean;
    title: string;
    message: string;
    link?: string;
    data?: Record<string, any>;
    actions?: {
        label: string;
        action: string;
        variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    }[];
}

const ICON_MAP: Record<string, React.ReactNode> = {
    'calendar-plus': <Calendar className="h-4 w-4 mr-3 text-blue-500" />,
    'calendar-check': <Check className="h-4 w-4 mr-3 text-green-500" />,
    'calendar-x': <X className="h-4 w-4 mr-3 text-red-500" />,
    'bell': <Bell className="h-4 w-4 mr-3 text-yellow-500" />,
    'calendar-off': <X className="h-4 w-4 mr-3 text-gray-500" />,
    'calendar-clock': <Clock className="h-4 w-4 mr-3 text-purple-500" />,
    'message-square': <MessageSquare className="h-4 w-4 mr-3 text-blue-400" />,
    'award': <Award className="h-4 w-4 mr-3 text-yellow-500" />,
    'info': <Info className="h-4 w-4 mr-3 text-gray-500" />,
    'user': <UserIcon className="h-4 w-4 mr-3 text-green-500" />
};

export function NotificationBell() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        const notificationsRef = collection(db, `users/${currentUser.uid}/notifications`);
        const q = query(
            notificationsRef,
            where('expiresAt', '>', Timestamp.now()),
            orderBy('expiresAt', 'asc'),
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedNotifications = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title || '',
                    message: data.message || '',
                    type: (data.type || 'system') as NotificationType,
                    read: data.read || false,
                    link: data.link,
                    data: data.data || {},
                    actions: data.actions || [],
                    createdAt: (data.createdAt as Timestamp)?.toDate?.() || new Date(),
                } as Notification;
            });
            setNotifications(fetchedNotifications);
            setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
            setHasMore(snapshot.docs.length === 20);
            const unread = fetchedNotifications.filter(n => !n.read).length;
            setUnreadCount(unread);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const markAsRead = async (notification: NotificationData) => {
        if (!notification.id) return;

        if (notification.link) {
            router.push(notification.link);
        }

        // Mark as read in Firestore if it's unread
        if (!notification.read && currentUser) {
            const notifRef = doc(db, `users/${currentUser.uid}/notifications`, notification.id);
            await updateDoc(notifRef, { read: true });
        }
    };

    const handleAction = async (e: React.MouseEvent, notification: NotificationData, action: string) => {
        e.stopPropagation();
        if (!notification.id) return;

        // Handle different action types
        if (action.startsWith('accept:')) {
            const [_, sessionId] = action.split(':');
            // Handle accept action (e.g., accept session request)
            console.log('Accept session:', sessionId);
        } else if (action.startsWith('decline:')) {
            const [_, sessionId] = action.split(':');
            // Handle decline action
            console.log('Decline session:', sessionId);
        }

        // Mark as read after action
        if (currentUser) {
            const notifRef = doc(db, `users/${currentUser.uid}/notifications`, notification.id);
            await updateDoc(notifRef, { read: true });
        }
    };

    const markAllAsRead = async () => {
        if (!currentUser) return;

        const batch = writeBatch(db);
        const unreadNotifications = notifications.filter(n => !n.read);

        unreadNotifications.forEach(notification => {
            const notifRef = doc(db, `users/${currentUser.uid}/notifications`, notification.id);
            batch.update(notifRef, { read: true });
        });

        if (unreadNotifications.length > 0) {
            await batch.commit();
        }
    };

    const getNotificationIcon = (type: string) => {
        const iconName = NOTIFICATION_ICONS[type as keyof typeof NOTIFICATION_ICONS] || 'bell';
        return ICON_MAP[iconName] || <Bell className="h-4 w-4 mr-3 text-gray-500" />;
    };

    // Load more notifications
    const loadMoreNotifications = async () => {
        if (!currentUser || !lastDoc) return;
        const notificationsRef = collection(db, `users/${currentUser.uid}/notifications`);
        const q = query(
            notificationsRef,
            where('expiresAt', '>', Timestamp.now()),
            orderBy('expiresAt', 'asc'),
            orderBy('createdAt', 'desc'),
            startAfter(lastDoc),
            limit(20)
        );
        const snapshot = await getDocs(q);
        const fetchedNotifications = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title || '',
                message: data.message || '',
                type: (data.type || 'system') as NotificationType,
                read: data.read || false,
                link: data.link,
                data: data.data || {},
                actions: data.actions || [],
                createdAt: (data.createdAt as Timestamp)?.toDate?.() || new Date(),
            } as Notification;
        });
        setNotifications(prev => [...prev, ...fetchedNotifications]);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === 20);
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
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
            <DropdownMenuContent align="end" className="w-96 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center px-2 py-1.5">
                    <DropdownMenuLabel className="text-sm font-semibold">Notifications</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-muted-foreground"
                            onClick={(e) => {
                                e.stopPropagation();
                                markAllAsRead();
                            }}
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                    <div className="divide-y">
                        {notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                onClick={() => {
                                    markAsRead(notification);
                                    if (notification.link) {
                                        router.push(notification.link);
                                    }
                                }}
                                className={cn(
                                    'cursor-pointer flex-col items-start py-3 px-2',
                                    !notification.read && 'bg-primary/5',
                                    notification.link && 'hover:bg-accent/50'
                                )}
                            >
                                <div className="flex items-start w-full">
                                    <div className="mt-0.5">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-medium leading-tight line-clamp-1">
                                                {notification.title}
                                            </h4>
                                            <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                                                {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-0.5">
                                            {notification.message}
                                        </p>

                                        {notification.actions && notification.actions.length > 0 && (
                                            <div className="flex gap-2 mt-2">
                                                {notification.actions.map((action, i) => (
                                                    <Button
                                                        key={i}
                                                        variant={action.variant || 'outline'}
                                                        size="sm"
                                                        className="h-7 text-xs"
                                                        onClick={(e) => handleAction(e, notification, action.action)}
                                                    >
                                                        {action.label}
                                                    </Button>
                                                ))}
                                            </div>
                                        )}

                                        {notification.data?.scheduledTime && (
                                            <div className="mt-1.5 flex items-center text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3 mr-1.5" />
                                                {format(new Date(notification.data.scheduledTime), 'MMM d, yyyy h:mm a')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </div>
                ) : (
                    <div className="py-6 text-center">
                        <Bell className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                        <p className="text-sm text-muted-foreground">No notifications yet</p>
                        <p className="text-xs text-muted-foreground mt-1">We'll notify you when something arrives</p>
                    </div>
                )}

                {notifications.length > 0 && (
                    <div className="border-t px-2 py-1.5">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs text-muted-foreground h-7"
                            onClick={() => router.push('/dashboard/notifications')}
                        >
                            View all notifications
                        </Button>
                    </div>
                )}
                {hasMore && (
                    <button onClick={loadMoreNotifications} className="mt-2 px-3 py-1 bg-[#6366f1] text-white rounded">Load More</button>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}