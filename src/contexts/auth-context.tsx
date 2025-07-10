'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, getAuth } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError } from '@/hooks/use-toast';

interface AuthContextType {
    user: User | null;
    userData: any;
    loading: boolean;
    error: Error | null;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
    error: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            try {
                if (authUser) {
                    setUser(authUser);

                    // Fetch additional user data from Firestore
                    try {
                        const userDoc = await getDoc(doc(db, 'users', authUser.uid));
                        if (userDoc.exists()) {
                            setUserData(userDoc.data());
                        } else {
                            setUserData(null);
                        }
                    } catch (err) {
                        handleFirestoreError(err);
                        setUserData(null);
                    }
                } else {
                    setUser(null);
                    setUserData(null);
                }
            } catch (err) {
                console.error('Error in auth state change:', err);
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const value = {
        user,
        userData,
        loading,
        error,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
