"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { format, formatDistanceToNow } from 'date-fns';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquareText } from "lucide-react";

// You can move this to a central lib/types.ts file
interface Conversation {
    sessionId: string;
    partnerName: string;
    partnerAvatar: string;
    sessionTopic: string;
    lastMessage: {
        text: string;
        timestamp: Date | null;
    };
}

export default function MessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<{ uid: string } | null>(null);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, user => {
            setCurrentUser(user ? { uid: user.uid } : null);
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        };

        // Query for sessions that are active (scheduled or in-progress)
        const q = query(
            collection(db, 'sessions'),
            where('participantIds', 'array-contains', currentUser.uid),
            where('status', 'in', ['scheduled', 'in_progress'])
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedConversations = querySnapshot.docs.map(doc => {
                const data = doc.data();
                const partnerId = data.initiatorId === currentUser.uid ? data.recipientId : data.initiatorId;
                const partnerInfo = data.participants?.[partnerId] || {};

                // This assumes you store a `lastMessage` object on the session doc for previews.
                // This is a common and efficient practice called denormalization.
                const lastMessageTimestamp = (data.lastMessage?.createdAt as Timestamp)?.toDate() || null;

                return {
                    sessionId: doc.id,
                    partnerName: partnerInfo.name || "Study Partner",
                    partnerAvatar: `https://ui-avatars.com/api/?name=${(partnerInfo.name || 'S').replace(' ', '+')}`,
                    sessionTopic: data.focusTopic || 'General Study',
                    lastMessage: {
                        text: data.lastMessage?.text || "No messages yet.",
                        timestamp: lastMessageTimestamp
                    }
                };
            });
            setConversations(fetchedConversations);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-headline font-bold">Messages</h1>
                <p className="text-muted-foreground">
                    View your conversations for scheduled sessions.
                </p>
            </div>

            {loading ? (
                <div className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            ) : conversations.length > 0 ? (
                <Card>
                    <CardContent className="p-0">
                        <div className="space-y-1">
                            {conversations.map(convo => (
                                <Link href={`/dashboard/messages/${convo.sessionId}`} key={convo.sessionId}>
                                    <div className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer border-b">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={convo.partnerAvatar} />
                                            <AvatarFallback>{convo.partnerName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 truncate">
                                            <p className="font-semibold">{convo.partnerName}</p>
                                            <p className="text-sm text-muted-foreground truncate">{convo.lastMessage.text}</p>
                                        </div>
                                        <div className="text-xs text-muted-foreground text-right">
                                            <p className="font-medium">{convo.sessionTopic}</p>
                                            {convo.lastMessage.timestamp && (
                                                <p>{formatDistanceToNow(convo.lastMessage.timestamp, { addSuffix: true })}</p>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="text-center py-20 bg-slate-50 rounded-lg">
                    <MessageSquareText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium">No active conversations</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        When a study session is scheduled, your chat with the partner will appear here.
                    </p>
                </div>
            )}
        </div>
    );
}