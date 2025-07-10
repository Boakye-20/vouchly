// src/app/dashboard/sessions/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, Timestamp, doc, getDoc, DocumentSnapshot, orderBy, limit, startAfter, getDocs, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast, handleFirestoreError } from "@/hooks/use-toast";
import { Check, X, Clock, Calendar, Hash, MessageSquare, Video, AlertTriangle, Lock, Eye } from "lucide-react";
import { PartnerProfileModal } from "@/components/partners/partner-profile-modal";
import { RescheduleModal } from "@/components/sessions/reschedule-modal";
import { adjustVouchScoreAction } from "@/lib/actions";
import { UndoNotification } from '@/components/undo/UndoNotification';
import JitsiMeeting from 'react-jitsi';

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
    status: 'requested' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'pending_cancellation';
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
function SessionCard({ session, currentUser, currentUserName, onCancel }: {
    session: Session;
    currentUser: User;
    currentUserName: string;
    onCancel: (undoId: string) => void; // pass undoId not sessionId
}) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [partnerFullData, setPartnerFullData] = useState<any>(null);
    const [undoId, setUndoId] = useState<string | null>(null);
    const [showUndo, setShowUndo] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    const [sessionTimer, setSessionTimer] = useState(0);
    const [partnerJoined, setPartnerJoined] = useState(false);
    const [attendance, setAttendance] = useState<{ [userId: string]: { joined: Date[]; left: Date[] } }>({});
    const [showSummary, setShowSummary] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Undo handler
    const handleUndo = async (id: string) => {
        try {
            const response = await fetch('/api/undo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ undoId: id }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to undo');
            setShowUndo(false);
            setUndoId(null);
            toast({ title: 'Undo Successful', description: 'Session cancellation has been undone.' });
        } catch (error: any) {
            toast({ title: 'Undo Failed', description: error.message || 'Could not undo cancellation', variant: 'destructive' });
        }
    };

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
                // Only show toast if NOT a cancellation
                if (!['CANCELLED_WITH_NOTICE', 'CANCELLED_LOCKED_IN', 'REQUEST_ACCEPTED'].includes(eventType)) {
                    toast({ title: "Success!", description: res.data?.message || "Action completed." });
                }
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

    // Handler to start the embedded video call
    const handleStartVideo = () => {
        setShowVideo(true);
        setSessionTimer(0);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => setSessionTimer(t => t + 1), 1000);
    };

    // Handler for Jitsi events
    const handleJitsiApi = (JitsiMeetExternalAPI: any) => {
        JitsiMeetExternalAPI.addEventListener('participantJoined', (event: any) => {
            if (event.displayName !== currentUserName) setPartnerJoined(true);
            // Track attendance
            const userId = event.id || event.participantId || event.displayName;
            setAttendance(prev => ({
                ...prev,
                [userId]: {
                    joined: [...(prev[userId]?.joined || []), new Date()],
                    left: prev[userId]?.left || []
                }
            }));
            // Send to backend
            fetch(`/api/sessions/${session.id}/attendance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event: 'join', userId, timestamp: new Date().toISOString() })
            });
        });
        JitsiMeetExternalAPI.addEventListener('participantLeft', (event: any) => {
            if (event.displayName !== currentUserName) setPartnerJoined(false);
            // Track attendance
            const userId = event.id || event.participantId || event.displayName;
            setAttendance(prev => ({
                ...prev,
                [userId]: {
                    joined: prev[userId]?.joined || [],
                    left: [...(prev[userId]?.left || []), new Date()]
                }
            }));
            // Send to backend
            fetch(`/api/sessions/${session.id}/attendance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event: 'leave', userId, timestamp: new Date().toISOString() })
            });
        });
        JitsiMeetExternalAPI.addEventListener('readyToClose', () => {
            setShowVideo(false);
            setShowSummary(true);
            if (timerRef.current) clearInterval(timerRef.current);
        });
    };

    // Handler to close video and show summary
    const handleCloseVideo = () => {
        setShowVideo(false);
        setShowSummary(true);
        if (timerRef.current) clearInterval(timerRef.current);
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
                            if (!res?.success) {
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
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <Avatar>
                            <AvatarImage src={`https://ui-avatars.com/api/?name=${partner.name.replace(' ', '+')}&background=random`} />
                            <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">
                                {session.status === 'requested' && isRecipient ? `Request from ${partner.name}` : `Session with ${partner.name}`}
                            </h3>
                            <p className="text-gray-600">{partner.course} • {partner.university}</p>
                        </div>
                    </div>
                    {session.status === 'requested' && isRecipient && (
                        <button
                            className="text-gray-600 hover:text-gray-900 text-base transition-colors"
                            onClick={handleViewProfile}
                            disabled={loadingProfile}
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            {loadingProfile ? 'Loading...' : 'View Profile'}
                        </button>
                    )}
                </div>

                <div className="space-y-3 text-sm mb-6">
                    <div className="flex items-center text-gray-700"><Calendar className="w-4 h-4 mr-2" />{format(session.scheduledStartTime, 'd MMM yyyy, HH:mm')}</div>
                    <div className="flex items-center text-gray-700"><Clock className="w-4 h-4 mr-2" />{session.durationMinutes} minutes</div>
                    <div className="flex items-center text-gray-700"><Hash className="w-4 h-4 mr-2" /> Focus: {session.focusTopic}</div>
                    {session.initialMessage && <div className="flex items-start text-gray-700"><MessageSquare className="w-4 h-4 mr-2 mt-1" /> <p className="italic">"{session.initialMessage}"</p></div>}

                    {(session.status === 'scheduled' || session.status === 'in_progress') && session.videoRoomUrl && (
                        <div className="pt-2">
                            {showVideo ? (
                                <div className="relative w-full h-[500px] bg-black rounded-lg overflow-hidden">
                                    {/* Session Timer Overlay */}
                                    <div className="absolute top-2 left-2 z-10 bg-gray-900 text-white px-3 py-1 rounded shadow text-sm font-semibold">
                                        Time: {Math.floor(sessionTimer / 60)}:{(sessionTimer % 60).toString().padStart(2, '0')}
                                    </div>
                                    {/* Partner Status Overlay */}
                                    <div className="absolute top-2 right-2 z-10 bg-white/80 text-gray-900 px-3 py-1 rounded shadow text-sm font-semibold">
                                        {partnerJoined ? 'Both Present' : 'Waiting for partner...'}
                                    </div>
                                    {/* Embedded Jitsi Meeting */}
                                    <JitsiMeeting
                                        roomName={session.videoRoomUrl.split('/').pop()}
                                        displayName={currentUserName}
                                        config={{
                                            startWithAudioMuted: false,
                                            startWithVideoMuted: false,
                                            enableWelcomePage: false,
                                        }}
                                        interfaceConfig={{
                                            SHOW_JITSI_WATERMARK: false,
                                            SHOW_WATERMARK_FOR_GUESTS: false,
                                            SHOW_BRAND_WATERMARK: true,
                                            BRAND_WATERMARK_LINK: '',
                                            APP_NAME: 'Vouchly',
                                            NATIVE_APP_NAME: 'Vouchly',
                                            PROVIDER_NAME: 'Vouchly',
                                            TOOLBAR_ALWAYS_VISIBLE: true,
                                            TOOLBAR_BUTTONS: [
                                                'microphone', 'camera', 'chat', 'raisehand', 'tileview', 'fullscreen', 'hangup'
                                            ],
                                            FILM_STRIP_MAX_HEIGHT: 120,
                                            filmStripOnly: false,
                                            SHOW_CHROME_EXTENSION_BANNER: false,
                                            SHOW_POWERED_BY: false,
                                            SHOW_PROMOTIONAL_CLOSE_PAGE: false,
                                        }}
                                        onAPILoad={handleJitsiApi}
                                    />
                                    {/* Custom Waiting Room Overlay */}
                                    {!partnerJoined && (
                                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20">
                                            <div className="text-white text-xl font-bold mb-2">Waiting for partner to join...</div>
                                            <div className="text-white text-sm">You can adjust your camera or mic while you wait.</div>
                                        </div>
                                    )}
                                    {/* Close Video Button */}
                                    <button onClick={handleCloseVideo} className="absolute bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded shadow">End Session</button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleStartVideo}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-base font-medium transition-colors"
                                    disabled={isSubmitting}
                                >
                                    <Video className="w-4 h-4 mr-2" />
                                    {session.status === 'in_progress' ? 'Re-join Video Call' : 'Join Video Call'}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className={`flex justify-end gap-2 ${session.status === 'in_progress' ? 'flex-wrap bg-gray-50 p-4 border-t border-gray-200' : ''}`}>
                    {session.status === 'requested' && isRecipient && (
                        <>
                            <button
                                className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-base font-medium hover:bg-gray-50 transition-colors"
                                onClick={() => handleAction('decline')}
                                disabled={isSubmitting}
                            >
                                <X className="w-4 h-4 mr-2" />Decline
                            </button>
                            <button
                                className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-base font-medium transition-colors"
                                onClick={() => handleAction('accept')}
                                disabled={isSubmitting}
                            >
                                <Check className="w-4 h-4 mr-2" />Accept
                            </button>
                        </>
                    )}

                    {/* Outgoing request cancel button */}
                    {isOutgoingRequest && (
                        <button
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-base font-medium transition-colors"
                            onClick={async () => {
                                setIsSubmitting(true);
                                try {
                                    const res = await adjustVouchScoreAction({
                                        userId: currentUser.uid,
                                        sessionId: session.id,
                                        eventType: 'CANCELLED_WITH_NOTICE',
                                    });
                                    if (res?.success) {
                                        const undoId = res.data?.undoId;
                                        if (undoId) {
                                            onCancel(undoId);
                                            // toast removed: handled by UndoNotification at top level
                                        } else {
                                            toast({ title: 'Session Cancelled', description: res.data?.message || 'Session has been cancelled.' });
                                        }
                                    } else {
                                        toast({ title: 'Error', description: res?.error || 'An unexpected error occurred.', variant: 'destructive' });
                                    }
                                } catch (error: any) {
                                    toast({ title: 'Action Failed', description: error.message || 'Please try again.', variant: 'destructive' });
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                            disabled={isSubmitting}
                        >
                            <X className="w-4 h-4 mr-2" />Cancel Request
                        </button>
                    )}

                    {session.status === 'scheduled' && (
                        <>
                            {/* Reschedule button */}
                            <button
                                className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-base font-medium hover:bg-gray-50 transition-colors"
                                onClick={() => handleAction('reschedule')}
                                disabled={isLockedIn || isSubmitting}
                                title={isLockedIn ? "Cannot reschedule within 4 hours of start time" : "Request to reschedule this session"}
                            >
                                {isLockedIn ? <Lock className="w-4 h-4 mr-2" /> : <Calendar className="w-4 h-4 mr-2" />}
                                {isLockedIn ? 'Reschedule Locked' : 'Reschedule'}
                            </button>

                            {/* Cancel button */}
                            <button
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-base font-medium transition-colors"
                                onClick={async () => {
                                    setIsSubmitting(true);
                                    try {
                                        const res = await adjustVouchScoreAction({
                                            userId: currentUser.uid,
                                            sessionId: session.id,
                                            eventType: isLockedIn ? 'CANCELLED_LOCKED_IN' : 'CANCELLED_WITH_NOTICE',
                                        });
                                        if (res?.success) {
                                            const undoId = res.data?.undoId;
                                            if (undoId) {
                                                onCancel(undoId);
                                                // toast removed: handled by UndoNotification at top level
                                            } else {
                                                toast({ title: 'Session Cancelled', description: res.data?.message || 'Session has been cancelled.' });
                                            }
                                        } else {
                                            toast({ title: 'Error', description: res?.error || 'An unexpected error occurred.', variant: 'destructive' });
                                        }
                                    } catch (error: any) {
                                        toast({ title: 'Action Failed', description: error.message || 'Please try again.', variant: 'destructive' });
                                    } finally {
                                        setIsSubmitting(false);
                                    }
                                }}
                                disabled={isSubmitting}
                            >
                                <X className="w-4 h-4 mr-2" />
                                {isLockedIn ? 'Cancel (No-Show)' : 'Cancel Session'}
                            </button>

                            {/* Start button with proper window check */}
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-base font-medium transition-colors"
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
                            </button>
                        </>
                    )}

                    {session.status === 'in_progress' && (
                        <>
                            {isCompletionWindow ? (
                                <>
                                    <p className="text-sm text-gray-600 mr-auto font-medium">Did the session go well?</p>
                                    <button
                                        className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-base font-medium hover:bg-gray-50 transition-colors"
                                        onClick={() => handleAction('complete_no')}
                                        disabled={isSubmitting}
                                    >
                                        <AlertTriangle className="w-4 h-4 mr-2" />Report Issue
                                    </button>
                                    <button
                                        className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-base font-medium transition-colors"
                                        onClick={() => handleAction('complete_yes')}
                                        disabled={isSubmitting}
                                    >
                                        <Check className="w-4 h-4 mr-2" />Confirm Completion
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button disabled className="w-full cursor-not-allowed bg-gray-100 text-gray-400 px-4 py-2 rounded-lg text-base font-medium">
                                        <Clock className="w-4 h-4 mr-2" />Completion Window Opens in {Math.ceil((scheduledStartTime.getTime() + (session.durationMinutes * 60 * 1000) - now.getTime()) / (1000 * 60))}m
                                    </button>
                                </>
                            )}
                        </>
                    )}

                    {session.status === 'in_progress' && (
                        <>
                            <p className="text-sm text-gray-600 mr-auto font-medium">Did the session go well?</p>
                            <button
                                className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-base font-medium hover:bg-gray-50 transition-colors"
                                onClick={() => handleAction('complete_no')}
                                disabled={isSubmitting}
                            >
                                <AlertTriangle className="w-4 h-4 mr-2" />Report Issue
                            </button>
                            <button
                                className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-base font-medium transition-colors"
                                onClick={() => handleAction('complete_yes')}
                                disabled={isSubmitting}
                            >
                                <Check className="w-4 h-4 mr-2" />Confirm Completion
                            </button>
                        </>
                    )}
                </div>
            </div>

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

            {/* Session Summary Modal */}
            {showSummary && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Session Summary</h2>
                        <p className="mb-2">Session duration: {Math.floor(sessionTimer / 60)}:{(sessionTimer % 60).toString().padStart(2, '0')}</p>
                        <h3 className="font-semibold mb-2">Attendance:</h3>
                        <ul className="mb-4">
                            {Object.entries(attendance).map(([userId, times]) => (
                                <li key={userId} className="mb-1">
                                    <span className="font-medium">{userId}</span>: Joined {times.joined.length}x, Left {times.left.length}x
                                </li>
                            ))}
                        </ul>
                        <Button onClick={() => setShowSummary(false)} className="w-full bg-[#6366f1] text-white hover:bg-[#4f2672]">Close</Button>
                    </div>
                </div>
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
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [lastCancelledSessionId, setLastCancelledSessionId] = useState<string | null>(null);
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing' | 'scheduled' | 'past'>('incoming');

    // Called when user clicks cancel on a session
    const handleCancelSession = (undoId: string) => {
        // (You would call your cancel API here)
        setLastCancelledSessionId(undoId);
        // Optionally, optimistically update session state here
    };

    // Called when user clicks Undo
    const handleUndoCancellation = async (undoId: string) => {
        try {
            // Get Firebase ID token for current user
            const user = auth.currentUser;
            if (!user) throw new Error('User not authenticated');
            const idToken = await user.getIdToken();
            const response = await fetch('/api/undo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({ undoId })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to undo');
            setLastCancelledSessionId(null);
            toast({ title: 'Undo Successful', description: 'Session cancellation has been undone.' });
        } catch (error: any) {
            toast({ title: 'Undo Failed', description: error.message || 'Could not undo cancellation', variant: 'destructive' });
        }
    };

    // Called after 10s if user does nothing
    const handleUndoExpire = (undoId: string) => {
        // The backend will handle finalizing the session and applying penalties
        // We just need to clear the notification
        setLastCancelledSessionId(null);
        toast({
            title: 'Session Cancelled',
            description: 'The session has been permanently cancelled. Vouch score penalties may apply.',
            variant: 'destructive'
        });
    };

    // Fetch first page of sessions
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
                    handleFirestoreError(error);
                    setCurrentUserName(user.displayName || "User");
                }
                // Initial fetch
                setLoading(true);
                try {
                    const sessionsQuery = query(
                        collection(db, 'sessions'),
                        where('participantIds', 'array-contains', user.uid),
                        orderBy('scheduledStartTime', 'desc'),
                        limit(20)
                    );
                    const snapshot = await getDocs(sessionsQuery);
                    const fetchedSessions = snapshot.docs.map(doc => {
                        const data = doc.data();
                        const scheduledStartTime = (data.scheduledStartTime as Timestamp)?.toDate();
                        const videoJoinEnabledAt = (data.videoJoinEnabledAt as Timestamp)?.toDate();
                        const partnerId = data.initiatorId === user.uid ? data.recipientId : data.initiatorId;

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
                    setSessions(fetchedSessions);
                    setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
                    setHasMore(snapshot.docs.length === 20);
                } catch (error) {
                    handleFirestoreError(error);
                }
            } else {
                setCurrentUser(null);
                setCurrentUserName('');
            }
            setLoading(false);
        });
        return () => unsubscribeAuth();
    }, []);

    // Load more sessions
    const loadMoreSessions = async () => {
        if (!currentUser || !lastDoc) return;
        setLoading(true);
        try {
            const sessionsQuery = query(
                collection(db, 'sessions'),
                where('participantIds', 'array-contains', currentUser.uid),
                orderBy('scheduledStartTime', 'desc'),
                startAfter(lastDoc),
                limit(20)
            );
            const snapshot = await getDocs(sessionsQuery);
            const fetchedSessions = snapshot.docs.map(doc => {
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
            setSessions(prev => [...prev, ...fetchedSessions]);
            setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
            setHasMore(snapshot.docs.length === 20);
        } catch (error) {
            handleFirestoreError(error);
        } finally {
            setLoading(false);
        }
    };

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

    // Past sessions include only completed (optionally in_progress), not cancelled or pending_cancellation
    const past = sessions.filter(s =>
        ['completed'].includes(s.status) ||
        (s.scheduledStartTime <= now && ['completed', 'in_progress'].includes(s.status))
    );

    return (
        <div className="space-y-8 p-6">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900">My Sessions</h1>
                <p className="text-xl text-gray-600 mt-4">Manage and join your upcoming and past study sessions.</p>
            </div>

            <div className="space-y-8">
                <div className="flex space-x-8 border-b border-gray-200">
                    <button onClick={() => setActiveTab('incoming')} className={`pb-4 border-b-2 text-base font-medium ${activeTab === 'incoming' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-900'}`}>Incoming Requests {incoming.length > 0 && <span className="ml-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs">{incoming.length}</span>}</button>
                    <button onClick={() => setActiveTab('outgoing')} className={`pb-4 border-b-2 text-base font-medium ${activeTab === 'outgoing' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-900'}`}>Outgoing Requests {outgoing.length > 0 && <span className="ml-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs">{outgoing.length}</span>}</button>
                    <button onClick={() => setActiveTab('scheduled')} className={`pb-4 border-b-2 text-base font-medium ${activeTab === 'scheduled' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-900'}`}>Scheduled {scheduled.length > 0 && <span className="ml-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs">{scheduled.length}</span>}</button>
                    <button onClick={() => setActiveTab('past')} className={`pb-4 border-b-2 text-base font-medium ${activeTab === 'past' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-900'}`}>Past</button>
                </div>

                {loading ? (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200 h-[250px] animate-pulse"></div>
                        <div className="bg-white p-6 rounded-lg border border-gray-200 h-[250px] animate-pulse"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {activeTab === 'incoming' && (
                            incoming.length > 0 ? (
                                <div className="space-y-4">
                                    {incoming.map(s => (
                                        <SessionCard
                                            key={s.id}
                                            session={s}
                                            currentUser={currentUser}
                                            currentUserName={currentUserName}
                                            onCancel={handleCancelSession}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                                    <p className="text-gray-600">No incoming requests.</p>
                                </div>
                            )
                        )}
                        {activeTab === 'outgoing' && (
                            outgoing.length > 0 ? (
                                <div className="space-y-4">
                                    {outgoing.map(s => (
                                        <SessionCard
                                            key={s.id}
                                            session={s}
                                            currentUser={currentUser}
                                            currentUserName={currentUserName}
                                            onCancel={handleCancelSession}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                                    <p className="text-gray-600">No outgoing requests.</p>
                                </div>
                            )
                        )}
                        {activeTab === 'scheduled' && (
                            scheduled.length > 0 ? (
                                <div className="space-y-4">
                                    {scheduled.map(s => (
                                        <SessionCard
                                            key={s.id}
                                            session={s}
                                            currentUser={currentUser}
                                            currentUserName={currentUserName}
                                            onCancel={handleCancelSession}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                                    <p className="text-gray-600">No scheduled sessions. Go find a partner!</p>
                                </div>
                            )
                        )}
                        {activeTab === 'past' && (
                            past.length > 0 ? (
                                <div className="space-y-4">
                                    {past.map(s => (
                                        <SessionCard
                                            key={s.id}
                                            session={s}
                                            currentUser={currentUser}
                                            currentUserName={currentUserName}
                                            onCancel={handleCancelSession}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                                    <p className="text-gray-600">No past sessions yet.</p>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
            {/* Undo Notification for session cancellation */}
            {lastCancelledSessionId && (
                <UndoNotification
                    undoId={lastCancelledSessionId}
                    onUndo={handleUndoCancellation}
                    onExpire={handleUndoExpire}
                    message="Session has been cancelled."
                    duration={10000}
                />
            )}
            {hasMore && !loading && (
                <button onClick={loadMoreSessions} className="mt-4 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-base font-medium transition-colors">Load More</button>
            )}
            {loading && <div className="mt-4 text-center text-gray-600">Loading...</div>}
        </div>
    );
}