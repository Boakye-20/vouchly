'use client';

import { PartnerProfileModal } from './partner-profile-modal';
import { PartnerCard } from './partner-card';

export default function PartnerProfileModalDemo({ partner, currentUser }: { partner: any, currentUser: any }) {
    return (
        <div className="w-full py-12 space-y-8">
            <div className="w-full max-w-2xl mx-auto">
                <PartnerCard partner={partner} currentUser={currentUser} disableViewProfile />
            </div>
            <div className="w-full max-w-2xl mx-auto">
                <PartnerProfileModal partner={partner} currentUser={currentUser} onClose={() => { }} />
            </div>
        </div>
    );
} 