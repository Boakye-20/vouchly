'use client';

import { useState } from 'react';
import { GraduationCap, MapPin, Users, ShieldCheck } from 'lucide-react';
import { StudyRequestModal } from './study-request-modal';
import { PartnerProfileModal } from './partner-profile-modal';

interface PartnerCardProps {
    partner: any;
    currentUser: any;
}

export function PartnerCard({ partner, currentUser }: PartnerCardProps) {
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    const getMatchRank = (score: number) => {
        if (score >= 80) return { rank: 'Gold', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' };
        if (score >= 60) return { rank: 'Silver', color: 'text-gray-700 bg-gray-50 border-gray-200' };
        if (score >= 40) return { rank: 'Bronze', color: 'text-orange-700 bg-orange-50 border-orange-200' };
        return { rank: 'Low', color: 'text-orange-600 bg-orange-50 border-orange-200' };
    };

    const matchRank = getMatchRank(partner.matchScore || 50);

    return (
        <>
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white font-medium text-lg">
                            {partner.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-medium text-lg text-gray-900">{partner.name}</h3>
                            <p className="text-sm text-gray-600">{partner.course}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${matchRank.color}`}>
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            {matchRank.rank} Match
                        </div>
                        <div className="flex items-center justify-end mt-1">
                            <ShieldCheck className="h-3 w-3 mr-1 text-gray-400" />
                            <p className="text-xs text-gray-500">Vouch Score: {partner.vouchScore}%</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                        <GraduationCap className="h-4 w-4 mr-2 text-gray-500" />
                        {partner.yearOfStudy || 'Year 1'} • {partner.subject || partner.course}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        {partner.university}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                        Prefers: {partner.coStudyingAtmosphere || 'Any atmosphere'}
                    </div>
                </div>

                <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {partner.bio || `${partner.course} student looking for study partners.`}
                </p>

                <button
                    onClick={() => setShowProfileModal(true)}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg text-base font-medium transition-colors"
                >
                    View Profile
                </button>
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