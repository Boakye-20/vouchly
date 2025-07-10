"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, Timestamp, orderBy, limit, startAfter, getDocs, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { format, formatDistanceToNow } from 'date-fns';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MessageSquareText, Paperclip, Image, File } from "lucide-react";

// You can move this to a central lib/types.ts file
interface Conversation {
    sessionId: string;
    partnerName: string;
    partnerAvatar: string;
    sessionTopic: string;
    lastMessage: {
        text: string;
        timestamp: Date | null;
        hasAttachments?: boolean;
        attachmentCount?: number;
    };
    unreadCount?: number;
}

export default function MessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<{ uid: string } | null>(null);
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [hasMore, setHasMore] = useState(true);

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

        // Initial fetch
        const fetchConversations = async () => {
            setLoading(true);
            try {
                const q = query(
                    collection(db, 'sessions'),
                    where('participantIds', 'array-contains', currentUser.uid),
                    where('status', 'in', ['scheduled', 'in_progress']),
                    orderBy('lastMessageTime', 'desc'),
                    limit(20)
                );
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const partnerId = data.initiatorId === currentUser.uid ? data.recipientId : data.initiatorId;
                    const partnerInfo = data.participants?.[partnerId] || {};
                    const lastMessageTimestamp = (data.lastMessage?.createdAt as Timestamp)?.toDate() || null;
                    const lastMessage = data.lastMessage || {};
                    const hasAttachments = lastMessage.attachments && lastMessage.attachments.length > 0;
                    const attachmentCount = hasAttachments ? lastMessage.attachments.length : 0;
                    return {
                        sessionId: doc.id,
                        partnerName: partnerInfo.name || "Study Partner",
                        partnerAvatar: `https://ui-avatars.com/api/?name=${(partnerInfo.name || 'S').replace(' ', '+')}`,
                        sessionTopic: data.focusTopic || 'General Study',
                        lastMessage: {
                            text: lastMessage.text || "No messages yet.",
                            timestamp: lastMessageTimestamp,
                            hasAttachments,
                            attachmentCount
                        },
                        unreadCount: data.unreadCount?.[currentUser.uid] || 0
                    };
                });
                setConversations(data);
                setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
                setHasMore(snapshot.docs.length === 20);
            } catch (error) {
                console.error('Error fetching conversations:', error);
                setConversations([]);
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, [currentUser]);

    // Load more conversations
    const loadMoreConversations = async () => {
        if (!currentUser || !lastDoc) return;
        setLoading(true);
        try {
            const q = query(
                collection(db, 'sessions'),
                where('participantIds', 'array-contains', currentUser.uid),
                where('status', 'in', ['scheduled', 'in_progress']),
                orderBy('lastMessageTime', 'desc'),
                startAfter(lastDoc),
                limit(20)
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => {
                const data = doc.data();
                const partnerId = data.initiatorId === currentUser.uid ? data.recipientId : data.initiatorId;
                const partnerInfo = data.participants?.[partnerId] || {};
                const lastMessageTimestamp = (data.lastMessage?.createdAt as Timestamp)?.toDate() || null;
                const lastMessage = data.lastMessage || {};
                const hasAttachments = lastMessage.attachments && lastMessage.attachments.length > 0;
                const attachmentCount = hasAttachments ? lastMessage.attachments.length : 0;
                return {
                    sessionId: doc.id,
                    partnerName: partnerInfo.name || "Study Partner",
                    partnerAvatar: `https://ui-avatars.com/api/?name=${(partnerInfo.name || 'S').replace(' ', '+')}`,
                    sessionTopic: data.focusTopic || 'General Study',
                    lastMessage: {
                        text: lastMessage.text || "No messages yet.",
                        timestamp: lastMessageTimestamp,
                        hasAttachments,
                        attachmentCount
                    },
                    unreadCount: data.unreadCount?.[currentUser.uid] || 0
                };
            });
            setConversations(prev => [...prev, ...data]);
            setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
            setHasMore(snapshot.docs.length === 20);
        } catch (error) {
            console.error('Error loading more conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const getMessagePreview = (conversation: Conversation) => {
        if (conversation.lastMessage.hasAttachments) {
            const attachmentText = conversation.lastMessage.attachmentCount === 1
                ? "1 attachment"
                : `${conversation.lastMessage.attachmentCount} attachments`;
            return conversation.lastMessage.text
                ? `${conversation.lastMessage.text} • ${attachmentText}`
                : attachmentText;
        }
        return conversation.lastMessage.text;
    };

    return (
        <div className="space-y-8 p-6">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900 inline-block border-b-4 border-blue-600 pb-2">Messages</h1>
                <p className="text-xl text-slate-500 mt-4">View your conversations for scheduled sessions.</p>
            </div>

            {loading ? (
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 h-20 animate-pulse"></div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 h-20 animate-pulse"></div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 h-20 animate-pulse"></div>
                </div>
            ) : conversations.length > 0 ? (
                <div className="bg-blue-50 rounded-lg border border-blue-100">
                    <div className="space-y-1">
                        {conversations.map(convo => (
                            <Link href={`/dashboard/messages/${convo.sessionId}`} key={convo.sessionId}>
                                <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-200 relative">
                                    <div className="relative">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={convo.partnerAvatar} />
                                            <AvatarFallback>{convo.partnerName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        {(convo.unreadCount || 0) > 0 && (
                                            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-xs text-white">
                                                {(convo.unreadCount || 0) > 9 ? '9+' : (convo.unreadCount || 0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 truncate">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-900">{convo.partnerName}</p>
                                            {convo.lastMessage.hasAttachments && (
                                                <Paperclip className="h-3 w-3 text-gray-400" />
                                            )}
                                        </div>
                                        <p className={`text-sm truncate ${(convo.unreadCount || 0) > 0 ? 'font-medium text-gray-900' : 'text-slate-500'}`}>
                                            {getMessagePreview(convo)}
                                        </p>
                                    </div>
                                    <div className="text-xs text-slate-500 text-right">
                                        <p className="font-medium text-gray-700">{convo.sessionTopic}</p>
                                        {convo.lastMessage.timestamp && (
                                            <p>{formatDistanceToNow(convo.lastMessage.timestamp, { addSuffix: true })}</p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations found</h3>
                    <p className="text-slate-500">Try starting a session to begin chatting with a partner.</p>
                </div>
            )}
            {hasMore && !loading && (
                <button onClick={loadMoreConversations} className="mt-4 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-base font-medium transition-colors">Load More</button>
            )}
            {loading && <div className="mt-4 text-center text-gray-600">Loading...</div>}
        </div>
    );
}