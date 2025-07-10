'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface SessionTimerProps {
    startTime: Date;
    durationMinutes: number;
    isActive: boolean;
    onTimeUp?: () => void;
}

export function SessionTimer({
    startTime,
    durationMinutes,
    isActive,
    onTimeUp
}: SessionTimerProps) {
    const [timeElapsed, setTimeElapsed] = useState<number>(0);
    const [timeRemaining, setTimeRemaining] = useState<number>(durationMinutes * 60);
    const [isTimeUp, setIsTimeUp] = useState<boolean>(false);

    useEffect(() => {
        if (!isActive) return;

        const updateTimer = () => {
            const now = new Date().getTime();
            const start = startTime.getTime();
            const elapsed = Math.floor((now - start) / 1000);
            const remaining = Math.max(0, (durationMinutes * 60) - elapsed);

            setTimeElapsed(elapsed);
            setTimeRemaining(remaining);

            if (remaining <= 0 && !isTimeUp) {
                setIsTimeUp(true);
                onTimeUp?.();
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [startTime, durationMinutes, isActive, isTimeUp, onTimeUp]);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const getProgressPercentage = () => {
        const totalSeconds = durationMinutes * 60;
        return Math.min(100, (timeElapsed / totalSeconds) * 100);
    };

    const getStatusColor = () => {
        if (isTimeUp) return 'destructive';
        if (timeRemaining <= 300) return 'destructive'; // Last 5 minutes
        if (timeRemaining <= 600) return 'secondary'; // Last 10 minutes
        return 'default';
    };

    const getStatusIcon = () => {
        if (isTimeUp) return <CheckCircle className="h-4 w-4" />;
        if (timeRemaining <= 300) return <AlertTriangle className="h-4 w-4" />;
        return <Clock className="h-4 w-4" />;
    };

    if (!isActive) {
        return (
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Session Timer</span>
                        </div>
                        <Badge variant="secondary">Inactive</Badge>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-4">
                <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {getStatusIcon()}
                            <span className="text-sm font-medium">Session Timer</span>
                        </div>
                        <Badge variant={getStatusColor()}>
                            {isTimeUp ? 'Time Up' : 'Active'}
                        </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-primary h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${getProgressPercentage()}%` }}
                        />
                    </div>

                    {/* Time Display */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-xs text-muted-foreground">Elapsed</p>
                            <p className="text-lg font-bold">{formatTime(timeElapsed)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Remaining</p>
                            <p className={`text-lg font-bold ${timeRemaining <= 300 ? 'text-red-500' : ''}`}>
                                {formatTime(timeRemaining)}
                            </p>
                        </div>
                    </div>

                    {/* Session Info */}
                    <div className="text-xs text-muted-foreground text-center">
                        <p>Total Duration: {durationMinutes} minutes</p>
                        <p>Progress: {Math.round(getProgressPercentage())}%</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 