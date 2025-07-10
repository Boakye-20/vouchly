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
    const getMatchRank = (score: number) => {
        if (score >= 80) return { rank: 'Gold', color: 'text-yellow-700 bg-yellow-50 border-yellow-400' };
        if (score >= 60) return { rank: 'Silver', color: 'text-gray-700 bg-gray-100 border-gray-400' };
        if (score >= 40) return { rank: 'Bronze', color: 'text-orange-800 bg-orange-50 border-orange-400' };
        return { rank: 'Low', color: 'text-orange-700 bg-orange-50 border-orange-400' };
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
    const matchRankInfo = getMatchRank(partner.matchScore || 50);

    // Debug: Log the match score and computed rank
    console.log('[VOUCH DEBUG] Partner matchScore:', partner.matchScore, 'Computed rank:', getMatchRank(partner.matchScore || 50).rank);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#FFF5E6] rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="relative bg-primary text-primary-foreground p-6">
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
                        <div className="bg-[#FFF5E6] rounded-lg p-4">
                            <h3 className="font-bold mb-3 text-gray-900">
                                Why You're a {matchRankInfo.rank} Match
                            </h3>
                            <div className="space-y-2">
                                {(() => {
                                    const reasons = getMatchReasons(currentUser, partner);
                                    const matchScore = partner.matchScore || 50;

                                    if (reasons.length === 0) {
                                        if (matchScore < 40) {
                                            return <div className="text-gray-700">Limited compatibility due to different schedules, study preferences, or academic backgrounds.</div>;
                                        }
                                        return <div className="text-gray-700">You're a {matchRankInfo.rank} Match based on your profiles.</div>;
                                    }

                                    const topReasons = reasons.slice(0, 2);
                                    const reasonText = topReasons.map((r, i) => {
                                        if (r.label === 'Same University') return `you both study at ${r.value}`;
                                        if (r.label === 'Similar Vouch Score') return 'you have similar reliability scores';
                                        if (r.label === 'Same Subject') return `you both study ${r.value}`;
                                        if (r.label === 'Same Faculty') return `you are in the same faculty (${r.value})`;
                                        if (r.label === 'Same Study Style') return `you both prefer ${r.value.toLowerCase()}`;
                                        if (r.label === 'Good Schedule Overlap') return 'your schedules overlap well';
                                        return r.label.toLowerCase();
                                    }).join(' and ');

                                    if (matchScore < 40) {
                                        return (
                                            <div className="text-gray-700 font-normal">
                                                While {reasonText}, overall compatibility is limited. Try adjusting your filters for better matches.
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="text-gray-700 font-normal">
                                            You're a {matchRankInfo.rank} Match because {reasonText}.
                                        </div>
                                    );
                                })()}
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
                                <h4 className="text-lg font-bold mb-1">Faculty</h4>
                                <p className="text-base text-gray-900">{partner.faculty || 'Not specified'}</p>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold mb-1">Subject</h4>
                                <p className="text-base text-gray-900">{partner.subject || 'Not specified'}</p>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold mb-1">Study Style</h4>
                                <p className="text-base text-gray-900">{partner.coStudyingAtmosphere || 'Not specified'}</p>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold mb-1">Camera Preference</h4>
                                <p className="text-base text-gray-900">{partner.cameraPreference || 'Not specified'}</p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="schedule" className="mt-6">
                        <div className="p-4">
                            <h3 className="font-bold mb-3 text-gray-900">Available Times</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            <th className="text-left p-2 text-base font-bold">Day</th>
                                            <th className="text-center p-2 text-base font-bold">Morning<br /><span className="text-sm font-normal">9am-12pm</span></th>
                                            <th className="text-center p-2 text-base font-bold">Afternoon<br /><span className="text-sm font-normal">12pm-5pm</span></th>
                                            <th className="text-center p-2 text-base font-bold">Evening<br /><span className="text-sm font-normal">5pm-9pm</span></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                            <tr key={day} className="border-t">
                                                <td className="p-2 font-medium">{day}</td>
                                                {['morning', 'afternoon', 'evening'].map(time => (
                                                    <td key={time} className="text-center p-2">
                                                        {partner.availability?.[day]?.[time] ? (
                                                            <span className="inline-block bg-purple-100 text-purple-700 rounded px-3 py-1 text-xs font-bold">{time.charAt(0).toUpperCase() + time.slice(1)}</span>
                                                        ) : null}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="stats" className="space-y-4 mt-6 bg-[#FFF5E6] rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-lg p-4 bg-[#FFF5E6] border border-orange-100 flex flex-col items-start">
                                <div className="text-lg font-bold mb-1">Vouch Score</div>
                                <div className="flex items-center text-base font-semibold text-primary">
                                    <svg className="h-5 w-5 mr-1 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5.236a2 2 0 0 0-1.106-1.789l-6-3.2a2 2 0 0 0-1.788 0l-6 3.2A2 2 0 0 0 4 5.236V12c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
                                    {partner.vouchScore}%
                                </div>
                            </div>
                            <div className="rounded-lg p-4 bg-[#FFF5E6] border border-orange-100">
                                <div className="text-lg font-bold mb-1">Total Sessions</div>
                                <div className={`text-base text-gray-900${(partner.totalSessions ?? 0) === 0 ? '' : ' font-semibold'}`}>{partner.totalSessions ?? 0}</div>
                            </div>
                            <div className="rounded-lg p-4 bg-[#FFF5E6] border border-orange-100">
                                <div className="text-lg font-bold mb-1">Weekly Goal</div>
                                <div className={`text-base text-gray-900${(partner.weeklySessionGoal ?? 0) === 0 ? '' : ' font-semibold'}`}>{partner.weeklySessionGoal ?? 0}</div>
                            </div>
                            <div className="rounded-lg p-4 bg-[#FFF5E6] border border-orange-100">
                                <div className="text-lg font-bold mb-1">Member Since</div>
                                <div className="text-base text-gray-900">{partner.memberSince ?? 'Recently joined'}</div>
                            </div>
                            <div className="rounded-lg p-4 bg-[#FFF5E6] border border-orange-100">
                                <div className="text-lg font-bold mb-1">Partner Status</div>
                                <div className="text-base text-gray-900">{matchRankInfo.rank} Partner</div>
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