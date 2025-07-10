// src/components/sessions/reschedule-modal.tsx
"use client";

import { useState } from "react";
import { format, addDays, setHours, setMinutes, isBefore, startOfDay } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { rescheduleSessionAction } from "@/lib/actions";
import { sessionEvents } from '@/lib/google-analytics';

interface RescheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: {
        id: string;
        scheduledStartTime: Date;
        durationMinutes: number;
        partnerInfo: {
            id: string;
            name: string;
        };
    };
    currentUser: {
        uid: string;
        name: string;
    };
}

export function RescheduleModal({ isOpen, onClose, session, currentUser }: RescheduleModalProps) {
    const { toast } = useToast();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Generate time slots from 09:00 to 22:00 in 30-minute intervals
    const timeSlots: string[] = [];
    for (let hour = 9; hour <= 22; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            timeSlots.push(time);
        }
    }

    // --- NEW: State for time confirmation modal ---
    const [showTimeConfirm, setShowTimeConfirm] = useState(false);
    const [userTimezone, setUserTimezone] = useState<string | null>(null);
    const [partnerTimezone, setPartnerTimezone] = useState<string | null>(null);
    const [pendingDateTime, setPendingDateTime] = useState<Date | null>(null);

    const handleSubmit = async () => {
        if (!selectedDate || !selectedTime) {
            toast({
                title: "Missing Information",
                description: "Please select both a date and time.",
                variant: "destructive"
            });
            return;
        }

        const [hours, minutes] = selectedTime.split(':').map(Number);
        const newDateTime = setMinutes(setHours(selectedDate, hours), minutes);

        // Validate the new time is in the future
        if (isBefore(newDateTime, new Date())) {
            toast({
                title: "Invalid Time",
                description: "Please select a future date and time.",
                variant: "destructive"
            });
            return;
        }

        // Fetch timezones and show confirmation modal
        try {
            const { getUserTimezone } = await import('@/lib/timezone');
            const { getPartnerTimezone } = await import('@/lib/services/session-utils');
            const tz = await getUserTimezone(currentUser.uid);
            const ptz = await getPartnerTimezone(session.partnerInfo.id);
            setUserTimezone(tz || Intl.DateTimeFormat().resolvedOptions().timeZone);
            setPartnerTimezone(ptz || 'Europe/London');
            setPendingDateTime(newDateTime);
            setShowTimeConfirm(true);
        } catch (error) {
            toast({ title: 'Error', description: 'Could not load timezones', variant: 'destructive' });
        }
    };

    const handleConfirmTime = async () => {
        if (!pendingDateTime) return;
        setIsSubmitting(true);
        try {
            const result = await rescheduleSessionAction({
                sessionId: session.id,
                newDateTime: pendingDateTime,
                requesterId: currentUser.uid,
                requesterName: currentUser.name
            });
            if (result.success) {
                toast({
                    title: "Reschedule Request Sent",
                    description: "Your partner will be notified about the new time proposal."
                });
                onClose();
            } else {
                toast({
                    title: "Failed to Reschedule",
                    description: result.error || "Please try again.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
            setShowTimeConfirm(false);
            setPendingDateTime(null);
        }
    };

    const minDate = startOfDay(new Date());
    const maxDate = addDays(new Date(), 30);

    // --- Render reschedule time confirmation modal if needed ---
    const RescheduleTimeConfirmationModal = showTimeConfirm && userTimezone && partnerTimezone ?
        require('./RescheduleTimeConfirmationModal').default : null;

    return (
        <div>
            {showTimeConfirm && RescheduleTimeConfirmationModal && pendingDateTime && (
                <RescheduleTimeConfirmationModal
                    newDateTime={pendingDateTime}
                    durationMinutes={session.durationMinutes}
                    userTimezone={userTimezone}
                    partnerTimezone={partnerTimezone}
                    partnerName={session.partnerInfo.name}
                    onCancel={() => { setShowTimeConfirm(false); setPendingDateTime(null); }}
                    onConfirm={handleConfirmTime}
                />
            )}
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Reschedule Session</DialogTitle>
                        <DialogDescription>
                            Propose a new time for your session with {session.partnerInfo.name}.
                            They will need to accept the new time.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Current session: {format(session.scheduledStartTime, 'EEEE, d MMMM yyyy at HH:mm')}
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                            <Label htmlFor="date">Select New Date</Label>
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                disabled={(date) =>
                                    isBefore(date, minDate) ||
                                    !isBefore(date, maxDate)
                                }
                                className="rounded-md border"
                            />
                        </div>

                        {selectedDate && (
                            <div className="space-y-2">
                                <Label htmlFor="time">Select Time</Label>
                                <Select value={selectedTime} onValueChange={setSelectedTime}>
                                    <SelectTrigger id="time">
                                        <SelectValue placeholder="Choose a time slot" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {timeSlots.map((time) => (
                                            <SelectItem key={time} value={time}>
                                                <div className="flex items-center">
                                                    <Clock className="mr-2 h-4 w-4" />
                                                    {time}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {selectedDate && selectedTime && (
                            <Alert>
                                <CalendarIcon className="h-4 w-4" />
                                <AlertDescription>
                                    New proposed time: {format(selectedDate ?? new Date(), 'EEEE, d MMMM')} at {selectedTime}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !selectedDate || !selectedTime}
                        >
                            {isSubmitting ? "Sending..." : "Send Reschedule Request"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}