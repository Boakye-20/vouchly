'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Camera, Users, Trophy, TrendingUp, BookOpen, Target, MapPin, Mail, Award, CheckCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

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
    const [sessionHistory, setSessionHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [canViewHistory, setCanViewHistory] = useState(false);

    // Check if we can view session history
    useEffect(() => {
        const checkHistoryVisibility = async () => {
            if (!partner.id || !currentUser?.uid) return;

            try {
                const partnerDoc = await getDoc(doc(db, 'users', partner.id));
                if (partnerDoc.exists()) {
                    const partnerData = partnerDoc.data();
                    const visibility = partnerData.sessionHistoryVisibility || 'private';

                    // Check if current user can view history
                    let canView = false;
                    if (visibility === 'public') {
                        canView = true;
                    } else if (visibility === 'study-partners') {
                        // Check if current user has had sessions with this partner
                        const sessionsQuery = query(
                            collection(db, 'sessions'),
                            where('participantIds', 'array-contains', currentUser.uid),
                            where('participantIds', 'array-contains', partner.id),
                            where('status', '==', 'completed'),
                            limit(1)
                        );
                        const sessionsSnapshot = await getDocs(sessionsQuery);
                        canView = !sessionsSnapshot.empty;
                    }
                    // 'private' means no one can view except the user themselves

                    setCanViewHistory(canView);

                    // If can view, fetch session history
                    if (canView) {
                        await fetchSessionHistory();
                    }
                }
            } catch (error) {
                console.error('Error checking history visibility:', error);
            }
        };

        checkHistoryVisibility();
    }, [partner.id, currentUser?.uid]);

    const fetchSessionHistory = async () => {
        if (!partner.id) return;

        setLoadingHistory(true);
        try {
            const sessionsQuery = query(
                collection(db, 'sessions'),
                where('participantIds', 'array-contains', partner.id),
                where('status', '==', 'completed'),
                orderBy('scheduledStartTime', 'desc'),
                limit(10)
            );

            const snapshot = await getDocs(sessionsQuery);
            const sessions = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    scheduledStartTime: data.scheduledStartTime?.toDate(),
                    durationMinutes: data.durationMinutes,
                    focusTopic: data.focusTopic,
                    partnerNames: data.participantNames || {},
                    status: data.status
                };
            });

            setSessionHistory(sessions);
        } catch (error) {
            console.error('Error fetching session history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

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

        // 1. Schedule Overlap (40%)
        const scheduleOverlap = calculateScheduleOverlap(user?.availability, partner.availability);
        if (scheduleOverlap > 50) {
            reasons.push({ label: 'Good Schedule Overlap', value: `${Math.round(scheduleOverlap)}% matching times` });
        }

        // 2. Vouch Score Similarity (30%)
        const vouchDiff = Math.abs((user?.vouchScore || 80) - (partner.vouchScore || 80));
        if (vouchDiff <= 5) {
            reasons.push({ label: 'Very Similar Vouch Score', value: `Both ${user?.vouchScore || 80}-${partner.vouchScore}` });
        } else if (vouchDiff <= 10) {
            reasons.push({ label: 'Similar Vouch Score', value: `Both around ${partner.vouchScore}` });
        } else if (vouchDiff <= 20) {
            reasons.push({ label: 'Somewhat Similar Vouch Score', value: `Within 20 points` });
        }

        // 3. Subject Compatibility (15%)
        if (user?.subject === partner.subject && partner.subject) {
            reasons.push({ label: 'Same Subject', value: partner.subject });
        } else if (user?.subjectGroup && partner.subjectGroup && user.subjectGroup === partner.subjectGroup) {
            reasons.push({ label: 'Same Subject Group', value: partner.subjectGroup });
        }

        // 4. Study Atmosphere (10%)
        if (user?.coStudyingAtmosphere === partner.coStudyingAtmosphere && partner.coStudyingAtmosphere) {
            reasons.push({ label: 'Same Study Style', value: partner.coStudyingAtmosphere });
        }

        // 5. University Bonus (5%)
        if (user?.university === partner.university) {
            reasons.push({ label: 'Same University', value: partner.university });
        }

        return reasons;
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
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-blue-100">
                {/* Header */}
                <div className="relative bg-white border-b border-blue-100 p-6">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-blue-600 transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-6">
                        {/* Avatar */}
                        <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center text-2xl font-semibold text-white border-4 border-blue-100">
                            {partner.name?.charAt(0).toUpperCase()}
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-1">{partner.name}</h2>
                            <p className="text-gray-700">{partner.course} • {partner.yearOfStudy || 'Year 1'}</p>
                            <p className="text-blue-600 text-sm mt-1">{partner.university}</p>
                        </div>

                        {/* Match Rank Badge - gold/silver/bronze with icon */}
                        <div className="flex flex-col items-end">
                            {(() => {
                                let bg = 'bg-blue-600', border = 'border-blue-600', text = 'text-white', icon = null;
                                if (matchRankInfo.rank === 'Gold') {
                                    bg = 'bg-yellow-400'; border = 'border-yellow-400'; text = 'text-yellow-900';
                                    icon = <svg className="inline h-5 w-5 mr-2 text-yellow-700" fill="currentColor" viewBox="0 0 20 20"><polygon points="10,2 12.59,7.36 18.51,8.09 14,12.26 15.18,18.02 10,15.1 4.82,18.02 6,12.26 1.49,8.09 7.41,7.36" /></svg>;
                                } else if (matchRankInfo.rank === 'Silver') {
                                    bg = 'bg-gray-300'; border = 'border-gray-300'; text = 'text-gray-800';
                                    icon = <svg className="inline h-5 w-5 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" /></svg>;
                                } else if (matchRankInfo.rank === 'Bronze') {
                                    bg = 'bg-orange-300'; border = 'border-orange-300'; text = 'text-orange-900';
                                    icon = <svg className="inline h-5 w-5 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><polygon points="10,3 17,17 3,17" /></svg>;
                                }
                                return (
                                    <div className={`px-4 py-2 rounded-lg text-center border-2 font-bold shadow-lg text-base tracking-wide uppercase flex items-center gap-2 ${bg} ${border} ${text}`} style={{ letterSpacing: '0.05em' }}>
                                        {icon}
                                        Match Level: {matchRankInfo.rank}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>

                {/* Content Tabs */}
                <Tabs defaultValue="overview" className="p-6">
                    <TabsList className="grid w-full grid-cols-4 bg-blue-50 border border-blue-100 rounded-lg mb-6">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="schedule">Schedule</TabsTrigger>
                        <TabsTrigger value="stats">Stats</TabsTrigger>
                        {canViewHistory && (
                            <TabsTrigger value="history">Session History</TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4 mt-2">
                        {/* Match Compatibility Breakdown */}
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
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

                    <TabsContent value="stats" className="space-y-4 mt-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-lg p-4 bg-white border border-blue-100 flex flex-col items-start">
                                <div className="text-lg font-bold mb-1 text-blue-900">Vouch Score</div>
                                <div className="flex items-center text-base font-semibold text-blue-700 gap-1">
                                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                                    {partner.vouchScore}
                                </div>
                            </div>
                            <div className="rounded-lg p-4 bg-white border border-blue-100">
                                <div className="text-lg font-bold mb-1 text-blue-900">Total Sessions</div>
                                <div className={`text-base text-gray-900${(partner.totalSessions ?? 0) === 0 ? '' : ' font-semibold'}`}>{partner.totalSessions ?? 0}</div>
                            </div>
                            <div className="rounded-lg p-4 bg-white border border-blue-100">
                                <div className="text-lg font-bold mb-1 text-blue-900">Weekly Goal</div>
                                <div className={`text-base text-gray-900${(partner.weeklySessionGoal ?? 0) === 0 ? '' : ' font-semibold'}`}>{partner.weeklySessionGoal ?? 0}</div>
                            </div>
                            <div className="rounded-lg p-4 bg-white border border-blue-100">
                                <div className="text-lg font-bold mb-1 text-blue-900">Member Since</div>
                                <div className="text-base text-gray-900">{partner.memberSince ?? 'Recently joined'}</div>
                            </div>
                            <div className="rounded-lg p-4 bg-white border border-blue-100">
                                <div className="text-lg font-bold mb-1 text-blue-900">Partner Status</div>
                                <div className="text-base text-gray-900">{matchRankInfo.rank} Partner</div>
                            </div>
                        </div>
                    </TabsContent>

                    {canViewHistory && (
                        <TabsContent value="history" className="space-y-4 mt-6">
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 mb-4">
                                <h3 className="font-bold mb-2 text-gray-900">Recent Session History</h3>
                                <p className="text-sm text-gray-600">
                                    Showing {partner.name}'s completed sessions from the last 30 days.
                                </p>
                            </div>

                            {loadingHistory ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 animate-pulse">
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : sessionHistory.length > 0 ? (
                                <div className="space-y-3">
                                    {sessionHistory.map((session) => {
                                        const partnerName = session.partnerNames[partner.id] || 'Study Partner';
                                        const otherParticipants = Object.keys(session.partnerNames).filter(id => id !== partner.id);
                                        const otherNames = otherParticipants.map(id => session.partnerNames[id]).join(', ');

                                        return (
                                            <div key={session.id} className="bg-white p-4 rounded-lg border border-gray-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium text-gray-900">
                                                        Session with {otherNames}
                                                    </h4>
                                                    <span className="text-sm text-gray-500">
                                                        {format(session.scheduledStartTime, 'MMM dd, yyyy')}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <p><strong>Topic:</strong> {session.focusTopic}</p>
                                                    <p><strong>Duration:</strong> {session.durationMinutes} minutes</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No recent sessions found.</p>
                                </div>
                            )}
                        </TabsContent>
                    )}
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