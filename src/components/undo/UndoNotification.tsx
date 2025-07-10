'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Loader2 } from 'lucide-react';

interface UndoNotificationProps {
    // The ID of the action to be undone (e.g., session ID)
    undoId: string | null;
    // The function to call when the user clicks "Undo"
    onUndo: (undoId: string) => Promise<void>;
    // A callback for when the 10-second window expires
    onExpire: (undoId: string) => void;
    // The main text to display
    message: string;
    // The duration of the undo window in milliseconds
    duration?: number;
}

export function UndoNotification({
    undoId,
    onUndo,
    onExpire,
    message,
    duration = 10000, // Default to 10 seconds
}: UndoNotificationProps) {
    // State to track the percentage of time left for the animation
    const [progress, setProgress] = useState(100);
    const [isUndoing, setIsUndoing] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!undoId) return;

        // Set up a smooth interval to update the progress animation
        const interval = 50; // Update every 50ms for a smooth animation
        const totalSteps = duration / interval;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            const newProgress = 100 - (currentStep / totalSteps) * 100;
            setProgress(newProgress);

            if (newProgress <= 0) {
                clearInterval(timer);
                onExpire(undoId);
            }
        }, interval);

        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(timer);
    }, [undoId, duration, onExpire]);

    const handleUndo = async () => {
        if (!undoId) return;

        setIsUndoing(true);
        try {
            await onUndo(undoId);
            toast({
                title: 'Action Undone',
                description: 'The previous action has been successfully reversed.',
            });
            // The parent component will handle hiding this notification
        } catch (error) {
            console.error('Failed to undo:', error);
            toast({
                title: 'Error',
                description: 'Failed to undo the action. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsUndoing(false);
        }
    };

    // Constants for the circular progress SVG
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    if (!undoId) return null;

    return (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom">
            <div className="flex items-center gap-4 bg-background p-4 rounded-lg shadow-2xl border">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                <div className="flex-1">
                    <p className="font-medium text-sm">{message}</p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUndo}
                    disabled={isUndoing}
                    className="flex items-center gap-2 text-primary hover:text-primary/80"
                >
                    {isUndoing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        // --- Visual Countdown Timer ---
                        <div className="relative h-6 w-6">
                            <svg className="h-full w-full" viewBox="0 0 36 36">
                                <circle
                                    cx="18"
                                    cy="18"
                                    r={radius}
                                    fill="none"
                                    className="stroke-muted"
                                    strokeWidth="2"
                                />
                                <circle
                                    cx="18"
                                    cy="18"
                                    r={radius}
                                    fill="none"
                                    className="stroke-primary transition-all duration-100 ease-linear"
                                    strokeWidth="2"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    transform="rotate(-90 18 18)"
                                />
                            </svg>
                        </div>
                    )}
                    <span>{isUndoing ? 'Undoing...' : 'Undo'}</span>
                </Button>
            </div>
        </div>
    );
}