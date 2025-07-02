// src/app/dashboard/sessions/page.tsx
"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, Timestamp, doc, getDoc, DocumentSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Clock, Calendar, Hash, MessageSquare, Video, AlertTriangle, Lock, Eye } from "lucide-react";
import { PartnerProfileModal } from "@/components/partners/partner-profile-modal";
import { RescheduleModal } from "@/components/sessions/reschedule-modal";
import { adjustVouchScoreAction } from "@/lib/actions";

// --- TYPES ---
interface Session {
    id: string;
    initiatorId: string;
    recipientId: string;
    participantIds: string[];
    partnerInfo: {
        id: string;
        name: string;
        course: string;
        university: string;
    };
    scheduledStartTime: Date;
    durationMinutes: number;
    focusTopic: string;
    initialMessage?: string;
    status: 'requested' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    videoRoomUrl?: string;
    videoJoinEnabledAt: Date;
    startConfirmedBy?: string[];
    completionConfirmedBy?: { [key: string]: boolean };
}

interface User {
    uid: string;
    displayName?: string;
    email?: string;
}

// --- SESSION CARD COMPONENT ---
function SessionCard({ session, currentUser, currentUserName }: { 
    session: Session; 
    currentUser: User; 
    currentUserName: string;
}) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [partnerFullData, setPartnerFullData] = useState<any>(null);
    const [loadingProfile, setLoadingProfile] = useState(false);

    const isRecipient = session.recipientId === currentUser.uid;
    const partner = session.partnerInfo;
    const now = new Date();
    const scheduledStartTime = session.scheduledStartTime instanceof Date ? session.scheduledStartTime : new Date(session.scheduledStartTime);
    const timeDiffHours = (scheduledStartTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    const isLockedIn = timeDiffHours < 4;
    const canJoinVideo = (session.status === 'scheduled' || session.status === 'in_progress') &&
        session.videoJoinEnabledAt instanceof Date ? session.videoJoinEnabledAt < now : false;

    // Determine appropriate actions based on time and status
    const isPastSession = scheduledStartTime <= now;
    const isStartWindow = !isPastSession && timeDiffHours <= 0.25; // 15 minutes window
    const isCompletionWindow = session.status === 'in_progress' && 
        (scheduledStartTime.getTime() + (session.durationMinutes * 60 * 1000) - 10 * 60 * 1000 <= now.getTime() &&
         scheduledStartTime.getTime() + (session.durationMinutes * 60 * 1000) + 5 * 60 * 1000 >= now.getTime());

    const handleViewProfile = async () => {
        if (!partner?.id) {
            toast({ title: "Error", description: "Partner information is missing", variant: "destructive" });
            return;
        }

        setLoadingProfile(true);
        try {
            const userDoc = await getDoc(doc(db, 'users', partner.id));
            if (userDoc.exists()) {
                setPartnerFullData({ id: partner.id, ...userDoc.data() });
                setShowProfileModal(true);
            } else {
                toast({ title: "Error", description: "Could not load partner profile", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to load profile", variant: "destructive" });
        } finally {
            setLoadingProfile(false);
        }
    };

    const [showTimeConfirm, setShowTimeConfirm] = useState(false);
    const [pendingAction, setPendingAction] = useState<string | null>(null);
    const [userTimezone, setUserTimezone] = useState<string | null>(null);
    const [partnerTimezone, setPartnerTimezone] = useState<string | null>(null);

    const handleAction = async (actionType: string) => {
        if (actionType === 'reschedule') {
            setShowRescheduleModal(true);
            return;
        }
        // If recipient is accepting, show time confirmation modal
        if (actionType === 'accept' && isRecipient) {
            setIsSubmitting(true);
            try {
                // Fetch user and partner timezones
                const { getUserTimezone } = await import('@/lib/timezone');
                const { getPartnerTimezone } = await import('@/lib/services/session-utils');
                const tz = await getUserTimezone(currentUser.uid);
                const ptz = await getPartnerTimezone(partner.id);
                setUserTimezone(tz || Intl.DateTimeFormat().resolvedOptions().timeZone);
                setPartnerTimezone(ptz || 'Europe/London');
                setPendingAction('accept');
                setShowTimeConfirm(true);
            } catch (error) {
                toast({ title: 'Error', description: 'Could not load timezones', variant: 'destructive' });
                setIsSubmitting(false);
            }
            return;
        }
        setIsSubmitting(true);

        try {
            const eventTypeMap: { [key: string]: any } = {
                accept: 'REQUEST_ACCEPTED',
                decline: 'REQUEST_DECLINED',
                start: 'START_CONFIRMED',
                complete_yes: 'COMPLETION_CONFIRMED',
                complete_no: 'COMPLETION_REPORTED_ISSUE',
                cancel: isLockedIn ? 'CANCELLED_LOCKED_IN' : 'CANCELLED_WITH_NOTICE',
            };

            const eventType = eventTypeMap[actionType];

            if (!eventType) {
                toast({ title: "Unknown Action", variant: "destructive" });
                return;
            }

            // Call the server action
            const res = await adjustVouchScoreAction({
                userId: currentUser.uid,
                sessionId: session.id,
                eventType: eventType
            });

            if (res?.success) {
                toast({ title: "Success!", description: res.data?.message || "Action completed." });
                
                // The onSnapshot listener in the parent component will automatically update the UI
                // No need to manually fetch the session data
            } else {
                toast({ title: "Error", description: res?.error || "An unexpected error occurred.", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Action Failed", description: "Please try again.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!partner) return null;

    const isOutgoingRequest = session.status === 'requested' && session.initiatorId === currentUser.uid;

    // --- Render session time confirmation modal if needed ---
    const SessionTimeConfirmationModal = showTimeConfirm && userTimezone && partnerTimezone ?
        require('@/components/sessions/SessionTimeConfirmationModal').default : null;

    return (
        <>
            {showTimeConfirm && SessionTimeConfirmationModal && (
                <SessionTimeConfirmationModal
                    scheduledStartTime={scheduledStartTime}
                    durationMinutes={session.durationMinutes}
                    userTimezone={userTimezone}
                    partnerTimezone={partnerTimezone}
                    partnerName={partner.name}
                    onCancel={() => { setShowTimeConfirm(false); setIsSubmitting(false); setPendingAction(null); }}
                    onConfirm={async () => {
                        setShowTimeConfirm(false);
                        setIsSubmitting(true);
                        setPendingAction(null);
                        // Actually accept session now
                        try {
                            const eventType = 'REQUEST_ACCEPTED';
                            const res = await adjustVouchScoreAction({
                                userId: currentUser.uid,
                                sessionId: session.id,
                                eventType: eventType
                            });
                            if (res?.success) {
                                toast({ title: "Success!", description: res.data?.message || "Action completed." });
                            } else {
                                toast({ title: "Error", description: res?.error || "An unexpected error occurred.", variant: "destructive" });
                            }
                        } catch (error) {
                            toast({ title: "Action Failed", description: "Please try again.", variant: "destructive" });
                        } finally {
                            setIsSubmitting(false);
                        }
                    }}
                />
            )}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={`https://ui-avatars.com/api/?name=${partner.name.replace(' ', '+')}&background=random`} />
                                <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="font-headline text-lg">
                                    {session.status === 'requested' && isRecipient ? `Request from ${partner.name}` : `Session with ${partner.name}`}
                                </CardTitle>
                                <CardDescription>{partner.course} • {partner.university}</CardDescription>
                            </div>
                        </div>
                        {session.status === 'requested' && isRecipient && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleViewProfile}
                                disabled={loadingProfile}
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                {loadingProfile ? 'Loading...' : 'View Profile'}
                            </Button>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center"><Calendar className="w-4 h-4 mr-2" />{format(session.scheduledStartTime, 'd MMM yyyy, HH:mm')}</div>
                    <div className="flex items-center"><Clock className="w-4 h-4 mr-2" />{session.durationMinutes} minutes</div>
                    <div className="flex items-center"><Hash className="w-4 h-4 mr-2" /> Focus: {session.focusTopic}</div>
                    {session.initialMessage && <div className="flex items-start"><MessageSquare className="w-4 h-4 mr-2 mt-1" /> <p className="italic">"{session.initialMessage}"</p></div>}

                    {(session.status === 'scheduled' || session.status === 'in_progress') && session.videoRoomUrl && (
                        <div className="pt-2">
                            {canJoinVideo ? (
                                <Button
                                    onClick={() => window.open(session.videoRoomUrl, '_blank')}
                                    className="w-full bg-green-600 text-white hover:bg-green-700"
                                    disabled={isSubmitting}
                                >
                                    <Video className="w-4 h-4 mr-2" />
                                    {session.status === 'in_progress' ? 'Re-join Video Call' : 'Join Video Call'}
                                </Button>
                            ) : (
                                <>
                                    <Button disabled className="w-full cursor-not-allowed">
                                        <Video className="w-4 h-4 mr-2" />
                                        Video opens 5 mins before start
                                    </Button>
                                    <p className="text-xs text-muted-foreground text-center mt-1">
                                        Video access available at {format(session.videoJoinEnabledAt, 'HH:mm')}
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                </CardContent>

                <CardFooter className={`flex justify-end gap-2 ${session.status === 'in_progress' ? 'flex-wrap bg-slate-50 p-4 border-t' : ''}`}>
                    {session.status === 'requested' && isRecipient && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAction('decline')}
                                disabled={isSubmitting}
                            >
                                <X className="w-4 h-4 mr-2" />Decline
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => handleAction('accept')}
                                disabled={isSubmitting}
                            >
                                <Check className="w-4 h-4 mr-2" />Accept
                            </Button>
                        </>
                    )}

                    {/* Outgoing request cancel button */}
                    {isOutgoingRequest && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleAction('cancel')}
                            disabled={isSubmitting}
                        >
                            <X className="w-4 h-4 mr-2" />Cancel Request
                        </Button>
                    )}

                    {session.status === 'scheduled' && (
                        <>
                            {/* Reschedule button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAction('reschedule')}
                                disabled={isLockedIn || isSubmitting}
                                title={isLockedIn ? "Cannot reschedule within 4 hours of start time" : "Request to reschedule this session"}
                            >
                                {isLockedIn ? <Lock className="w-4 h-4 mr-2" /> : <Calendar className="w-4 h-4 mr-2" />}
                                {isLockedIn ? 'Reschedule Locked' : 'Reschedule'}
                            </Button>

                            {/* Cancel button */}
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleAction('cancel')}
                                disabled={isSubmitting}
                            >
                                <X className="w-4 h-4 mr-2" />
                                {isLockedIn ? 'Cancel (No-Show)' : 'Cancel Session'}
                            </Button>

                            {/* Start button with proper window check */}
                            <Button
                                size="sm"
                                onClick={() => handleAction('start')}
                                disabled={
                                    isSubmitting || 
                                    !canJoinVideo ||
                                    !isStartWindow
                                }
                            >
                                {isStartWindow ? (
                                    <>
                                        <Clock className="w-4 h-4 mr-2" />Start Session in Vouchly
                                    </>
                                ) : (
                                    <>
                                        <Clock className="w-4 h-4 mr-2" />Start Session Available in {Math.ceil(timeDiffHours)}h
                                    </>
                                )}
                            </Button>
                        </>
                    )}

                    {session.status === 'in_progress' && (
                        <>
                            {isCompletionWindow ? (
                                <>
                                    <p className="text-sm text-muted-foreground mr-auto font-medium">Did the session go well?</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAction('complete_no')}
                                        disabled={isSubmitting}
                                    >
                                        <AlertTriangle className="w-4 h-4 mr-2" />Report Issue
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => handleAction('complete_yes')}
                                        disabled={isSubmitting}
                                    >
                                        <Check className="w-4 h-4 mr-2" />Confirm Completion
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button disabled className="w-full cursor-not-allowed">
                                        <Clock className="w-4 h-4 mr-2" />Completion Window Opens in {Math.ceil((scheduledStartTime.getTime() + (session.durationMinutes * 60 * 1000) - now.getTime()) / (1000 * 60))}m
                                    </Button>
                                </>
                            )}
                        </>
                    )}

                    {session.status === 'in_progress' && (
                        <>
                            <p className="text-sm text-muted-foreground mr-auto font-medium">Did the session go well?</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAction('complete_no')}
                                disabled={isSubmitting}
                            >
                                <AlertTriangle className="w-4 h-4 mr-2" />Report Issue
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => handleAction('complete_yes')}
                                disabled={isSubmitting}
                            >
                                <Check className="w-4 h-4 mr-2" />Confirm Completion
                            </Button>
                        </>
                    )}
                </CardFooter>
            </Card>

            {showProfileModal && partnerFullData && (
                <PartnerProfileModal
                    partner={partnerFullData}
                    currentUser={currentUser}
                    onClose={() => setShowProfileModal(false)}
                    onSendRequest={() => { }}
                />
            )}

            {showRescheduleModal && (
                <RescheduleModal
                    isOpen={showRescheduleModal}
                    onClose={() => setShowRescheduleModal(false)}
                    session={session}
                    currentUser={{ uid: currentUser.uid, name: currentUserName }}
                />
            )}
        </>
    );
}

// --- MAIN SESSIONS PAGE COMPONENT ---
export default function SessionsPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentUserName, setCurrentUserName] = useState<string>("");

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser({ uid: user.uid, displayName: user.displayName || "", email: user.email || "" });

                // Fetch user's name from Firestore
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setCurrentUserName(userData.name || user.displayName || "User");
                    } else {
                        setCurrentUserName(user.displayName || "User");
                    }
                } catch (error) {
                    console.error("Error fetching user name:", error);
                    setCurrentUserName(user.displayName || "User");
                }
            } else {
                setCurrentUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        const sessionsRef = collection(db, 'sessions');
        console.debug('[VOUCH DEBUG] Setting up sessions snapshot listener for user:', currentUser.uid);
        if (!currentUser.uid) {
            console.error('[VOUCH DEBUG] User is not authenticated. Aborting snapshot listener.');
            return;
        }

        const q = query(sessionsRef, where('participantIds', 'array-contains', currentUser.uid));
        console.debug('[VOUCH DEBUG] Firestore query:', q);

        const unsubscribe = onSnapshot(q,
            (querySnapshot) => {
                const fetchedSessions = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    const scheduledStartTime = (data.scheduledStartTime as Timestamp)?.toDate();
                    const videoJoinEnabledAt = (data.videoJoinEnabledAt as Timestamp)?.toDate();
                    const partnerId = data.initiatorId === currentUser.uid ? data.recipientId : data.initiatorId;

                    const partnerInfo = {
                        id: partnerId,
                        name: data.participants?.[partnerId]?.name || "Unknown Partner",
                        course: data.participants?.[partnerId]?.course || "N/A",
                        university: data.participants?.[partnerId]?.university || "N/A"
                    };

                    return {
                        id: doc.id,
                        ...data,
                        scheduledStartTime,
                        videoJoinEnabledAt,
                        partnerInfo
                    } as Session;
                });

                setSessions(fetchedSessions.sort((a, b) => b.scheduledStartTime.getTime() - a.scheduledStartTime.getTime()));
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching sessions:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [currentUser]);

    if (!currentUser) {
        return <div className="text-center py-16"><p>Please log in to see your sessions.</p></div>
    }

    // Get current time
    const now = new Date();

    // Filter sessions into appropriate categories
    const incoming = sessions.filter(s => s.status === 'requested' && s.recipientId === currentUser.uid);
    const outgoing = sessions.filter(s => s.status === 'requested' && s.initiatorId === currentUser.uid);
    
    // Scheduled sessions should be in the future
    const scheduled = sessions.filter(s => 
        ['scheduled', 'in_progress'].includes(s.status) && 
        s.scheduledStartTime > now
    );

    // Past sessions include completed, cancelled, and sessions that have passed their start time
    const past = sessions.filter(s => 
        ['completed', 'cancelled'].includes(s.status) || 
        (s.scheduledStartTime <= now && !['requested', 'in_progress'].includes(s.status))
    );

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-headline font-bold">My Sessions</h1>
                <p className="text-muted-foreground">Manage your study requests and scheduled sessions.</p>
            </div>

            <Tabs defaultValue="incoming">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="incoming">
                        Incoming Requests {incoming.length > 0 && <Badge className="ml-2">{incoming.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="outgoing">
                        Outgoing Requests {outgoing.length > 0 && <Badge className="ml-2">{outgoing.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="scheduled">
                        Scheduled {scheduled.length > 0 && <Badge className="ml-2">{scheduled.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                </TabsList>

                {loading ? (
                    <div className="space-y-4 pt-4">
                        <Skeleton className="h-[250px] w-full" />
                        <Skeleton className="h-[250px] w-full" />
                    </div>
                ) : (
                    <>
                        <TabsContent value="incoming">
                            {incoming.length > 0 ? (
                                <div className="space-y-4 pt-4">
                                    {incoming.map(s => (
                                    <SessionCard 
                                        key={s.id} 
                                        session={s} 
                                        currentUser={currentUser} 
                                        currentUserName={currentUserName}
                                    />
                                ))}
                                </div>
                            ) : (
                                <div className="text-center py-16"><p>No incoming requests.</p></div>
                            )}
                        </TabsContent>

                        <TabsContent value="outgoing">
                            {outgoing.length > 0 ? (
                                <div className="space-y-4 pt-4">
                                    {outgoing.map(s => (
                                    <SessionCard 
                                        key={s.id} 
                                        session={s} 
                                        currentUser={currentUser} 
                                        currentUserName={currentUserName}
                                    />
                                ))}
                                </div>
                            ) : (
                                <div className="text-center py-16"><p>No outgoing requests.</p></div>
                            )}
                        </TabsContent>

                        <TabsContent value="scheduled">
                            {scheduled.length > 0 ? (
                                <div className="space-y-4 pt-4">
                                    {scheduled.map(s => (
                                    <SessionCard 
                                        key={s.id} 
                                        session={s} 
                                        currentUser={currentUser} 
                                        currentUserName={currentUserName}
                                    />
                                ))}
                                </div>
                            ) : (
                                <div className="text-center py-16"><p>No scheduled sessions. Go find a partner!</p></div>
                            )}
                        </TabsContent>

                        <TabsContent value="past">
                            {past.length > 0 ? (
                                <div className="space-y-4 pt-4">
                                    {past.map(s => (
                                    <SessionCard 
                                        key={s.id} 
                                        session={s} 
                                        currentUser={currentUser} 
                                        currentUserName={currentUserName}
                                    />
                                ))}
                                </div>
                            ) : (
                                <div className="text-center py-16"><p>No past sessions yet.</p></div>
                            )}
                        </TabsContent>
                    </>
                )}
            </Tabs>
        </div>
    );
}