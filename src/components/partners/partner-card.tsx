'use client';

import { useState } from 'react';
import { GraduationCap, MapPin, Users, ShieldCheck } from 'lucide-react';
import { StudyRequestModal } from './study-request-modal';
import { PartnerProfileModal } from './partner-profile-modal';

interface PartnerCardProps {
    partner: any;
    currentUser: any;
    disableViewProfile?: boolean;
}

export function PartnerCard({ partner, currentUser, disableViewProfile }: PartnerCardProps) {
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    const getMatchRank = (score: number) => {
        if (score >= 80) return { rank: 'Gold', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' };
        if (score >= 60) return { rank: 'Silver', color: 'text-gray-700 bg-gray-50 border-gray-200' };
        if (score >= 40) return { rank: 'Bronze', color: 'text-orange-700 bg-orange-50 border-orange-200' };
        return { rank: 'Low', color: 'text-orange-600 bg-orange-50 border-orange-200' };
    };

    const matchRank = getMatchRank(partner.matchScore || 50);

    // Vouch Score accent colour
    const getVouchScoreColor = (score: number) => {
        if (score >= 85) return 'text-green-600';
        if (score >= 70) return 'text-amber-600';
        return 'text-red-600';
    };
    // Subject accent
    const subjectColor = 'text-purple-600';
    // University accent
    const universityColor = 'text-blue-600';
    // Co-studying atmosphere accent
    const getAtmosphereColor = (atmosphere: string) => {
        if (atmosphere === 'Motivational & Social') return 'text-green-600';
        if (atmosphere === 'Quietly Co-working') return 'text-amber-600';
        if (atmosphere === 'Silent & Independent') return 'text-blue-600';
        return 'text-slate-500';
    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:bg-blue-50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white font-medium text-lg">
                            {partner.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-medium text-lg text-gray-900">{partner.name}</h3>
                            <p className={`text-sm ${subjectColor}`}>{partner.subject || partner.course}</p>
                        </div>
                    </div>
                    <div className="text-right space-y-1">
                        {/* Match badge with gold/silver/bronze style and icon */}
                        {(() => {
                            let bg = 'bg-blue-600', border = 'border-blue-600', text = 'text-white', icon = null;
                            if (matchRank.rank === 'Gold') {
                                bg = 'bg-yellow-400'; border = 'border-yellow-400'; text = 'text-yellow-900';
                                icon = <svg className="inline h-4 w-4 mr-1 text-yellow-700" fill="currentColor" viewBox="0 0 20 20"><polygon points="10,2 12.59,7.36 18.51,8.09 14,12.26 15.18,18.02 10,15.1 4.82,18.02 6,12.26 1.49,8.09 7.41,7.36" /></svg>;
                            } else if (matchRank.rank === 'Silver') {
                                bg = 'bg-gray-300'; border = 'border-gray-300'; text = 'text-gray-800';
                                icon = <svg className="inline h-4 w-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" /></svg>;
                            } else if (matchRank.rank === 'Bronze') {
                                bg = 'bg-orange-300'; border = 'border-orange-300'; text = 'text-orange-900';
                                icon = <svg className="inline h-4 w-4 mr-1 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><polygon points="10,3 17,17 3,17" /></svg>;
                            }
                            return (
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-sm uppercase ${bg} ${border} ${text}`} style={{ letterSpacing: '0.05em' }}>
                                    {icon}
                                    {matchRank.rank} Match
                                </div>
                            );
                        })()}
                        {/* Vouch Score: label, logo, and number on one line */}
                        <span className={`text-xs font-semibold flex items-center gap-2 justify-end`}>
                            Vouch Score
                            <span className={`flex items-center gap-1 ${getVouchScoreColor(partner.vouchScore ?? 80)}`}>
                                <ShieldCheck className="h-4 w-4" />
                                {partner.vouchScore}
                            </span>
                        </span>
                    </div>
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-slate-600">
                        <GraduationCap className="h-4 w-4 mr-2 text-slate-400" />
                        {partner.yearOfStudy || 'Year 1'}
                    </div>
                    <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                        <span className={universityColor}>{partner.university}</span>
                    </div>
                    <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-2 text-slate-400" />
                        <span className={getAtmosphereColor(partner.coStudyingAtmosphere)}>
                            Prefers: {partner.coStudyingAtmosphere || 'Any atmosphere'}
                        </span>
                    </div>
                </div>

                <p className="text-sm text-slate-700 mb-4 line-clamp-2">
                    {partner.bio || `${partner.course} student looking for study partners.`}
                </p>

                {disableViewProfile ? (
                    <button
                        className="w-full bg-gray-200 text-gray-400 px-6 py-3 rounded-lg text-base font-medium cursor-not-allowed"
                        disabled
                    >
                        View Profile
                    </button>
                ) : (
                    <button
                        onClick={() => setShowProfileModal(true)}
                        className="w-full bg-gray-900 hover:bg-blue-900 text-white px-6 py-3 rounded-lg text-base font-medium transition-colors"
                    >
                        View Profile
                    </button>
                )}
            </div>

            {showProfileModal && (
                <PartnerProfileModal
                    partner={partner}
                    currentUser={currentUser}
                    onClose={() => setShowProfileModal(false)}
                    onSendRequest={() => {
                        setShowProfileModal(false);
                        setShowRequestModal(true);
                    }}
                />
            )}

            {showRequestModal && (
                <StudyRequestModal
                    partner={partner}
                    currentUser={currentUser}
                    onClose={() => setShowRequestModal(false)}
                />
            )}
        </>
    );
}