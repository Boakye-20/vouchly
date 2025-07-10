"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { format } from 'date-fns';
import Image from 'next/image';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Send, Paperclip, File, X, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types for this page
interface Message {
    id: string;
    text: string;
    senderId: string;
    createdAt: Date | null;
    attachments?: MessageAttachment[];
    isRead?: boolean;
}

interface MessageAttachment {
    id: string;
    name: string;
    type: 'image' | 'file';
    url: string;
    size?: number;
}

interface SessionInfo {
    partnerName: string;
    partnerAvatar: string;
    topic: string;
}

export default function ChatPage({ params }: { params: { sessionId: string } }) {
    const { sessionId } = params;
    const router = useRouter();
    const { toast } = useToast();

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
    const [currentUser, setCurrentUser] = useState<{ uid: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [attachments, setAttachments] = useState<File[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                createdAt: doc.data().createdAt?.toDate() || null,
                attachments: doc.data().attachments || [],
                isRead: doc.data().isRead || false
            }));
            setMessages(fetchedMessages);
            setLoading(false);

            // Mark messages as read when user views them
            const unreadMessages = fetchedMessages.filter(msg =>
                msg.senderId !== currentUser.uid && !msg.isRead
            );
            if (unreadMessages.length > 0) {
                markMessagesAsRead();
            }
        });

        return () => unsubscribeMessages();

    }, [currentUser, sessionId]);

    const markMessagesAsRead = async () => {
        if (!currentUser) return;

        try {
            await fetch(`/api/messages/${sessionId}/read`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.uid })
            });
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        const validFiles = files.filter(file => {
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                toast({
                    title: "File too large",
                    description: `${file.name} is larger than 10MB`,
                    variant: "destructive"
                });
                return false;
            }
            return true;
        });
        setAttachments(prev => [...prev, ...validFiles]);
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((newMessage.trim() === "" && attachments.length === 0) || !currentUser) return;

        const messagesRef = collection(db, 'sessions', sessionId, 'messages');
        const sessionDocRef = doc(db, 'sessions', sessionId);

        setUploading(true);

        try {
            // Upload attachments if any
            const uploadedAttachments: MessageAttachment[] = [];

            for (const file of attachments) {
                // For now, we'll simulate file upload
                // In production, you'd upload to Firebase Storage
                const attachment: MessageAttachment = {
                    id: Date.now().toString(),
                    name: file.name,
                    type: file.type.startsWith('image/') ? 'image' : 'file',
                    url: URL.createObjectURL(file), // Temporary URL for demo
                    size: file.size
                };
                uploadedAttachments.push(attachment);
            }

            // Add the new message to the subcollection
            await addDoc(messagesRef, {
                text: newMessage,
                senderId: currentUser.uid,
                createdAt: serverTimestamp(),
                attachments: uploadedAttachments,
                isRead: false
            });

            // Update the lastMessage on the parent session document for the preview list
            await updateDoc(sessionDocRef, {
                lastMessage: {
                    text: newMessage || `Sent ${attachments.length} attachment${attachments.length > 1 ? 's' : ''}`,
                    createdAt: serverTimestamp()
                }
            });

            setNewMessage(""); // Clear the input field
            setAttachments([]); // Clear attachments
        } catch (error) {
            console.error("Error sending message: ", error);
            toast({
                title: "Error",
                description: "Failed to send message",
                variant: "destructive"
            });
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

                                {/* Attachments */}
                                {msg.attachments && msg.attachments.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                        {msg.attachments.map((attachment) => (
                                            <div key={attachment.id} className="flex items-center gap-2 p-2 bg-black/10 rounded">
                                                {attachment.type === 'image' ? (
                                                    <Image src={attachment.url} alt={attachment.name} width={32} height={32} className="h-4 w-4" loading="lazy" />
                                                ) : (
                                                    <File className="h-4 w-4" />
                                                )}
                                                <span className="text-xs flex-1 truncate">{attachment.name}</span>
                                                {attachment.size && (
                                                    <span className="text-xs opacity-70">{formatFileSize(attachment.size)}</span>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                    onClick={() => window.open(attachment.url, '_blank')}
                                                >
                                                    <Download className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {msg.createdAt && (
                                    <p className={`text-xs mt-1 ${msg.senderId === currentUser?.uid
                                        ? 'text-primary-foreground/70'
                                        : 'text-muted-foreground/70'
                                        }`}>
                                        {format(msg.createdAt, 'HH:mm')}
                                        {msg.senderId !== currentUser?.uid && !msg.isRead && (
                                            <span className="ml-2">• Unread</span>
                                        )}
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

            {/* Attachments Preview */}
            {attachments.length > 0 && (
                <div className="p-4 border-t bg-muted/30">
                    <div className="flex flex-wrap gap-2">
                        {attachments.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-background rounded border">
                                {file.type.startsWith('image/') ? (
                                    <Image src={URL.createObjectURL(file)} alt={file.name} width={32} height={32} className="h-4 w-4" loading="lazy" />
                                ) : (
                                    <File className="h-4 w-4" />
                                )}
                                <span className="text-xs truncate max-w-32">{file.name}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => removeAttachment(index)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Form */}
            <div className="p-4 border-t bg-card">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        autoComplete="off"
                        disabled={uploading}
                    />

                    {/* File Upload Button */}
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        <Paperclip className="h-5 w-5" />
                    </Button>

                    <Button type="submit" size="icon" disabled={(!newMessage.trim() && attachments.length === 0) || uploading}>
                        {uploading ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </Button>
                </form>

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>
        </div>
    );
}