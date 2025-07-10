'use client';

import { PartnerProfileModal } from './partner-profile-modal';

export default function PartnerProfileModalDemo({ partner, currentUser }: { partner: any, currentUser: any }) {
    return (
        <PartnerProfileModal
            partner={partner}
            currentUser={currentUser}
            onClose={() => { }}
        />
    );
} 