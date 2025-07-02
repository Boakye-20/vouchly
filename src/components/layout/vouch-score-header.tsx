'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Bell } from 'lucide-react';

export function VouchScoreHeader() {
    const [vouchScore, setVouchScore] = useState(80);

    useEffect(() => {
        if (!auth.currentUser) return;

        const unsubscribe = onSnapshot(
            doc(db, 'users', auth.currentUser.uid),
            (doc) => {
                if (doc.exists()) {
                    setVouchScore(doc.data().vouchScore || 80);
                }
            }
        );

        return () => unsubscribe();
    }, []);

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-end gap-4">
                <Bell className="h-5 w-5 text-gray-600 cursor-pointer hover:text-gray-900" />
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Vouch Score:</span>
                    <span className="text-lg font-bold text-purple-700">{vouchScore}%</span>
                </div>
            </div>
        </header>
    );
}