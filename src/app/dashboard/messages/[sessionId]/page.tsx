"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { format } from 'date-fns';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Send } from "lucide-react";

// Types for this page
interface Message {
    id: string;
    text: string;
    senderId: string;
    createdAt: Date | null;
}

interface SessionInfo {
    partnerName: string;
    partnerAvatar: string;
    topic: string;
}

export default function ChatPage({ params }: { params: { sessionId: string } }) {
    const { sessionId } = params;
    const router = useRouter();

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
    const [currentUser, setCurrentUser] = useState<{ uid: string } | null>(null);
    const [loading, setLoading] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Effect for getting the current user
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, user => {
            setCurrentUser(user ? { uid: user.uid } : null);
            if (!user) router.push("/auth");
        });
        return () => unsubscribeAuth();
    }, [router]);

    // Effect for scrolling to the bottom of the chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Effect for fetching session info and messages
    useEffect(() => {
        if (!currentUser || !sessionId) return;

        // 1. Fetch one-time session info for the header
        const getSessionInfo = async () => {
            const sessionDocRef = doc(db, 'sessions', sessionId);
            const docSnap = await getDoc(sessionDocRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const partnerId = data.initiatorId === currentUser.uid ? data.recipientId : data.initiatorId;
                const partnerInfo = data.participants?.[partnerId] || {};
                setSessionInfo({
                    partnerName: partnerInfo.name || "Study Partner",
                    partnerAvatar: `https://ui-avatars.com/api/?name=${(partnerInfo.name || 'S').replace(' ', '+')}`,
                    topic: data.focusTopic || "General Study"
                });
            }
        };

        getSessionInfo();

        // 2. Set up real-time listener for messages
        const messagesRef = collection(db, 'sessions', sessionId, 'messages');
        const q = query(messagesRef, orderBy("createdAt", "asc"));

        const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
            const fetchedMessages = querySnapshot.docs.map(doc => ({
                id: doc.id,
                text: doc.data().text,
                senderId: doc.data().senderId,
                createdAt: doc.data().createdAt?.toDate() || null
            }));
            setMessages(fetchedMessages);
            setLoading(false);
        });

        return () => unsubscribeMessages();

    }, [currentUser, sessionId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === "" || !currentUser) return;

        const messagesRef = collection(db, 'sessions', sessionId, 'messages');
        const sessionDocRef = doc(db, 'sessions', sessionId);

        try {
            // Add the new message to the subcollection
            await addDoc(messagesRef, {
                text: newMessage,
                senderId: currentUser.uid,
                createdAt: serverTimestamp()
            });

            // Update the lastMessage on the parent session document for the preview list
            await updateDoc(sessionDocRef, {
                lastMessage: {
                    text: newMessage,
                    createdAt: serverTimestamp()
                }
            });

            setNewMessage(""); // Clear the input field
        } catch (error) {
            console.error("Error sending message: ", error);
            // Add toast notification for error
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Header */}
            <div className="flex items-center p-4 border-b bg-card">
                <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/messages')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                {sessionInfo ? (
                    <>
                        <Avatar className="h-10 w-10 ml-4">
                            <AvatarImage src={sessionInfo.partnerAvatar} />
                            <AvatarFallback>{sessionInfo.partnerName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                            <p className="font-semibold">{sessionInfo.partnerName}</p>
                            <p className="text-xs text-muted-foreground">{sessionInfo.topic}</p>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-4 ml-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-3/5" />
                        <Skeleton className="h-12 w-3/5 ml-auto" />
                        <Skeleton className="h-8 w-1/2" />
                    </div>
                ) : messages.length > 0 ? (
                    messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md lg:max-w-2xl p-3 rounded-lg ${msg.senderId === currentUser?.uid
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}>
                                <p className="text-sm">{msg.text}</p>
                                {msg.createdAt && (
                                    <p className={`text-xs mt-1 ${msg.senderId === currentUser?.uid
                                            ? 'text-primary-foreground/70'
                                            : 'text-muted-foreground/70'
                                        }`}>
                                        {format(msg.createdAt, 'HH:mm')}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-muted-foreground pt-16">
                        <p>No messages yet.</p>
                        <p className="text-xs">Start the conversation!</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 border-t bg-card">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        autoComplete="off"
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                        <Send className="h-5 w-5" />
                    </Button>
                </form>
            </div>
        </div>
    );
}