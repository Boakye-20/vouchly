'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import { useToast } from '@/hooks/use-toast';
import { Check, X, Clock, MessageSquare, AlertTriangle, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { format } from 'date-fns';

interface SessionCompletionModalProps {
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
        completionConfirmedBy?: { [key: string]: boolean };
        actualDuration?: number;
    };
    currentUserId: string;
    onComplete: (feedback: SessionFeedback) => Promise<void>;
    onReportIssue: (issue: string) => Promise<void>;
}

interface SessionFeedback {
    wouldStudyAgain: boolean;
    feedback: string;
    issues?: string;
}

export function SessionCompletionModal({
    isOpen,
    onClose,
    session,
    currentUserId,
    onComplete,
    onReportIssue
}: SessionCompletionModalProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<SessionFeedback>({
        feedback: '',
        wouldStudyAgain: true
    });
    const [issueReport, setIssueReport] = useState('');
    const [showIssueForm, setShowIssueForm] = useState(false);

    const isConfirmedByCurrentUser = session.completionConfirmedBy?.[currentUserId];
    const isConfirmedByPartner = session.completionConfirmedBy &&
        Object.keys(session.completionConfirmedBy).some(id => id !== currentUserId);

    const handleComplete = async () => {
        if (!feedback.feedback.trim()) {
            toast({
                title: 'Feedback Required',
                description: 'Please provide feedback about your session.',
                variant: 'destructive'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await onComplete(feedback);
            toast({
                title: 'Session Completed',
                description: 'Thank you for your feedback!',
            });
            onClose();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to complete session. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReportIssue = async () => {
        if (!issueReport.trim()) {
            toast({
                title: 'Issue Description Required',
                description: 'Please describe the issue you encountered.',
                variant: 'destructive'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await onReportIssue(issueReport);
            toast({
                title: 'Issue Reported',
                description: 'Your issue has been reported and will be reviewed.',
            });
            onClose();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to report issue. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Check className="h-5 w-5" />
                        Session Completion
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
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        Duration: {formatDuration(session.actualDuration || session.durationMinutes)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Completion Status */}
                    <Card>
                        <CardContent className="p-4">
                            <h4 className="font-semibold mb-3">Completion Status</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">You</span>
                                    <Badge variant={isConfirmedByCurrentUser ? 'default' : 'secondary'}>
                                        {isConfirmedByCurrentUser ? 'Completed' : 'Pending'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">{session.partnerInfo.name}</span>
                                    <Badge variant={isConfirmedByPartner ? 'default' : 'secondary'}>
                                        {isConfirmedByPartner ? 'Completed' : 'Pending'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Feedback Form */}
                    {!isConfirmedByCurrentUser && (
                        <Card>
                            <CardContent className="p-4 space-y-4">
                                <h4 className="font-semibold">Session Feedback</h4>

                                {/* Session Rating */}
                                <div>
                                    <Label className="text-sm font-medium">How was your session?</Label>
                                    <div className="flex gap-4 mt-2">
                                        <button
                                            onClick={() => setFeedback(prev => ({ ...prev, wouldStudyAgain: true }))}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${feedback.wouldStudyAgain
                                                ? 'bg-green-50 border-green-200 text-green-700'
                                                : 'bg-gray-50 border-gray-200 text-gray-600'
                                                }`}
                                        >
                                            <ThumbsUp className="h-4 w-4" />
                                            Would study again
                                        </button>
                                        <button
                                            onClick={() => setFeedback(prev => ({ ...prev, wouldStudyAgain: false }))}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${!feedback.wouldStudyAgain
                                                ? 'bg-red-50 border-red-200 text-red-700'
                                                : 'bg-gray-50 border-gray-200 text-gray-600'
                                                }`}
                                        >
                                            <ThumbsDown className="h-4 w-4" />
                                            Wouldn't study again
                                        </button>
                                    </div>
                                </div>



                                {/* Feedback Text */}
                                <div>
                                    <Label htmlFor="feedback" className="text-sm font-medium">
                                        Additional feedback (optional)
                                    </Label>
                                    <Textarea
                                        id="feedback"
                                        placeholder="Share your experience, suggestions, or any comments..."
                                        value={feedback.feedback}
                                        onChange={(e) => setFeedback(prev => ({ ...prev, feedback: e.target.value }))}
                                        className="mt-2"
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Issue Reporting */}
                    {!isConfirmedByCurrentUser && (
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold">Report an Issue</h4>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowIssueForm(!showIssueForm)}
                                    >
                                        {showIssueForm ? 'Cancel' : 'Report Issue'}
                                    </Button>
                                </div>

                                {showIssueForm && (
                                    <div className="space-y-3">
                                        <Textarea
                                            placeholder="Describe the issue you encountered..."
                                            value={issueReport}
                                            onChange={(e) => setIssueReport(e.target.value)}
                                            rows={3}
                                        />
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleReportIssue}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <AlertTriangle className="h-4 w-4 mr-2" />
                                            )}
                                            Report Issue
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Close
                        </Button>
                        {!isConfirmedByCurrentUser && (
                            <Button
                                onClick={handleComplete}
                                disabled={isSubmitting}
                                className="flex-1"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Check className="h-4 w-4 mr-2" />
                                )}
                                Complete Session
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 