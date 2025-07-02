'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, MapPin, Users, Trophy } from 'lucide-react';
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
        if (score >= 80) return { rank: 'Gold', color: 'text-yellow-700 bg-yellow-50 border-yellow-400' };
        if (score >= 65) return { rank: 'Silver', color: 'text-gray-700 bg-gray-100 border-gray-400' };
        return { rank: 'Bronze', color: 'text-orange-800 bg-orange-50 border-orange-400' };
    };

    const matchRank = getMatchRank(partner.matchScore || 50);

    return (
        <>
            <Card className="hover:shadow-lg transition-all duration-200 border-gray-200">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-semibold text-lg">
                                {partner.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{partner.name}</h3>
                                <p className="text-sm text-gray-600">{partner.course}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <Badge className={`${matchRank.color} border font-medium`}>
                                <Trophy className="h-3 w-3 mr-1" />
                                {matchRank.rank} Match
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">Vouch: {partner.vouchScore}</p>
                        </div>
                    </div>

                    <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                            <GraduationCap className="h-4 w-4 mr-2" />
                            {partner.yearOfStudy || 'Year 1'} • {partner.subject || partner.course}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            {partner.university}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-2" />
                            Prefers: {partner.coStudyingAtmosphere || 'Any atmosphere'}
                        </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                        {partner.bio || `${partner.course} student looking for study partners.`}
                    </p>

                    <Button
                        size="sm"
                        onClick={() => setShowProfileModal(true)}
                        className="w-full bg-purple-700 hover:bg-purple-800 text-white"
                    >
                        View Profile
                    </Button>
                </CardContent>
            </Card>

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