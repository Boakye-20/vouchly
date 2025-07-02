'use client';

import { useState } from 'react';
import { X, Calendar, Clock, Camera, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { collection, doc, writeBatch, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface StudyRequestModalProps {
    partner: any;
    currentUser: any;
    onClose: () => void;
}

export function StudyRequestModal({ partner, currentUser, onClose }: StudyRequestModalProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestData, setRequestData] = useState({
        date: '',
        time: '14:00',
        duration: '60 minutes',
        focusTopic: '',
        message: ''
    });

    const calculateMatchBreakdown = () => {
        let schedulePoints = partner.matchScore > 20 ? 20 : partner.matchScore;
        let vouchPoints = 30;
        let atmospherePoints = 10;
        let coursePoints = partner.subjectGroup === currentUser?.subjectGroup ? 15 : 5;
        let uniPoints = partner.university === currentUser?.university ? 5 : 0;
        const total = Math.round(partner.matchScore || 80);

        return {
            total,
            breakdown: [
                { label: 'Schedule Compatibility', value: schedulePoints, color: 'bg-green-500' },
                { label: 'Vouch Score Match', value: vouchPoints, color: 'bg-blue-500' },
                { label: 'Study Style', value: atmospherePoints, color: 'bg-purple-500' },
                { label: 'Course Relevance', value: coursePoints, color: 'bg-orange-500' },
                { label: 'Same University', value: uniPoints, color: 'bg-pink-500' }
            ]
        };
    };

    const handleSubmit = async () => {
        // Validate required fields
        if (!requestData.date) {
            toast({ title: 'Please select a date', variant: 'destructive' });
            return;
        }
        if (!requestData.focusTopic) {
            toast({ title: 'Focus Topic is required', description: "Tell your partner what you'd like to work on.", variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        try {
            // Prepare the data
            const scheduledStartTime = new Date(`${requestData.date}T${requestData.time}`);
            const durationMinutes = parseInt(requestData.duration.split(' ')[0]);

            // Create batch write for atomic operation
            const batch = writeBatch(db);

            // Create the session document
            const sessionRef = doc(collection(db, 'sessions'));
            batch.set(sessionRef, {
                initiatorId: currentUser.uid,
                recipientId: partner.uid,
                status: 'requested',
                createdAt: serverTimestamp(),
                participantIds: [currentUser.uid, partner.uid],
                participants: {
                    [currentUser.uid]: { name: currentUser.name },
                    [partner.uid]: { name: partner.name }
                },
                focusTopic: requestData.focusTopic,
                initialMessage: requestData.message,
                scheduledStartTime: Timestamp.fromDate(scheduledStartTime),
                durationMinutes: durationMinutes
            });

            // Create the notification for the recipient
            const notificationRef = doc(collection(db, `users/${partner.uid}/notifications`));
            batch.set(notificationRef, {
                text: `You have a new study request from ${currentUser.name}.`,
                link: '/dashboard/sessions',
                read: false,
                createdAt: serverTimestamp()
            });

            // Commit both operations atomically
            await batch.commit();

            toast({
                title: 'Request sent!',
                description: `Your study request has been sent to ${partner.name}`
            });

            onClose();

        } catch (error: any) {
            console.error('Error sending request:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to send request. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const matchData = calculateMatchBreakdown();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-2xl font-bold">Study Request for {partner.name}</h2>
                        <p className="text-gray-600">{partner.course} • {partner.yearOfStudy || 'Year 1'} • {partner.university}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold mb-4">Match Breakdown ({matchData.total}%)</h3>
                        <div className="space-y-3 mb-6">
                            {matchData.breakdown.map((item, index) => (
                                <div key={index}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>{item.label}</span>
                                        <span>+{item.value}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`${item.color} h-2 rounded-full`}
                                            style={{ width: `${item.value * (100 / 30)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <p className="text-sm">{partner.bio || `${partner.course} student looking for focused study sessions.`}</p>
                            <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4" />
                                <span>Atmosphere: {partner.coStudyingAtmosphere || 'Not specified'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Camera className="h-4 w-4" />
                                <span>Camera: {partner.cameraPreference || 'Not specified'}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Session Details</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="date">Date</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        id="date"
                                        type="date"
                                        value={requestData.date}
                                        onChange={(e) => setRequestData({ ...requestData, date: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 border rounded-lg"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="time">Time</Label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        id="time"
                                        type="time"
                                        value={requestData.time}
                                        onChange={(e) => setRequestData({ ...requestData, time: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 border rounded-lg"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="duration">Duration</Label>
                                <select
                                    id="duration"
                                    value={requestData.duration}
                                    onChange={(e) => setRequestData({ ...requestData, duration: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="60 minutes">60 minutes</option>
                                    <option value="90 minutes">90 minutes</option>
                                    <option value="120 minutes">120 minutes</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="topic">Focus Topic (e.g., Chapter 5 Review)</Label>
                                <input
                                    id="topic"
                                    type="text"
                                    value={requestData.focusTopic}
                                    onChange={(e) => setRequestData({ ...requestData, focusTopic: e.target.value })}
                                    placeholder="What will you be working on?"
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>

                            <div>
                                <Label htmlFor="message">Optional message...</Label>
                                <Textarea
                                    id="message"
                                    value={requestData.message}
                                    onChange={(e) => setRequestData({ ...requestData, message: e.target.value })}
                                    placeholder="Add a personal message to your request..."
                                    className="min-h-[80px]"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" onClick={onClose} className="flex-1">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isSubmitting ? 'Sending...' : 'Send Request'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}