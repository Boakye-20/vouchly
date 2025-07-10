'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Clock, Video, AlertTriangle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface SessionStartConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: {
        id: string;
        scheduledStartTime: Date;
        durationMinutes: number;
        focusTopic: string;
        partnerInfo: {
            name: string;
            course: string;
            university: string;
            avatar?: string;
        };
        startConfirmedBy?: string[];
        videoRoomUrl?: string;
    };
    currentUserId: string;
    onConfirm: () => Promise<void>;
}

export function SessionStartConfirmationModal({
    isOpen,
    onClose,
    session,
    currentUserId,
    onConfirm
}: SessionStartConfirmationModalProps) {
    const { toast } = useToast();
    const [isConfirming, setIsConfirming] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);

    // Countdown timer for session start
    useEffect(() => {
        if (!isOpen) return;

        const updateTimer = () => {
            const now = new Date().getTime();
            const startTime = session.scheduledStartTime.getTime();
            const remaining = Math.max(0, startTime - now);
            setTimeRemaining(remaining);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [isOpen, session.scheduledStartTime]);

    const handleConfirm = async () => {
        setIsConfirming(true);
        try {
            await onConfirm();
            toast({
                title: 'Session Start Confirmed',
                description: 'You have confirmed you are ready to start the session.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to confirm session start. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsConfirming(false);
        }
    };

    const formatTimeRemaining = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const isConfirmedByCurrentUser = session.startConfirmedBy?.includes(currentUserId);
    const isConfirmedByPartner = session.startConfirmedBy?.some(id => id !== currentUserId);
    const bothConfirmed = session.startConfirmedBy?.length === 2;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Video className="h-5 w-5" />
                        Session Start Confirmation
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Session Info */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={session.partnerInfo.avatar} />
                                    <AvatarFallback>{session.partnerInfo.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{session.partnerInfo.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {session.partnerInfo.course} • {session.partnerInfo.university}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        {format(session.scheduledStartTime, 'MMM d, yyyy • h:mm a')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{session.focusTopic}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Video className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{session.durationMinutes} minutes</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Countdown Timer */}
                    {timeRemaining > 0 && (
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground mb-1">Session starts in</p>
                                    <p className="text-2xl font-bold text-primary">
                                        {formatTimeRemaining(timeRemaining)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Confirmation Status */}
                    <Card>
                        <CardContent className="p-4">
                            <h4 className="font-semibold mb-3">Confirmation Status</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">You</span>
                                    <Badge variant={isConfirmedByCurrentUser ? 'default' : 'secondary'}>
                                        {isConfirmedByCurrentUser ? 'Confirmed' : 'Pending'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">{session.partnerInfo.name}</span>
                                    <Badge variant={isConfirmedByPartner ? 'default' : 'secondary'}>
                                        {isConfirmedByPartner ? 'Confirmed' : 'Pending'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={isConfirming || isConfirmedByCurrentUser}
                            className="flex-1"
                        >
                            {isConfirming ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : isConfirmedByCurrentUser ? (
                                <Check className="h-4 w-4 mr-2" />
                            ) : (
                                <Check className="h-4 w-4 mr-2" />
                            )}
                            {isConfirming ? 'Confirming...' : isConfirmedByCurrentUser ? 'Confirmed' : 'Confirm Ready'}
                        </Button>
                    </div>

                    {/* Both Confirmed Message */}
                    {bothConfirmed && (
                        <Card className="border-green-200 bg-green-50">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 text-green-700">
                                    <Check className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                        Both participants confirmed! Session can now start.
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
} 