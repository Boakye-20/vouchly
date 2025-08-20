// src/lib/firebase-admin.ts
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Debug: Check if env vars are loaded
console.log('Firebase Admin Config Check:', {
    projectId: process.env.FIREBASE_PROJECT_ID ? 'Loaded' : 'Missing',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ? 'Loaded' : 'Missing',
    privateKey: process.env.FIREBASE_PRIVATE_KEY ? 'Loaded' : 'Missing'
});

let adminDb: ReturnType<typeof getFirestore>;
let adminAuth: ReturnType<typeof getAuth>;
let adminStorage: ReturnType<typeof getStorage>;

try {
    const firebaseAdminConfig = {
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        })
    };

    // Initialize Firebase Admin
    const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];
    adminDb = getFirestore(app);
    adminAuth = getAuth(app);
    adminStorage = getStorage(app);
    console.log('Firebase Admin initialized successfully');
} catch (error) {
    console.error('Firebase Admin initialization error:', error);
    throw error;
}

export { adminDb, adminAuth, adminStorage };