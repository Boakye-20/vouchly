import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
    try {
        // Fetch all users
        const usersSnapshot = await adminDb.collection('users').get();
        const users = usersSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                uid: doc.id,
                email: data.email || '',
                name: data.name || '',
                university: data.university || '',
                course: data.course || '',
                subjectGroup: data.subjectGroup || '',
                yearOfStudy: data.yearOfStudy || '',
                vouchScore: data.vouchScore || 80,
                sessionsCompleted: data.sessionsCompleted || 0,
                status: data.status || 'offline',
                accountStatus: data.accountStatus || 'active',
                createdAt: data.createdAt || new Date(),
                lastActive: data.lastActive || null,
            };
        });

        // Calculate stats
        const totalUsers = users.length;
        const activeUsers = users.filter(user => user.accountStatus === 'active').length;
        const suspendedUsers = users.filter(user => user.accountStatus === 'suspended').length;

        return NextResponse.json({
            users,
            totalUsers,
            activeUsers,
            suspendedUsers,
        });
    } catch (error) {
        console.error('Admin Users API Error:', error);
        return NextResponse.json({ error: 'Failed to load users data' }, { status: 500 });
    }
} 