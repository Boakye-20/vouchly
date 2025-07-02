'use client';

import { X, Calendar, Clock, Camera, Users, Trophy, TrendingUp, BookOpen, Target, MapPin, Mail, Award, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PartnerProfileModalProps {
    partner: any;
    currentUser: any;
    onClose: () => void;
    onSendRequest?: () => void;
}

interface AvailabilityDay {
    day: string;
    times: string[];
}

export function PartnerProfileModal({ partner, currentUser, onClose, onSendRequest }: PartnerProfileModalProps) {
    const getVouchScoreRank = (score: number) => {
        if (score >= 90) return { rank: 'Gold', color: 'text-yellow-700 bg-yellow-50 border-yellow-400' };
        if (score >= 75) return { rank: 'Silver', color: 'text-gray-700 bg-gray-100 border-gray-400' };
        return { rank: 'Bronze', color: 'text-orange-800 bg-orange-50 border-orange-400' };
    };

    const getMatchRank = (score: number) => {
        if (score >= 80) return { rank: 'Gold', color: 'text-yellow-700 bg-yellow-50 border-yellow-400' };
        if (score >= 65) return { rank: 'Silver', color: 'text-gray-700 bg-gray-100 border-gray-400' };
        return { rank: 'Bronze', color: 'text-orange-800 bg-orange-50 border-orange-400' };
    };

    const calculateScheduleOverlap = (userAvail: any, partnerAvail: any): number => {
        if (!userAvail || !partnerAvail) return 0;
        let overlap = 0;
        let total = 0;

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const times = ['morning', 'afternoon', 'evening'];

        days.forEach(day => {
            times.forEach(time => {
                if (userAvail[day]?.[time]) {
                    total++;
                    if (partnerAvail[day]?.[time]) {
                        overlap++;
                    }
                }
            });
        });

        return total > 0 ? (overlap / total) * 100 : 0;
    };

    const getMatchReasons = (user: any, partner: any) => {
        const reasons = [];

        // Same university (high priority)
        if (user?.university === partner.university) {
            reasons.push({ label: 'Same University', value: partner.university });
        }

        // Same subject (high priority)
        if (user?.subject === partner.subject && partner.subject) {
            reasons.push({ label: 'Same Subject', value: partner.subject });
        } else if (user?.faculty === partner.faculty && partner.faculty) {
            reasons.push({ label: 'Same Faculty', value: partner.faculty });
        }

        // Vouch score similarity
        const vouchDiff = Math.abs((user?.vouchScore || 80) - (partner.vouchScore || 80));
        if (vouchDiff <= 10) {
            reasons.push({ label: 'Similar Vouch Score', value: `Both around ${partner.vouchScore}` });
        }

        // Weekly goal similarity
        if (user?.weeklySessionGoal && partner.weeklySessionGoal) {
            const goalDiff = Math.abs(user.weeklySessionGoal - partner.weeklySessionGoal);
            if (goalDiff <= 1) {
                reasons.push({ label: 'Similar Weekly Goals', value: `${partner.weeklySessionGoal} sessions/week` });
            }
        }

        // Study atmosphere match
        if (user?.coStudyingAtmosphere === partner.coStudyingAtmosphere && partner.coStudyingAtmosphere) {
            reasons.push({ label: 'Same Study Style', value: partner.coStudyingAtmosphere });
        }

        // Schedule overlap
        const scheduleOverlap = calculateScheduleOverlap(user?.availability, partner.availability);
        if (scheduleOverlap > 50) {
            reasons.push({ label: 'Good Schedule Overlap', value: `${Math.round(scheduleOverlap)}% matching times` });
        }

        return reasons.slice(0, 4); // Show top 4 reasons
    };

    const getAvailabilityDisplay = (availability: any): AvailabilityDay[] => {
        if (!availability) return [];
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const times = ['morning', 'afternoon', 'evening'];
        const available: AvailabilityDay[] = [];

        days.forEach(day => {
            const dayAvail: string[] = [];
            times.forEach(time => {
                if (availability[day]?.[time]) {
                    dayAvail.push(time);
                }
            });
            if (dayAvail.length > 0) {
                available.push({ day, times: dayAvail });
            }
        });

        return available;
    };

    const availability = getAvailabilityDisplay(partner.availability);
    const vouchRankInfo = getVouchScoreRank(partner.vouchScore || 80);
    const matchRankInfo = getMatchRank(partner.matchScore || 50);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="relative bg-purple-800 p-6 text-white">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-6">
                        {/* Avatar */}
                        <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-2xl font-semibold border-2 border-white/20">
                            {partner.name?.charAt(0).toUpperCase()}
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1">
                            <h2 className="text-2xl font-semibold mb-1">{partner.name}</h2>
                            <p className="text-white/90">{partner.course} • {partner.yearOfStudy || 'Year 1'}</p>
                            <p className="text-white/80 text-sm mt-1">{partner.university}</p>
                        </div>

                        {/* Match Rank Badge */}
                        <div className={`${matchRankInfo.color} px-4 py-2 rounded-md text-center border font-medium`}>
                            <div className="text-sm">Match Level</div>
                            <div className="text-lg font-semibold">{matchRankInfo.rank}</div>
                        </div>
                    </div>
                </div>

                {/* Content Tabs */}
                <Tabs defaultValue="overview" className="p-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="schedule">Schedule</TabsTrigger>
                        <TabsTrigger value="stats">Stats</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4 mt-6">
                        {/* Match Compatibility Breakdown */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-medium mb-3 text-gray-900">
                                Why You're a {matchRankInfo.rank} Match
                            </h3>
                            <div className="space-y-2">
                                {getMatchReasons(currentUser, partner).map((reason, index) => (
                                    <div key={index} className="flex items-start gap-2 text-sm">
                                        <span className="text-purple-600 mt-0.5">•</span>
                                        <div className="flex-1">
                                            <span className="font-medium text-gray-900">{reason.label}:</span>
                                            <span className="text-gray-700 ml-1">{reason.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bio Section */}
                        {partner.bio && (
                            <div>
                                <h3 className="font-medium mb-2 text-gray-900">About</h3>
                                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                                    {partner.bio}
                                </p>
                            </div>
                        )}

                        {/* Study Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-medium text-gray-600 mb-1">Faculty</h4>
                                <p className="text-gray-900">{partner.faculty || 'Not specified'}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-600 mb-1">Subject</h4>
                                <p className="text-gray-900">{partner.subject || 'Not specified'}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-600 mb-1">Study Style</h4>
                                <p className="text-gray-900">{partner.coStudyingAtmosphere || 'Not specified'}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-600 mb-1">Camera Preference</h4>
                                <p className="text-gray-900">{partner.cameraPreference || 'Not specified'}</p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="schedule" className="mt-6">
                        <h3 className="font-medium mb-4 text-gray-900">Available Times</h3>

                        {availability.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                                {availability.map((item: AvailabilityDay) => (
                                    <div key={item.day} className="border rounded-lg p-3">
                                        <h4 className="font-medium text-gray-900 mb-2">{item.day}</h4>
                                        <div className="flex gap-2">
                                            {item.times.map((time: string) => (
                                                <span key={time} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-md text-sm capitalize">
                                                    {time}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">No availability information provided</p>
                        )}
                    </TabsContent>

                    <TabsContent value="stats" className="mt-6">
                        <h3 className="font-medium mb-4 text-gray-900">Session Statistics</h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="text-sm text-gray-600 mb-1">Total Sessions</div>
                                    <div className="text-2xl font-semibold text-gray-900">{partner.sessionsCompleted || 0}</div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="text-sm text-gray-600 mb-1">Weekly Goal</div>
                                    <div className="text-2xl font-semibold text-gray-900">{partner.weeklySessionGoal || 3}</div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-sm text-gray-600 mb-1">Member Since</div>
                                <div className="text-lg font-medium text-gray-900">
                                    {partner.joinedDate ?
                                        new Date(partner.joinedDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
                                        : 'Recently joined'}
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-sm text-gray-600 mb-1">Partner Status</div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-medium text-gray-900">{vouchRankInfo.rank} Partner</span>
                                    <Badge className={vouchRankInfo.color} variant="outline">
                                        {partner.vouchScore} points
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Send Request Button */}
                <div className="px-6 pb-6 border-t pt-4">
                    <Button
                        onClick={onSendRequest}
                        className="w-full bg-purple-700 hover:bg-purple-800 text-white"
                        size="lg"
                    >
                        Send Study Request
                    </Button>
                </div>
            </div>
        </div>
    );
}